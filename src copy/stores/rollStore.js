import { observable, action } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

import D3 from '../utils/d3'

class RollStore {
    sc_log_socket = io('http://localhost:4002/');
    future_vis_socket = io('http://localhost:4006/');

    // Trigger value
    @observable value = {};

    // Future triggers
    @observable future_values = [];

    // Pattern Roll Window parameters
    @observable resolution = 12;
    @observable cycles = 8;
    
    // d3 main object
    @observable d3_object; 

    // data organization
    @observable canvas_data = [];
    @observable canvas_min_cycle = 0;
    @observable canvas_max_cycle = 9999;

    // mouse variables x,y 
    @observable mouse = [0, 0];
    @observable prevMouse = [0, 0];
    @observable dragAmount = [0, 0];
    @observable mouseEvent = 'idle';

    constructor() {
        const ctx = this;
        // Sample value on trigger;
        this.sc_log_socket.on("/sclog", action((data) => {
            ctx.value = data.trigger;
            this.renderCanvas();
        }))

        // Future samples on execution
        this.future_vis_socket.on('connect', (reason) => {
            console.log("Port 4006 Connected: ", reason);
        });
        this.future_vis_socket.on('disconnect', action((reason) => {
            console.log("Port 4006 Disconnected: ", reason);
        }));
        this.future_vis_socket.on("/vis", action((data) => {
            console.log("Processed Data: ", data);
            this.canvas_data = data;

            // refreshes the data for canvas
            this.updateCanvas();
        }))
    }

    // Module functions
    @action updateCycles(c) {
        this.cycles = c;
    }
    @action updateResolution(r) {
        this.resolution = r;
    }
    @action reloadRoll() {
        if (this.d3_object !== undefined) { 
            this.d3_object.resize();
            this.d3_object.render();
        }
    }

    // mouse functions
    @action updateMouseEvent(event) { 
        this.mouseEvent = event;
    }
    @action updateMouse(mouseX, mouseY) { 
        this.mouse[0] = mouseX;
        this.mouse[1] = mouseY;

        if (this.mouseEvent === 'drag') {
            this.dragAmount[0] += this.mouse[0] - this.prevMouse[0];
            this.dragAmount[1] += this.mouse[1] - this.prevMouse[1];
            // console.log("Drag:", this.dragAmount.peek());
            
            this.renderCanvas();
        }
        this.prevMouse[0] = mouseX;
        this.prevMouse[1] = mouseY;
    }
   
    // initialize D3 object
    @action initD3() { 
        this.d3_object = new D3([1800, 190],
            this.canvas_min_cycle,
            this.canvas_max_cycle,
            this.resolution,
            this.value !== undefined ? this.value.cycles : 0,
            this.dragAmount[0]);
        this.d3_object.resize();
    }

    @action updateCanvas() { 
        // retrieve minimum and maximum values of the data
        this.canvas_min_cycle = _.minBy(this.canvas_data, (o) => { return o.obj.cycle; });
        this.canvas_max_cycle = _.maxBy(this.canvas_data, (o) => { return o.obj.cycle; });

        if (this.canvas_min_cycle !== undefined && this.canvas_max_cycle !== undefined) {
            this.canvas_min_cycle = this.canvas_min_cycle.obj.cycle;
            this.canvas_max_cycle = this.canvas_max_cycle.obj.cycle;
        }

        // Updates and renders the D3 Canvas
        if (this.d3_object !== undefined) { 
            this.d3_object.updateVariables(this.canvas_min_cycle,
                this.canvas_max_cycle,
                this.resolution,
                this.cycles,
                this.dragAmount[0],
                this.canvas_data);
            this.renderCanvas();
        }
    }
    @action renderCanvas() { 
        let timeOffset = 0;
        if (this.value.cycle !== undefined) {
            timeOffset = (this.value.cycle - this.canvas_min_cycle) * this.resolution; 
        }

        if (this.d3_object !== undefined) { 
            this.d3_object.translateVis(-timeOffset, 0);
            this.d3_object.resize();
            this.d3_object.render(this.canvas_data);
        }
    }
}

export default new RollStore();
