import { makeAutoObservable } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';
import TreeModel from 'tree-model';

class RollStore {
    sc_log_socket = io('http://localhost:4002/');
    value = {};
    value_time = 0;
    cycle_time_offset = 0;
    resolution = 12;
    cycles = 8;
    dimensions_g = [200, 200];
    dimensions_c = [200, 200];
    roll_canvas_element;
    tree_start_cycle = 0;
    treeRoot = null;
    tree;
    def_values = [[1, 0.5, 0, 0], [1, 1, 1, 1], [1, 0, 1, 0], [0, 0, 20000, 0]];
    def_value = 0.5;

    constructor() {
        makeAutoObservable(this);
        this.tree = new TreeModel();
        this.sc_log_socket.on("/sclog", (data) => {
            data.trigger['rendered'] = false;
            this.value = data.trigger;
            if (this.roll_canvas_element === null || this.roll_canvas_element === undefined) {
                this.roll_canvas_element = document.getElementById("pat_roll");
            } else {
                if (this.cycle_time_offset === 0) this.cycle_time_offset = this.value.cycle - this.value_time;
                this.processData();
            }
        });
    }

    updateCycles(c) { this.cycles = c; }
    updateResolution(r) { this.resolution = r; }

    updateRollDimensions() {
        const element = document.getElementById('canvasLayout');
        if (element) { this.dimensions_c = [element.clientWidth, element.clientHeight - 35]; return; }
        this.dimensions_c = [800, 300];
    }

    reloadRoll(cleanTree = true) {
        if (cleanTree) this.cycle_time_offset = 0;
        this.renderCanvas();
    }

    cleanData() {
        if (this.treeRoot !== null) {
            this.treeRoot.all({ strategy: 'post' }, (n) => {
                if (n.model.type === 'note') {
                    n.model.time = _.dropWhile(n.model.time, (o) => {
                        const cycle_corres = this.cycle_time_offset + this.value_time;
                        return o.cycle < _.toInteger(cycle_corres - this.cycles);
                    });
                    if (n.model.time.length !== 0) {
                        _.each(_.keys(n.model.average), (k) => {
                            n.model.average[k] = _.meanBy(n.model.time, (o) => _.isNaN(_.toNumber(o[k])) ? this.def_value : _.toNumber(o[k]));
                        });
                    }
                    return n.model.time.length === 0;
                }
                return false;
            }).forEach((node) => { node.drop(); });

            this.treeRoot.all({ strategy: 'post' }, (n) => {
                if (n.model.type === 'sample') {
                    if (!n.hasChildren()) return true;
                    let merged_keys = {}, children_average = [];
                    _.each(n.children, (c) => { merged_keys = _.merge(merged_keys, c.model.average); children_average.push(c.model.average); });
                    _.each(_.keys(merged_keys), (k) => { n.model.average[k] = _.meanBy(children_average, (o) => _.isNaN(_.toNumber(o[k])) ? this.def_value : _.toNumber(o[k])); });
                }
                return false;
            }).forEach((node) => { node.drop(); });

            this.treeRoot.all({ strategy: 'breadth' }, (n) => {
                if (n.model.type === 'channel') {
                    if (!n.hasChildren()) return true;
                    let merged_keys = {}, children_average = [];
                    _.each(n.children, (c) => { merged_keys = _.merge(merged_keys, c.model.average); children_average.push(c.model.average); });
                    _.each(_.keys(merged_keys), (k) => { n.model.average[k] = _.meanBy(children_average, (o) => _.isNaN(_.toNumber(o[k])) ? this.def_value : _.toNumber(o[k])); });
                }
                return false;
            }).forEach((node) => { node.drop(); });
        }
    }

    processData() {
        const node = {
            type: 'channel', value: _.toNumber(this.value.sirenChan), average: {},
            children: [{ type: 'sample', value: this.value.s, average: {},
                children: [{ type: 'note', value: this.value.n, average: {}, time: [this.value] }]
            }]
        };
        _.each(_.keys(this.value), (k) => { node.children[0].children[0].average[k] = _.meanBy([this.value], (o) => o[k]); });

        if (this.treeRoot === null) {
            this.treeRoot = this.tree.parse({ type: 'root', value: -1, children: [node] });
        }

        let channel_node = this.treeRoot.first({ strategy: 'breadth' }, (n) => n.model.type === 'channel' && n.model.value === node.value);
        if (channel_node === undefined) {
            channel_node = this.treeRoot.addChild(this.tree.parse(node));
        } else {
            let sample_node = channel_node.first({ strategy: 'breadth' }, (n) => n.model.type === 'sample' && n.model.value === this.value.s);
            if (sample_node === undefined) {
                sample_node = channel_node.addChild(this.tree.parse(node.children[0]));
            } else {
                let note_node = sample_node.first({ strategy: 'breadth' }, (n) => n.model.type === 'note' && n.model.value === this.value.n);
                if (note_node === undefined) sample_node.addChild(this.tree.parse(node.children[0].children[0]));
                else note_node.model.time.push(this.value);
            }
        }
    }

    renderCanvas() {
        if (this.roll_canvas_element) {
            let ctx = this.roll_canvas_element.getContext("2d", { alpha: true });
            this.updateRollDimensions();
            let w = this.roll_canvas_element.width = this.dimensions_c[0];
            let h = this.roll_canvas_element.height = this.dimensions_c[1];

            if (this.treeRoot && this.treeRoot.children.length > 0) {
                for (let i = 0; i < this.treeRoot.children.length; i++) {
                    ctx.fillStyle = i % 2 === 0 ? "rgb(50, 50, 50)" : "rgb(40, 40, 40)";
                    ctx.fillRect(0, _.toInteger(h / this.treeRoot.children.length * i), w, _.toInteger(h / this.treeRoot.children.length));
                }
                this.treeRoot.walk({ strategy: 'post' }, (n) => {
                    if (!n.hasChildren()) {
                        const path = n.getPath();
                        const _w = w / (this.cycles * this.resolution);
                        const _c_h = h / path[0].children.length, _c_i = path[1].getIndex();
                        const _s_h = _c_h / path[1].children.length, _s_i = path[2].getIndex();
                        const _n_h = _s_h / path[2].children.length, _n_i = path[3].getIndex();
                        _.each(n.model.time, (item) => {
                            let x = ((this.value_time - item.cycle + this.cycle_time_offset) * this.resolution) * _w;
                            ctx.fillStyle = "rgba(180, 180, 180, " + (1 - x / w) + ")";
                            if (!item.rendered) { ctx.fillStyle = "rgb(200, 20, 20)"; item.rendered = true; }
                            const sust = item.sustain !== undefined ? item.sustain : 1;
                            ctx.fillRect(x, _c_i * _c_h + _s_h * _s_i + _n_i * _n_h, _w * sust, _n_h);
                        });
                    }
                });
            }
        } else {
            this.roll_canvas_element = document.getElementById("pat_roll");
        }
    }
}

export default new RollStore();
