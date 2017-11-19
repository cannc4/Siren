import _ from 'lodash';
import store from '../../store';
import { consoleSubmit, resetClick, sendScPattern } from '../../actions'

export default function sketch (p) {
  // primary data
  let message,
      totalCycleCount = 8,
      cycleResolution = 12,
      sampleResolution = 4,
      cycleIndex = 0,
      subCycleIndex = 0;

  // data management
  let grid = [];
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

  // playback variables
  let isPlay = false;
  let isPaused = true;
  let time = 0;
  let playbackArray = [];
  let serverLink = '';

  p.setup = function () {
    p.createCanvas(1080, 95);
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
      store.dispatch(sendScPattern(serverLink, "~d1 = ~dirt.orbits[0];"));
    }

    // clear data on scene change
    if (props.activeMatrix) {
      if(activeMatrix !== props.activeMatrix) {
        startCycleNumber = 0;
        samples = [];
        grid = [];
        activeMatrix = props.activeMatrix;
      }
    }

    // on message -- form a matrix
    if (props.message && message !== props.message && props.message.s !== undefined) {
      message = props.message;

      if (startCycleNumber === 0) {
        startCycleNumber = _.toInteger(message.cycle)
      }
      // clean current view
      if (startCycleNumber + totalCycleCount - 1 < _.toInteger(message.cycle)) {
        startCycleNumber = _.toInteger(message.cycle);
        
        samples = [];
        grid = [];
        
        console.log('refresh: ', samples, grid);
      }
      
      // sample[i] = (16 * 12) x n-array
      
      cycleIndex = _.toInteger(_.toNumber(message.cycle) - startCycleNumber);
      subCycleIndex = _.toInteger(_.toNumber(message.cycle)%1.0 * cycleResolution);
      
      let _n = message.n === undefined ? 0 : _.toInteger(message.n);
      let xcoord = cycleIndex*cycleResolution+subCycleIndex;
      
      let _index = _.indexOf(samples, message.s);
      if(_index === -1){
        samples[samples.length] = message.s;
        samples.sort();
      }
        
      if(grid[xcoord] === undefined) grid[xcoord] = []
      





      
      let samplesObject = _.find(grid[xcoord], ['s', message.s]); 
      if(samplesObject === undefined) {
        grid[xcoord][grid[xcoord].length] = {s: message.s, n: [_n], msg: [message]};
      }
      else {
        let subSampleIndex = _.indexOf(samplesObject.n, _n);
        if(subSampleIndex === -1) {
          subSampleIndex = samplesObject.n.length; 
          samplesObject.n[subSampleIndex] = _n;
          samplesObject.msg[subSampleIndex] = message;
        }
        else {
          samplesObject.msg[subSampleIndex] = message;
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
  // p.keyTyped = function () {
  //   if (p.key === 'l')  isLabels = !isLabels;
  //   if (p.key === ' ') {
  //     isPlay = !isPlay;
  //     isPaused = !isPaused;

  //     if ( isPlay ) {
  //       store.dispatch(resetClick());
  //       store.dispatch(consoleSubmit(serverLink, "hush"));
  //       store.dispatch(sendScPattern(serverLink, "OSCFunc.trace(false);"));
  //     }
  //   }
  // }

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

  //   let h = p.height/(maxSamples);

  //   let x = _.toInteger(p.map(dragStart[0], 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //   let y = _.toInteger(p.map(dragStart[1], 0, p.height, 0, (maxSamples)))
  //   if(grid[x][y]) {
  //     let z = _.toInteger(p.map(dragStart[1], h*y, h*(y+1), 0, grid[x][y].length))
  
  //     if (grid[x][y].length !== 0) {
  //       let _x = _.toInteger(p.map(dragEnd[0], 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //       let _y = _.toInteger(p.map(dragEnd[1], 0, p.height, 0, (maxSamples)))
  //       let _z = _.toInteger(p.map(dragEnd[1], h*_y, h*(_y+1), 0, grid[_x][_y].length))
  
  //       let obj = grid[x][y][z];
  //       obj.s = samples[_y];
  //       obj.n = samplesNumbers[_y][_z];
  //       grid[x][y][z] = {};
  //       grid[_x][_y][_z] = obj;

  //       console.log(_z);
  //     }
  //   }
  // }

  // p.mouseClicked = function () {
  //   if(isInteract){
  //     let h = p.height/(maxSamples);
      
  //     let x = _.toInteger(p.map(p.mouseX, 0, p.width, 0, (cycleResolution*totalCycleCount)))
  //     let y = _.toInteger(p.map(p.mouseY, 0, p.height, 0, (maxSamples)))
  //     if(grid[x][y]) {
  //       let z = _.toInteger(p.map(p.mouseY, h*y, h*(y+1), 0, grid[x][y].length))
  
  //       let obj = {};
  //       if (grid[x][y].length === 0) {
  //         obj = {
  //           's': samples[y],
  //           'n': 0,
  //           'cps' : 1,
  //           'cycle': p.map(x%cycleResolution, 0, cycleResolution, 0, 1),
  //           'speed': 1,
  //           'delay': 0,
  //           'delaytime' : 0,
  //           'end': 1,
  //           'gain': 1
  //         };
  //       }
  //       grid[x][y][z] = obj;
  //     }
  //   }
  // }

  p.draw = function () {
    p.background(30);

    // Get max sample number
    // let maxSamples = 

    // Grid lines
    if(true){
      for(let rows = 0; rows < samples.length; rows++) {
        p.stroke(255, 15);
        p.line(0, rows*(p.height/samples.length), p.width, rows*(p.height/samples.length));
      }
      for(let cols = 0; cols < cycleResolution*totalCycleCount; cols++) {
        p.stroke(255, cols%cycleResolution === 0 ? 30 : 5);
        p.line(cols*(p.width / (totalCycleCount*cycleResolution)), 0,
               cols*(p.width / (totalCycleCount*cycleResolution)), p.height);
        
        // Highlight some portions of the grid

      }
    }

      // delete array on tmex 
    // let time_x = p.map(time%(totalCycleCount*1000), 0, totalCycleCount*1000, 0, p.width);
    // p.stroke(150);
    // p.line(time_x, 0, time_x, p.height);
    // if (!isPaused) {
    //   let item_x = _.toInteger(p.map(time_x, 0, p.width, 0, (totalCycleCount*cycleResolution)));

    //   let objs = grid[item_x]
    //   if(objs) {
    //     for(let a = 0; a < objs.length; a++) {
    //       for(let b = 0; b < objs[a].length; b++) {
    //         if(objs[a][b] && _.indexOf(playbackArray, objs[a][b]) === -1)
    //         {
    //           playbackArray[playbackArray.length] = objs[a][b];
                          
    //           // [ 'latency', 'cps', 'sound', 'offset', 'begin', 'end', 'speed', 'pan', 'velocity', 'vowel', 'cutoff', 'resonance', 'accelerate', 'shape', 'krio', 'gain', 'cut', 'delay', 'delaytime', 'delayfeedback', 'crush', 'coarse', 'hcutoff', 'hresonance', 'bandqf', 'bandq', 'unit' ]
    //           let pattern = "sound: \"" + objs[a][b].s + ":"+ objs[a][b].n +"\"";
    //           store.dispatch(sendScPattern(serverLink, "~d1.(("+ pattern +"));"));

    //           console.log(objs[a][b]);
    //         }
    //       }
    //     }
    //   }
    //   time += 1000/p.frameRate();
    // }

    // Draw
    if (isDraw){

      // console.log(grid, samples);
      for(let i = 0; i < (totalCycleCount*cycleResolution); i++) {
        if(grid[i] !== undefined) {
          for(let j = 0; j < samples.length; j++) {
            let obj = _.find(grid[i], ['s', samples[j].s])

            let w = p.width/(totalCycleCount*cycleResolution);
            let h = p.height/(samples.length);
            for(let k = 0; obj && k < samples[j].n.length; k++) {
              if(obj.n[k]){
                let _h = h / samples[j].n.length;
                let x = i * w;
                let y = j * h + _.indexOf(samples[j].n, obj.n[k]) * _h;
  
                p.stroke(0);
                p.fill(200);
                p.rect(x, y, w, _h);
              }
            }
          }

        }
      }
    }

    // if (isLabels) {
    //   // console.log(samples);
    //   for(let i = 0; i < maxSamples; i++) {
    //     let h = p.height/(maxSamples);
    //     let y = i * h;
    //     p.fill(255, 150);
    //     p.rect(0, y+3, 15, h-3);
    //     p.push();
    //     p.fill(0);
    //     p.translate(7, y+h*0.5);
    //     p.rotate(p.HALF_PI);
    //     p.textFont("Courier New");
    //     p.textStyle(p.BOLD);
    //     p.textAlign(p.CENTER, p.CENTER);
    //     p.text(samples[i], 0, 0);
    //     p.pop();
    //   }
    // }

    // // Selection indicator
    // if(true){
    //   p.stroke(255);
    //   p.noFill();
    //   let w = p.width/(cycleResolution*totalCycleCount);
    //   let h = p.height/(maxSamples);
    //   let x = _.toInteger(p.map(mouseX, 0, p.width, 0, (cycleResolution*totalCycleCount)));
    //   let y = _.toInteger(p.map(mouseY, 0, p.height, 0, (maxSamples)));
    //   if(grid[x] && grid[x][y]){
    //     let z = _.toInteger(p.map(mouseY, y*h, (y+1)*h, 0, grid[x][y].length));
        
    //     if(samplesNumbers[y]) {
    //       let _h = h / samplesNumbers[y].length;
    //       p.rect(x*w,y*h+z*_h, w,_h);
    //     }
    //     else {
    //       p.rect(x*w,y*h, w,h);
    //     }
    //   }
    // }

    // Interaction
    if (isInteract) {
      p.stroke(255);
      p.line(mouseX, 0, mouseX, p.height);
      p.noStroke();
    }
  };
};
