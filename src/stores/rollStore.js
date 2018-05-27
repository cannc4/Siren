import {
    observable,
    action
} from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

import TreeModel from 'tree-model'
let math = require('mathjs')

class RollStore {
    sc_log_socket = io('http://localhost:4002/');
    // future_vis_socket = io('http://localhost:4006/');

    // Trigger value
    @observable value = {};
    @observable value_time = 0;
    @observable cycle_time_offset = 0;

    // Future triggers
    // @observable future_values = [];

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
    @observable evolutions = math.matrix(math.zeros([4, 4]));

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
            }
            else {
                this.cycle_time_offset = _.toInteger(this.value.cycle - this.value_time);
                
                // -- process data and render canvas
                this.processData();
                // this.renderCanvas();

                // -- update evolution matrices
                this.updateEvolutionMatrix();
            }
        }))

        // -- Future samples on execution
        // this.future_vis_socket.on('connect', (reason) => {
        //     console.log("Port 4006 Connected: ", reason);
        // });
        // this.future_vis_socket.on('disconnect', action((reason) => {
        //     console.log("Port 4006 Disconnected: ", reason);
        // }));
        // this.future_vis_socket.on("/vis", action((data) => {
        //     console.log("Processed Data: ", data);
        //     this.canvas_data = data;

        //     // refreshes the data for canvas
        //     this.updateCanvas();
        // }))
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

    // -- Update evolution matrices
    @action
    updateEvolutionMatrix() { 
        this.evolutions = math.eye(4);
        // let matrix_index = this.value.sirenChan;
        // if (matrix_index < this.evolutions.length) { 
        //     let matrix = this.evolutions[matrix_index];

//        }
    }

    // -- Decay evolution matrices
    @action
    decayEvolutionMatrix() { 
        this.evolutions = math.multiply(this.evolutions, 0.99);
        // for (let i = 0; i < 4; i++) {
        // }
    }    


    // -- Canvas functions 
    @action
    processData() {

        const node = {
            type: 'channel',
            value: _.toNumber(this.value.sirenChan),
            children: [{
                type: 'sample',
                value: this.value.s,
                children: [{
                    type: 'note',
                    value: this.value.n,
                    time: [this.value]
                }]
            }]
        };

        // initialize start cycle
        // if (this.tree_start_cycle === 0) {
        //     this.tree_start_cycle = _.toInteger(this.value.cycle);
        // }

        // // reset time
        // if (this.value.cycle > this.cycles + this.tree_start_cycle) {
        //     // delete all nodes
        //     this.treeRoot = null;
        //     this.tree_start_cycle = _.toInteger(this.value.cycle);
        // }
        //////////////

        // if its empty
        if (this.treeRoot === null) {
            this.treeRoot = this.tree.parse({
                type: 'root',
                value: -1,
                children: [node]
            });
        }

        // Delete old nodes
        this.treeRoot.all({strategy: 'post'},  (n) => { 
            if (n.model.type === 'note') { 
                n.model.time = _.dropWhile(n.model.time, (o) => { 
                    return o.cycle < this.value.cycle - this.cycles;
                });
                return n.model.time.length === 0;
            }
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        this.treeRoot.all({strategy: 'post'},  (n) => { 
            if (n.model.type === 'sample' && !n.hasChildren())
                return true;
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        this.treeRoot.all({strategy: 'post'},  (n) => { 
            if (n.model.type === 'channel' && !n.hasChildren())
                return true;
            return false;
        }).forEach(function (node) {
            node.drop();
        });
        ////////////////////////
        

        let channel_node;
        let sample_node;
        let note_node;
        channel_node = this.treeRoot.first({
            strategy: 'breadth'
        }, (n) => {
            if (n.model.type === 'channel' && n.model.value === node.value) {
                return true;
            }
            return false;
        });
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
                alpha: false
            });

            this.updateCanvasDimensions();
            let w = this.roll_canvas_element.width = this.dimensions_c[0];
            let h = this.roll_canvas_element.height = this.dimensions_c[1];
    
            // channel backgrounds
            if (this.treeRoot) { 

                for (let i = 0; i < this.treeRoot.children.length; i++) {
                    i % 2 === 0 ? ctx.fillStyle = "rgb(50, 50, 50)" : ctx.fillStyle = "rgb(40, 40, 40)";
        
                    ctx.fillRect(
                        0,
                        _.toInteger(h / (this.treeRoot.children.length) * i),
                        w,
                        _.toInteger(h / (this.treeRoot.children.length))
                    );
                }
        
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
        
                        ctx.fillStyle = "rgb(180, 180, 180)";
                        ctx.strokeStyle = "#111"
                        _.each(n.model.time, (item) => {
                            if (!item.rendered) {
                                ctx.fillStyle = "rgb(180, 100, 20)";
                                item.rendered = true;
                            }
                            
                            ctx.fillRect(
                                (((item.cycle-this.cycle_time_offset) - (this.value_time - this.cycles)) * this.resolution ) * _w,                            
                                //((item.cycle - (this.value.cycle - this.cycles)) * (this.resolution - 1)) * _w,
                                //((item.cycle - this.tree_start_cycle) * this.resolution) * _w,
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