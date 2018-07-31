import {
    observable,
    action,
    computed
} from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

import TreeModel from 'tree-model'
import math from 'mathjs'

class RollStore {
    sc_log_socket = io('http://localhost:4002/');

    // Trigger value
    value = {};
    value_time = 0;
    cycle_time_offset = 0;

    // Pattern Roll Window parameters
    @observable resolution = 12;
    @observable cycles = 8;

    @observable dimensions_g = [200, 200];
    @observable dimensions_c = [200, 200];

    // pat roll
    roll_canvas_element;
    tree_start_cycle = 0;

    treeRoot = null;
    tree;

    def_values = [
        [1, 0.5, 0, 0],
        [1, 1, 1, 1],
        [1, 0, 1, 0],
        [0, 0, 20000, 0]
    ];
   
    // graphic evolution matrices 
    // DO NOT MAKE OBSERVABLE
    evolutions = [
        math.matrix(math.eye(4)),
        math.matrix(math.eye(4)),
        math.matrix(math.eye(4)),
        math.matrix(math.eye(4))
    ];
    def_value = 0.5;

    // newWindows() { 
    //     window.open('localhost:3000/#');
    // }

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

            this.dimensions_c = [w, h - 35];
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
    reloadRoll(cleanTree = true) {
        if(cleanTree)
            this.cycle_time_offset = 0;

        this.updateGraphicsDimensions();
        this.renderCanvas();
    }

    getEvalMatItem(matrix_id, col, row) {
        if (matrix_id < this.evolutions.length) { 
            return this.evolutions[matrix_id].valueOf()[col][row];
        }
        return 0;
    }

    getAverageVariableOnChannel(channel_id, varName, defaultValue) { 
        // find the channel on tree
        let node = _.find(this.treeRoot.children, (o) => { 
            return o.model.value === channel_id;
        })

        if (node !== undefined) { 
            let variable = node.model.average[[varName]];
            return ((variable === undefined || _.isNaN(variable)) ? defaultValue : (variable));
        }
        return this.def_value;
    }

    // -- Update evolution matrices
    updateEvolutionMatrices() {
        let index = _.toInteger(this.value.sirenChan);

        if (index === undefined) index = 0;
        // console.log(index);

        if (index < this.evolutions.length) {
            this.evolutions[index].subset(math.index(0, 0), this.getAverageVariableOnChannel(index, "delta", 1));      // speed of progression  ( 0  1)    <~x~>    global velocity
            this.evolutions[index].subset(math.index(0, 1), this.getAverageVariableOnChannel(index, "pan", 0.5));      // position of sound     ( 0  1)    <~~~>    
            this.evolutions[index].subset(math.index(0, 2), this.getAverageVariableOnChannel(index, "n", 0));          // folder selector       ( 0  ~)    <~~~>
            this.evolutions[index].subset(math.index(0, 3), this.getAverageVariableOnChannel(index, "note", 0));       // freq of playback      (-60 60)   <~~~> 
            this.evolutions[index].subset(math.index(1, 0), this.getAverageVariableOnChannel(index, "coarse", 1));     // sr ratio (inv. frq)   ( 1 64)    <~~~> 
            this.evolutions[index].subset(math.index(1, 1), this.getAverageVariableOnChannel(index, "speed", 1));      // speed of playb.(frq)  (-9  9)    <~~~>    local velocity
            this.evolutions[index].subset(math.index(1, 2), this.getAverageVariableOnChannel(index, "gain", 1));       // volume of playback    ( 0  2)    <~~~> 
            this.evolutions[index].subset(math.index(1, 3), this.getAverageVariableOnChannel(index, "sustain", 1));    // dur. of playb. (s)    ( 0  ~)    <~~~> 
            this.evolutions[index].subset(math.index(2, 0), this.getAverageVariableOnChannel(index, "dub", 1));        // dub                   ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(2, 1), this.getAverageVariableOnChannel(index, "begin", 0));      // start of playb.       ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(2, 2), this.getAverageVariableOnChannel(index, "end", 1));        // end of playb.         ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(2, 3), this.getAverageVariableOnChannel(index, "hall", 0));       // reverb                ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(3, 0), this.getAverageVariableOnChannel(index, "shape", 0));      // distortion            ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(3, 1), this.getAverageVariableOnChannel(index, "resonance", 0));  // resonance             ( 0  1)    <~~~> 
            this.evolutions[index].subset(math.index(3, 2), this.getAverageVariableOnChannel(index, "cutoff", 20000)); // lfreq threshold       ( 0 20k)   <~~~> 
            this.evolutions[index].subset(math.index(3, 3), this.getAverageVariableOnChannel(index, "hcutoff", 0));    // hfreq threshold       ( 0 20k)   <~~~> 
        }
    }

    // -- Decay evolution matrix values towards their default values
    decayEvolutionMatrices() {
        for (let i = 0; i < this.evolutions.length; i++) {
            for (let j = 0; j < 16; j++) {
                const a = _.toInteger(j / 4);
                const b = j % 4;
                const val = this.evolutions[i].subset(math.index(a, b));
                this.evolutions[i].subset(math.index(a, b),
                    (val - this.def_values[a][b]) * 0.99 + this.def_values[a][b]);  
            }    
        }
    }


    // -- Canvas functions 
    cleanData() { 
        if (this.treeRoot !== null) {
            
            // Delete nodes older than spesified amount
            this.treeRoot.all({
                strategy: 'post'
            }, (n) => {
                if (n.model.type === 'note') {
                    n.model.time = _.dropWhile(n.model.time, (o) => {
                        const cycle_corres = this.cycle_time_offset + this.value_time;
                        return o.cycle < _.toInteger(cycle_corres - this.cycles);
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
                console.log("DROPPED NODE -- note: " + node.model.value + ' / sample: '+ node.parent.model.value+' / channel: '+ node.parent.parent.model.value);
                node.drop();
            });
            this.treeRoot.all({
                strategy: 'post'
            }, (n) => {
                if (n.model.type === 'sample') {
                    if (!n.hasChildren())
                        return true;
                    // maintain average values of every field in sample's children
                    else {
                        let merged_keys = {};
                        let children_average = [];
                        _.each(n.children, (c) => {
                            merged_keys = _.merge(merged_keys, c.model.average);
                            children_average.push(c.model.average);
                        });
                        _.each(_.keys(merged_keys), (k) => {
                            n.model.average[k] = _.meanBy(children_average, (o) => {
                                return (_.isNaN(_.toNumber(o[k])) ? this.def_value :_.toNumber(o[k]));
                            });
                        })
                    }
                }
                return false;
            }).forEach(function (node) {
                console.log("DROPPED NODE -- sample");
                node.drop();
            });
            this.treeRoot.all({
                strategy: 'breadth'
            }, (n) => {
                if (n.model.type === 'channel') {
                    if (!n.hasChildren())
                        return true;
                    // maintain average values of every field in channels's children
                    else {
                        let merged_keys = {};
                        let children_average = [];
                        _.each(n.children, (c) => {
                            merged_keys = _.merge(merged_keys, c.model.average);
                            children_average.push(c.model.average);
                        });
                        _.each(_.keys(merged_keys), (k) => {
                            n.model.average[k] = _.meanBy(children_average, (o) => {
                                return (_.isNaN(_.toNumber(o[k])) ? this.def_value :_.toNumber(o[k]));
                            });
                        })
                    }
                }
                return false;
            }).forEach(function (node) {
                console.log("DROPPED NODE -- channel");
                node.drop();
            });
        }
    }

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

    renderCanvas() {
        if (this.roll_canvas_element) {
            
            let ctx = this.roll_canvas_element.getContext("2d", {
                alpha: true
            });
            
            this.updateCanvasDimensions();
            let w = this.roll_canvas_element.width = this.dimensions_c[0];
            let h = this.roll_canvas_element.height = this.dimensions_c[1];
            
            if (this.treeRoot && this.treeRoot.children.length > 0) {
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
                            
                            
                            ctx.fillStyle = "rgba(180, 180, 180, " + (1 - x / w) + ")";
                            if (!item.rendered) {
                                ctx.fillStyle = "rgb(200, 20, 20)";
                                item.rendered = true;
                            }
                            
                            const sust = (item.sustain !== undefined ? item.sustain : 1);
                            
                            // console.log(x, _c_i * _c_h + _s_h * _s_i + _n_i * _n_h,
                            //     _w * sust,
                            //     _n_h,
                            
                            //     (1 - x / w));
                            ctx.fillRect(
                                x,
                                _c_i * _c_h + _s_h * _s_i + _n_i * _n_h,
                                _w * sust,
                                _n_h
                            );
                        })
                    }
                });
            }
        }
        else { 
            this.roll_canvas_element = document.getElementById("pat_roll");
        }
    }
}

export default new RollStore();