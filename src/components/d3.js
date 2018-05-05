// import _ from 'lodash';
import * as d3 from 'd3';
import '../styles/d3.css';

export default class D3 {
    constructor(size, min, max, res, cyc, drag) {
        this.size = size;
        this.min = min;
        this.max = max;
        this.res = res;
        this.cyc = cyc;
        this.drag = drag;

        this.marginInfo = this.buildMargins();
        this.svg = this.buildSvg(this.marginInfo);

        this.svg.append('g')
            .attr('id', 'trigs')
            .selectAll("rect")
            .data([])
            .enter().append("rect");
        
        // this.svg.append("g").attr('id', 'x-axis')
        //     .attr("transform", "translate(0," + this.size[1]-20 + ")")    
        //     .call(d3.axisBottom(this.getScaleX()));
        
        this.svg.append('g')
            .attr('id', 'timerLine')
            .append("line");
    }

    translateVis(dx, dy = 0) { 
        
        let w = (this.size[0]) / (this.res * this.cyc);
        this.svg.select('#trigs')
            .attr("transform", "translate(" + dx * w + ", " + dy + ")");
    }
    updateVariables(min, max, res, cyc, drag, DATA) { 
        this.min = min;
        this.max = max;
        this.res = res;
        this.cyc = cyc;
        this.drag = drag;

        this.svg.select("#trigs")
            .selectAll("rect")    
            .data(DATA)
            .enter().append("rect");
        
        this.svg.select("#trigs")
            .call(d3.axisBottom(this.getScaleX()));
    }

    getScaleX() { 
        let w = (this.size[0]) / (this.res * this.cyc);

        return d3.scaleLinear()
            .domain([this.min , this.min + this.cyc])
            .range([this.cyc*0.5 * this.res * w, this.cyc*1.5 * this.res * w]);
    }

    resize() { 
        let elem = document.getElementById("canvasLayout");
        if (elem !== undefined) {
            this.size = [elem.clientWidth, elem.clientHeight-50];
            this.svg
                .attr('width', this.size[0])
                .attr('height', this.size[1]);
        }
    }

    render(data) {
        let svg = this.svg;
        let xScale = this.getScaleX();

        svg.select("#trigs")
            .selectAll("rect")    
            .style('fill', '#ccc')
            .attr('x', (d, i) => {
                return xScale(d.obj.cycle);
            })
            .attr('y', (d, i) => {
                const h_c = (this.size[1]) / d.aux.c_n;
                const h_s = (h_c) / d.aux.s_n;
                const h_n = (h_s) / d.aux.n_n;  
                return d.aux.c_i * h_c + d.aux.s_i * h_s + d.aux.n_i * h_n;
            })
            .attr('height', d => {
                const h_c = (this.size[1]) / d.aux.c_n;
                const h_s = (h_c) / d.aux.s_n;
                return (h_s) / d.aux.n_n;
            })
            .attr('width', d => (this.size[0]) / (this.res * this.cyc));   
        
        svg.select('#timerLine > line')
            .style("stroke", '#ffc')    
            .attr("x1", this.size[0]/2)
            .attr("y1", 0)
            .attr("x2", this.size[0]/2)
            .attr("y2", this.size[1]);
    }
   
    buildMargins = () => {
        let margin = {top: 20, right: 10, bottom: 10, left: 10},
            width = this.size[0] - margin.left - margin.right,
            height = this.size[1] - margin.top - margin.bottom;
        return {margin, width, height};
    }
    
    
    buildSvg = (marginInfo) => {
        let { margin, width, height } = marginInfo;
        let svg = d3.select("#d3_visualizer").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
        return svg;
    }
}