import _ from 'lodash';
import store from '../../store';
import { sendScPattern } from '../../actions'

export default function sketch (p) {
  // primary data
  let message,
      totalCycleCount = 8,
      cycleResolution = 12,
      cycleIndex = 0,
      subCycleIndex = 0;

  // data management
  let samples = [];
  let startCycleNumber = 0;
  let activeMatrix = '';
    
  // interaction variables
  let mouseX, mouseY;
  let _w, _h;
  let isDraw = true;
  let isInteract = false;
  let isLabels = true;
  let dragStart = [0, 0];
  let dragEnd = [0, 0];
  let reload = false;

  // playback variables
  let isPlay = false;
  let time = 0;
  let serverLink = '';
  let pg = null;

  let c, gl, program;

  let canvasWorker;

  // Helper Functions
  const getObject = function(sample_name, sample_number, time) {
    let sample_index = _.findIndex(samples, ['s', sample_name]);
    if (sample_index >= 0 && samples[sample_index]) {
      let numbers = samples[sample_index].n;
      let number_index = _.findIndex(numbers, ['no', sample_number]);
      if (number_index >= 0 && numbers[number_index]) {
        let time_array = numbers[number_index].time;
        if (time_array[time])
          return [time_array[time], sample_index, number_index, time];
      } 
    } 
    
    return;
  }
  const getObjectByWorldCoordinates = function(mx, my) {
    let h = p.height/(samples.length);
    let sampleIndex = _.toInteger(my/h);
    if(samples[sampleIndex]){
      let numbers = samples[sampleIndex].n;
      let _h = h / numbers.length;
      let numberIndex = _.toInteger((my - sampleIndex*h)/_h);
      if(numbers[numberIndex].time) {
        let x = _.toInteger(p.map(mx, 0, p.width, 0, (cycleResolution*totalCycleCount)));
        if(numbers[numberIndex].time[x])
          return [numbers[numberIndex].time[x], sampleIndex, numberIndex, x];    
      }
    }
  }
  const getObjectPosition = function(mx, my) {
    let w = p.width/(cycleResolution*totalCycleCount);
    let h = p.height/(samples.length);
    let sampleIndex = _.toInteger(my/h);
    if(samples[sampleIndex]){
      let numbers = samples[sampleIndex].n;
      let _h = h / numbers.length;
      let numberIndex = _.toInteger((my - sampleIndex*h)/_h);
      if(numbers[numberIndex].time) {
        let x = _.toInteger(p.map(mx, 0, p.width, 0, (cycleResolution*totalCycleCount)));
        if(numbers[numberIndex].time[x])
          return [x*w, sampleIndex*h+numberIndex*_h, w, _h]    
      }
    }
  } 
  const resetExecution = (x) => {
    for(let a = 0; a < samples.length; a++) {
      for(let b = 0; b < samples[a].n.length; b++) {
        for(let c = 0; c < samples[a].n[b].time.length; c++){
          if (samples[a].n[b].time[c] && c >= x) {
            samples[a].n[b].time[c].executed = false;
          }
        }
      }
    }
  } 

  //
  // Initialize a texture and load an image.
  // When the image finished loading copy it into the texture.
  //
  // function loadTexture() {
  //   function isPowerOf2(value) {
  //     return (value & (value - 1)) === 0;
  //   }

  //   const texture = gl.createTexture();
  //   gl.bindTexture(gl.TEXTURE_2D, texture);

  //   let _temp = [];
  //   let _sum = 0;
  //   for(let a = 0; a < samples.length; a++) {
  //     _sum += samples[a].n.length;
  //     for(let b = 0; b < samples[a].n.length; b++) {
  //       for(let c = 0; c < samples[a].n[b].time.length; c++){
  //         if (samples[a].n[b].time[c]) {
  //           _temp[b*samples[a].n.length+c] = 150;
  //           _temp[b*samples[a].n.length+c+1] = 150;
  //           _temp[b*samples[a].n.length+c+2] = 150;
  //         }
  //         else {
  //           _temp[b*samples[a].n.length+c] = 0;
  //           _temp[b*samples[a].n.length+c+1] = 0;
  //           _temp[b*samples[a].n.length+c+2] = 0;
  //         }
  //       }
  //     }
  //   }

  //   const level = 0;
  //   const internalFormat = gl.RGB;
  //   const width = totalCycleCount*cycleResolution;
  //   const height = _sum;
  //   const border = 0;
  //   const srcFormat = gl.RGB;
  //   const srcType = gl.UNSIGNED_BYTE;
  //   const data = new Uint8Array(_temp);

  //   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
  //     width, height, border, srcFormat, srcType,
  //     data);

  //   if (isPowerOf2(width) && isPowerOf2(height)) {
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //     gl.generateMipmap(gl.TEXTURE_2D);
  //   } else {
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //   }

  //   return texture;
  // }

  // let vsSource = `
  //   attribute vec4 position;
  //   varying highp vec2 vTexCoord;

  //   void main() {
  //     vTexCoord = position.xy;
  //     gl_Position = vec4(position.xy,0.,1.);
  //   }`
  
  // let fsSource =  `
  //   precision highp float;

  //   varying highp vec2 vTexCoord;

  //   uniform mediump sampler2D texture;
  //   uniform float cycles;
  //   uniform float resolution;
  //   uniform float samples;

  //   uniform float time;
  //   uniform vec2 u_resolution;
    
  //   void main()
  //   {
  //     vec2 st = gl_FragCoord.xy/u_resolution.xy;
      
  //     float x = fract((st.x) * (cycles*resolution*0.5));
  //     float y = fract((st.y) * samples*0.5);

  //     if(x < 0.02 || x > 0.98) 
  //     {
  //       gl_FragColor = vec4(1.,1.,1.,0.1);
  //     }
  //     else if (y < 0.02 || y > 0.98) 
  //     {
  //       gl_FragColor = vec4(1.,0.,0.,0.2);
  //     }
  //     else
  //     {
  //       gl_FragColor = texture2D(texture, st);
  //     }
  //   }`

  p.setup = function () {
    p.createCanvas(1080, 95);
    
    // canvasWorker = new Worker("./src/components/sketches/tworker.js");
    // canvasWorker.postMessage({type : "resetCanvasTimer"});
    // canvasWorker.onmessage = function(e) {
    //   if (e.data.type === "seq") {
    //     time = e.data.time;
    //   }
    //   else if(e.data.type === "sendPattern") {
    //     store.dispatch(sendScPattern(serverLink, e.data.pattern));        
    //   }
    // }

    // p.createCanvas(1080, 95, p.WEBGL);

    // c = document.getElementById("defaultCanvas0");
    // c.width = p.width;
    // c.height = p.height;

    // gl = c.getContext("webgl");		

    // program = gl.createProgram();

    // //i leave the error-checking unminified
    // let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    // gl.shaderSource(vertexShader, vsSource);
    // gl.compileShader(vertexShader);
    // if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    //     console.error(gl.getShaderInfoLog(vertexShader));

    // let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    // gl.shaderSource(fragmentShader, fsSource);
    // gl.compileShader(fragmentShader);
    // if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
    //     console.error(gl.getShaderInfoLog(fragmentShader));

    // gl.attachShader(program, vertexShader);
    // gl.attachShader(program, fragmentShader);
    // gl.linkProgram(program);
    // if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    //     console.error(gl.getProgramInfoLog(program));
    
    // gl.useProgram(program);

    // //https://github.com/xem/MiniShadertoy/blob/gh-pages/index.html	
    // gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    // gl.enableVertexAttribArray(0);
    // gl.vertexAttribPointer(0,2,gl.BYTE,0,0,0);
    // gl.bufferData(gl.ARRAY_BUFFER, new Int8Array([-3,1,1,-3,1,1]), gl.STATIC_DRAW);
    
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    // resizing
    if (props.width && props.height && (_w !== props.width || _h !== props.height)) {
      _w = props.width;
      _h = props.height;
      p.resizeCanvas(_w, _h);

    }

    if (props.serverLink && serverLink !== props.serverLink) {
      serverLink = props.serverLink;
      //store.dispatch(sendScPattern(serverLink, "~d1 = ~dirt.orbits[0];"));
    }

    // clear data on scene change
    if (props.activeMatrix) {
      if(activeMatrix !== props.activeMatrix) {
        startCycleNumber = 0;
        samples = [];
        activeMatrix = props.activeMatrix;
      }
    }

    // if (props.play !== undefined) {
    //   if (isPlay !== props.play && props.play === true) {
    //     console.log('P5 TWORKER -- start');        
    //     canvasWorker.postMessage({type : "startCanvasTimer", 
    //                               cycle: totalCycleCount, 
    //                               resolution: cycleResolution,
    //                               samples: samples});
    //   }
    //   else if (isPlay !== props.play && props.play === false) {
    //     console.log('P5 TWORKER -- reset');
    //     canvasWorker.postMessage({type : "resetCanvasTimer"});
    //   }

    //   isPlay = props.play;
    // }

    // update resolution and number of total cycles displayed
    if (props.resolution && props.cycles) {
      cycleResolution = props.resolution;
      totalCycleCount = props.cycles;
    }

    // refreshes the view
    if (props.reload) {
      reload = props.reload;
      if(reload) {
        samples = [];
        if(props.message) startCycleNumber = _.toInteger(props.message.cycle);
        reload = false;
      }
    }

    // on message -- form a matrix
    // sample[i] = {s: 'bd', n: [{no: 0, time: [{asd},{asd},{afs},...]}
    if (props.message && message !== props.message && props.message.s !== undefined) {
      message = props.message;

      if (startCycleNumber === 0) {
        startCycleNumber = _.toInteger(message.cycle)
      }
      // clean current view
      if (startCycleNumber + totalCycleCount - 1 < _.toInteger(message.cycle)) {
        startCycleNumber = _.toInteger(message.cycle);
        
        samples = [];
      }
      
      message['executed'] = false;

      cycleIndex = _.toInteger(_.toNumber(message.cycle) - startCycleNumber);
      subCycleIndex = _.toInteger(_.toNumber(message.cycle)%1.0 * cycleResolution);
      
      let _n = message.n === undefined ? 0 : _.toInteger(message.n);
      let xcoord = cycleIndex*cycleResolution+subCycleIndex;
      
      let _index = _.findIndex(samples, ['s', message.s]);
      if(_index === -1){
      
        samples[samples.length] = {s: message.s, n: [{no: _n, time: []}]};
        samples = _.sortBy(samples, 's');
      }
      else {
        let sampleNumberArray = samples[_index].n;
        let _subindex = _.findIndex(sampleNumberArray, ['no', _n]);
        
        if(_subindex === -1) {
          let _t = [];
          _t[xcoord] = message;
          samples[_index].n[sampleNumberArray.length] = {no: _n, time: _t}
        }
        else {
          let _t = samples[_index].n[_subindex].time;
          _t[xcoord] = message;
          samples[_index].n[_subindex].time = _t;
        }
      }
    }
  };

  // KEYBOARD INTERACTIONS
  // p.keyPressed = function () {
  //   if (p.keyCode === p.SHIFT)  isInteract = true;
  // }
  // p.keyReleased = function () {
  //   if (p.keyCode === p.SHIFT)  isInteract = false;
  // }
  p.keyTyped = function () {
    if (p.key === 'l')  isLabels = !isLabels;
  }

  // MOUSE INTERACTIONS
  p.mouseMoved = function () {
    mouseX = p.mouseX;
    mouseY = p.mouseY;
  }

  // p.mousePressed = function () {
  //   dragStart = [mouseX, mouseY];
  // }
  // p.mouseReleased = function () {
  //   dragEnd = [p.mouseX, p.mouseY];

  //   if(dragEnd[0] >= 0 && dragEnd[0] < p.width && dragEnd[1] >= 0 && dragEnd[1] < p.height) { 
  //     if(isInteract && (p.abs(dragEnd[1]-dragStart[1]) > 5 || p.abs(dragEnd[0]-dragStart[0]) > 5)) {
  //       let h = p.height/(samples.length);
        
  //       let x = _.toInteger(p.map(dragStart[0], 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //       let y = _.toInteger(p.map(dragStart[1], 0, p.height, 0, (samples.length)))
  //       if(samples[y]) {
  //         let z = _.toInteger(p.map(dragStart[1], h*y, h*(y+1), 0, samples[y].n.length))
          
  //         let _x = _.toInteger(p.map(dragEnd[0], 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //         let _y = _.toInteger(p.map(dragEnd[1], 0, p.height, 0, (samples.length)))
  //         let _z = _.toInteger(p.map(dragEnd[1], h*_y, h*(_y+1), 0, samples[_y].n.length))
          
  //         console.log(_x,_y,_z, samples[y].n[z].time[x], samples[_y].n[_z].time[_x] );

  //         if (samples[y].n[z].time[x] !== undefined) {
  //           samples[_y].n[_z].time[_x] = samples[y].n[z].time[x];
  //           samples[_y].n[_z].time[_x].s = samples[_y].s;
  //           samples[_y].n[_z].time[_x].n = samples[_y].n[_z].no;
            
  //           delete samples[y].n[z].time[x];

  //           console.log(_x,_y,_z, samples[y].n[z].time[x], samples[_y].n[_z].time[_x] );
  //         }
  //       }
  //     }
  //     if (!isInteract) {
  //       time = _.toInteger(p.map(p.mouseX, 0, p.width, 0, (cycleResolution*totalCycleCount)));

  //       resetExecution(time)
  //     }
  //   }
  // }

  // p.mouseClicked = function () {
    
  //   if(isInteract && (p.abs(dragEnd[1]-dragStart[1]) < 5 && p.abs(dragEnd[0]-dragStart[0]) < 5)){
  //     let h = p.height/(samples.length);
      
  //     let x = _.toInteger(p.map(p.mouseX, 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //     let y = _.toInteger(p.map(p.mouseY, 0, p.height, 0, (samples.length)))
  //     if(samples[y]) {
  //       let z = _.toInteger(p.map(p.mouseY, h*y, h*(y+1), 0, samples[y].n.length))
  
  //       let obj = {};
  //       if (samples[y].n[z].time[x] === undefined) {
  //         obj = {
  //           's': samples[y].s,
  //           'n': samples[y].n[z].no,
  //           'executed': false,
  //           'cps' : 1,
  //           'cycle': p.map(x%cycleResolution, 0, cycleResolution, 0, 1),
  //           'speed': 1,
  //           'delay': 0,
  //           'delaytime' : 0,
  //           'end': 1,
  //           'gain': 1
  //         };
  //         samples[y].n[z].time[x] = obj;
  //       }else{
  //         console.log(samples[y].n[z].time[x]);
  //         delete samples[y].n[z].time[x];
  //       }
  //     }
  //   }
  // }

  p.draw = function () {

    // loadTexture();

    // //bind your uniforms here
    // gl.uniform1f(gl.getUniformLocation(program, "cycles"), totalCycleCount);
    // gl.uniform1f(gl.getUniformLocation(program, "resolution"), cycleResolution);
    // gl.uniform1f(gl.getUniformLocation(program, "samples"), samples.length);
    // gl.uniform1f(gl.getUniformLocation(program, "time"), p.millis());
    // gl.uniform2fv(gl.getUniformLocation(program, "u_resolution"), [p.width, p.height]);
    
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    
    try {
      p.background(30);

      p.fill(255, 0, 0)

      // Grid lines
      if(true){
        for(let rows = 0; rows < samples.length; rows++) {
          p.stroke(255, 15);
          p.line(0, rows*(p.height/samples.length), p.width, rows*(p.height/samples.length));
          for(let subrows = 1; subrows < samples[rows].n.length; subrows++) {
            let _y = rows*(p.height/samples.length) + subrows * (p.height/samples.length) / samples[rows].n.length;  
            p.stroke(255, 5);
            p.line(0, _y, p.width, _y);    
          }
        }
        for(let cols = 0; cols < cycleResolution*totalCycleCount; cols++) {
          p.stroke(255, cols%cycleResolution === 0 ? 30 : 5);
          p.line(cols*(p.width / (totalCycleCount*cycleResolution)), 0,
                cols*(p.width / (totalCycleCount*cycleResolution)), p.height);
        }
      }

      p.stroke(150);
    //  let _time = p.map(time, 0, totalCycleCount*cycleResolution, 0, p.width);
    //  p.line(_time, 0, _time, p.height);
      // if (isPlay) {
      //   // console.log(isPlay, time);
      //   if(time > p.width) {
      //     time -= p.width;

      //     resetExecution(0);        
      //   }

      //   time += p.width/(p.frameRate() * totalCycleCount)
      // }

      // Draw
      if (isDraw){
        // sample[i] = {s: 'bd', n: [{no: 0, time: [{}x96]]}
        for(let i = 0; i < samples.length; i++) {
          let _ns = samples[i].n;
          
          let w = p.width/(totalCycleCount*cycleResolution);
          let h = p.height/(samples.length);
          
          for (let j = 0; j < _ns.length; j++) {
            let _h = h / _ns.length;

            let y = i * h + j * _h;
            for (let k = 0; k < (totalCycleCount*cycleResolution); k++) {
              if (_ns[j].time && _ns[j].time[k]){
                let x = k * w;
    
                p.stroke(0);
                p.fill(200);
                p.rect(x, y, w, _h);
              }
            }
          }
        }
      }

      if (isLabels) {
        for(let i = 0; i < samples.length; i++) {
          let h = p.height/(samples.length);
          let y = i * h;
          p.fill(255, 150);
          p.rect(0, y+3, 15, h-3);
          p.push();
          p.fill(0);
          p.translate(7, y+h*0.5);
          p.rotate(p.HALF_PI);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(samples[i].s, 0, 0);
          p.pop();
          for (let j = 0; j < samples[i].n.length; j++) {
            let _h = h / samples[i].n.length;
            p.fill(255, 100);
            p.rect(17, y+j*_h+2, 15, _h-3);
            p.push();
            p.fill(0);
            p.translate(24, y+j*_h+_h*0.5);
            p.rotate(p.HALF_PI);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(samples[i].n[j].no, 0, 0);
            p.pop();
          }
        }
      }

      // Selection indicator
      // if(true){
      //   p.stroke(255, 0, 0);
      //   if (isInteract) p.fill(255, 0, 0, 50) 
      //   else            p.noFill();
        
      //   let pos = getObjectPosition(mouseX, mouseY);
      //   if(pos) {
      //     p.rect(pos[0], pos[1], pos[2], pos[3]);
      //   }
      // }

    }
    catch(exception) {
      console.log("Exception thrown: ", exception)
    }
  };
};
