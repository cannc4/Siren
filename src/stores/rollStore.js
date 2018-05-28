import {
    observable,
    action
} from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

import TreeModel from 'tree-model'
import math from 'mathjs'

class RollStore {
    sc_log_socket = io('http://localhost:4002/');

    // Trigger value
    @observable value = {};
    @observable value_time = 0;
    @observable cycle_time_offset = 0;

    // Pattern Roll Window parameters
    @observable resolution = 12;
    @observable cycles = 8;

    @observable dimensions_g = [200, 200];
    @observable dimensions_c = [200, 200];

    // pat roll
    @observable roll_canvas_element;
    @observable tree_start_cycle = 0;

    @observable treeRoot = null;
    @observable tree;

    // graphic evolution matrices // 4 limited
    @observable evolutions = _.fill(Array(4), math.matrix(math.eye(4)));
    def_value = 0;

    newWindows() { 
        window.open('localhost:3000/#');
    }

    constructor() {
        let ctx = this;

        // init tree
        this.tree = new TreeModel();

        // Sample value on trigger;
        this.sc_log_socket.on("/sclog", action((data) => {
            data.trigger['rendered'] = false;
            ctx.value = data.trigger;

            // -- init canvas 
            if (this.roll_canvas_element === null || this.roll_canvas_element === undefined) {
                this.roll_canvas_element = document.getElementById("pat_roll");
            } else {
                // update time-cycle offset
                if ( this.cycle_time_offset === 0)
                    this.cycle_time_offset = this.value.cycle - this.value_time;

                // -- process data and render canvas
                this.processData();

                // -- update evolution matrices for graphics
                this.updateEvolutionMatrices();
            }
        }))
    }

    // -- Module interaction
    @action
    updateCycles(c) {
        this.cycles = c;
    }
    @action
    updateResolution(r) {
        this.resolution = r;
    }

    // -- The dimensions 
    @action
    updateCanvasDimensions() {
        const element = document.getElementById('canvasLayout');
        if (element && element !== null) {
            const w = element.clientWidth;
            const h = element.clientHeight;

            this.dimensions_c = [w, h - 55];
            return;
        }
        this.dimensions_c = [800, 300];
    }
    @action
    updateGraphicsDimensions() {
        const element = document.getElementById('graphicsLayout');
        if (element && element !== null) {
            const w = element.clientWidth;
            const h = element.clientHeight;

            this.dimensions_g = [w, h - 40];
            return;
        }
        this.dimensions_g = [400, 400];
    }

    // -- Hot reload
    @action
    reloadRoll() {
        this.tree_start_cycle = _.toInteger(this.value.cycle);

        this.updateGraphicsDimensions();
        this.renderCanvas();
    }

    getAverageVariableOnChannel(channel_id, varName) { 
        if (channel_id < this.treeRoot.children.length) { 
            let variable = this.treeRoot.children[channel_id].model.average[[varName]];
            return (variable === undefined ? this.def_value : variable * 5);
        }
        return this.def_value;
    }

    // -- Update evolution matrices
    @action
    updateEvolutionMatrices() {
        let index = this.value.sirenChan;

        if (index === undefined) index = 0;

        if (index < this.evolutions.length) {
            this.evolutions[index] = math.matrix([
                [
                    this.getAverageVariableOnChannel(index, "delta"),
                    this.getAverageVariableOnChannel(index, "speed"),
                    this.getAverageVariableOnChannel(index, "note"),
                    this.getAverageVariableOnChannel(index, "n")
                ], [
                    this.getAverageVariableOnChannel(index, "begin"),
                    this.getAverageVariableOnChannel(index, "end"),
                    this.getAverageVariableOnChannel(index, "sustain"),
                    this.getAverageVariableOnChannel(index, "gain")
                ], [
                    this.getAverageVariableOnChannel(index, "lcutoff"),
                    this.getAverageVariableOnChannel(index, "hcutoff"),
                    this.getAverageVariableOnChannel(index, "resonance"),
                    this.getAverageVariableOnChannel(index, "comb")
                ], [
                    this.getAverageVariableOnChannel(index, "pan"),
                    this.getAverageVariableOnChannel(index, "shape"),
                    this.getAverageVariableOnChannel(index, "hall"),
                    this.getAverageVariableOnChannel(index, "coarse")
                ]
            ]);
        }
    }

    // -- Decay evolution matrices
    @action
    decayEvolutionMatrices() {
        for (let i = 0; i < this.evolutions.length; i++) {
            this.evolutions[i] = math.matrix(math.multiply(this.evolutions[i], 0.98));
        }
    }


    // -- Canvas functions 
    @action
    processData() {
        const node = {
            type: 'channel',
            value: _.toNumber(this.value.sirenChan),
            average: {},
            children: [{
                type: 'sample',
                value: this.value.s,
                average: {},
                children: [{
                    type: 'note',
                    value: this.value.n,
                    average: {},
                    time: [this.value]
                }]
            }]
        };

        // initalize average on the node
        _.each(_.keys(this.value), (k) => {
            node.children[0].children[0].average[k] = _.meanBy([this.value], (o) => { return o[k]; });
        })


        // if its empty
        if (this.treeRoot === null) {
            this.treeRoot = this.tree.parse({
                type: 'root',
                value: -1,
                children: [node]
            });
        }

        // Delete nodes older than spesified amount
        this.treeRoot.all({
            strategy: 'post'
        }, (n) => {
            if (n.model.type === 'note') {
                n.model.time = _.dropWhile(n.model.time, (o) => {
                    return o.cycle < _.toInteger(this.value.cycle - this.cycles);
                });
                
                // maintain average values of every field in note's array
                if (n.model.time.length !== 0)
                    _.each(_.keys(n.model.average), (k) => {
                        n.model.average[k] = _.meanBy(n.model.time, (o) => {
                            return (_.isNaN(_.toNumber(o[k])) ? this.def_value :_.toNumber(o[k]));
                        });
                    })
                
                return n.model.time.length === 0;
            }
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        this.treeRoot.all({
            strategy: 'post'
        }, (n) => {
            if (n.model.type === 'sample')
                if (!n.hasChildren())
                    return true;
                // maintain average values of every field in sample's children
                else {
                    let children_average = [];
                    _.each(n.children, (c) => {
                        children_average.push(c.model.average);
                    });
                    _.each(_.keys(children_average[0]), (k) => {
                        n.model.average[k] = _.meanBy(children_average, (o) => {
                            return (_.isNaN(_.toNumber(o[k])) ? this.def_value :_.toNumber(o[k]));
                        });
                    })
                }
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        this.treeRoot.all({
            strategy: 'post'
        }, (n) => {
            if (n.model.type === 'channel') {
                if (!n.hasChildren())
                    return true;
                // maintain average values of every field in channels's children
                else {
                    let children_average = [];
                    _.each(n.children, (c) => {
                        children_average.push(c.model.average);
                    });
                    _.each(_.keys(children_average[0]), (k) => {
                        n.model.average[k] = _.meanBy(children_average, (o) => {
                            return (_.isNaN(_.toNumber(o[k])) ? this.def_value :_.toNumber(o[k]));
                        });
                    })
                }
            }
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        ////////////////////////


        // Add new item
        let channel_node, sample_node, note_node;
        channel_node = this.treeRoot.first({
            strategy: 'breadth'
        }, (n) => {
            if (n.model.type === 'channel' && n.model.value === node.value) {
                return true;
            }
            return false;
        });
        // channel existence check
        if (channel_node === undefined) {
            channel_node = this.treeRoot.addChild(this.tree.parse(node));
        } else {
            sample_node = channel_node.first({
                strategy: 'breadth'
            }, (n) => {
                if (n.model.type === 'sample' && n.model.value === this.value.s) {
                    return true;
                }
                return false;
            });
            // sample existence check
            if (sample_node === undefined) {
                sample_node = channel_node.addChild(this.tree.parse(node.children[0]));
            } else {
                note_node = sample_node.first({
                    strategy: 'breadth'
                }, (n) => {
                    if (n.model.type === 'note' && n.model.value === this.value.n)
                        return true;
                    return false;
                });
                // note existence check
                if (note_node === undefined) {
                    sample_node.addChild(this.tree.parse(node.children[0].children[0]));
                } else {
                    note_node.model.time.push(this.value);
                }
            }
        }
    }

    @action
    renderCanvas() {
        if (this.roll_canvas_element) {

            let ctx = this.roll_canvas_element.getContext("2d", {
                alpha: true
            });

            this.updateCanvasDimensions();
            let w = this.roll_canvas_element.width = this.dimensions_c[0];
            let h = this.roll_canvas_element.height = this.dimensions_c[1];

            if (this.treeRoot) {
                // channel backgrounds
                for (let i = 0; i < this.treeRoot.children.length; i++) {
                    i % 2 === 0 ? ctx.fillStyle = "rgb(50, 50, 50)" : ctx.fillStyle = "rgb(40, 40, 40)";

                    ctx.fillRect(
                        0, _.toInteger(h / (this.treeRoot.children.length) * i),
                        w, _.toInteger(h / (this.treeRoot.children.length))
                    );
                }
                // TODO
                // background for samples and notes ?
                // grid lines

                // nodes
                this.treeRoot.walk({
                    strategy: 'post'
                }, (n) => {
                    // leaf node
                    if (!n.hasChildren()) {
                        const path = n.getPath();

                        const _w = w / (this.cycles * this.resolution);
                        const _c_h = h / (path[0].children.length);
                        const _c_i = path[1].getIndex();
                        const _s_h = _c_h / (path[1].children.length);
                        const _s_i = path[2].getIndex();
                        const _n_h = _s_h / (path[2].children.length);
                        const _n_i = path[3].getIndex();

                        _.each(n.model.time, (item) => {
                            // right-to-left
                            // let x = (((item.cycle - this.cycle_time_offset) - (this.value_time - this.cycles)) * (this.resolution - 1)) * _w;
                            
                            // left-to-right
                            let x = ((this.value_time - item.cycle + this.cycle_time_offset) * (this.resolution)) * _w;
                            
                            ctx.fillStyle = "rgba(180, 180, 180, " + (1-x/w) +")";
                            if (!item.rendered) {
                                ctx.fillStyle = "rgb(200, 20, 20)";
                                item.rendered = true;
                            }

                            ctx.fillRect(
                                x,
                                _c_i * _c_h + _s_h * _s_i + _n_i * _n_h,
                                _w * (item.sustain !== undefined ? item.sustain : 1),
                                _n_h
                            );
                        })
                    }
                });
            }
        }
    }
}

export default new RollStore();