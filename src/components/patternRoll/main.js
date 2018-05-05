// import _ from 'lodash';

// export default function patternRoll (p) {
//   // primary data
//   let message,
//       totalCycleCount = 8,
//       cycleResolution = 12,
//       cycleIndex = 0,
//       subCycleIndex = 0;

//   // data management
//   let samples = [];
//   let startCycleNumber = 0;
//   let activeMatrix = '';
    
//   // interaction variables
//   let mouseX, mouseY;
//   let _w, _h;
//   let isDraw = true;
//   let isInteract = false;
//   let isLabels = true;
//   let dragStart = [0, 0];
//   let dragEnd = [0, 0];
//   let reload = false;

//   // playback variables
//   let isPlay = false;
//   let time = 0;
//   let serverLink = '';
//   let pg = null;

//   let c, gl, program;

//   // let canvasWorker;

//   // Helper Functions
//   const getObject = function(sample_name, sample_number, time) {
//     let sample_index = _.findIndex(samples, ['s', sample_name]);
//     if (sample_index >= 0 && samples[sample_index]) {
//       let numbers = samples[sample_index].n;
//       let number_index = _.findIndex(numbers, ['no', sample_number]);
//       if (number_index >= 0 && numbers[number_index]) {
//         let time_array = numbers[number_index].time;
//         if (time_array[time])
//           return [time_array[time], sample_index, number_index, time];
//       } 
//     } 
    
//     return;
//   }
//   const getObjectByWorldCoordinates = function(mx, my) {
//     let h = p.height/(samples.length);
//     let sampleIndex = _.toInteger(my/h);
//     if(samples[sampleIndex]){
//       let numbers = samples[sampleIndex].n;
//       let _h = h / numbers.length;
//       let numberIndex = _.toInteger((my - sampleIndex*h)/_h);
//       if(numbers[numberIndex].time) {
//         let x = _.toInteger(p.map(mx, 0, p.width, 0, (cycleResolution*totalCycleCount)));
//         if(numbers[numberIndex].time[x])
//           return [numbers[numberIndex].time[x], sampleIndex, numberIndex, x];    
//       }
//     }
//   }
//   const getObjectPosition = function(mx, my) {
//     let w = p.width/(cycleResolution*totalCycleCount);
//     let h = p.height/(samples.length);
//     let sampleIndex = _.toInteger(my/h);
//     if(samples[sampleIndex]){
//       let numbers = samples[sampleIndex].n;
//       let _h = h / numbers.length;
//       let numberIndex = _.toInteger((my - sampleIndex*h)/_h);
//       if(numbers[numberIndex].time) {
//         let x = _.toInteger(p.map(mx, 0, p.width, 0, (cycleResolution*totalCycleCount)));
//         if(numbers[numberIndex].time[x])
//           return [x*w, sampleIndex*h+numberIndex*_h, w, _h]    
//       }
//     }
//   } 
//   // const resetExecution = (x) => {
//   //   for(let a = 0; a < samples.length; a++) {
//   //     for(let b = 0; b < samples[a].n.length; b++) {
//   //       for(let c = 0; c < samples[a].n[b].time.length; c++){
//   //         if (samples[a].n[b].time[c] && c >= x) {
//   //           samples[a].n[b].time[c].executed = false;
//   //         }
//   //       }
//   //     }
//   //   }
//   // } 

//   p.setup = function () {
//     p.createCanvas(1080, 95);
//   };

//   p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
//     // resizing
//     if (props.width && props.height){ //&& (_w !== props.width || _h !== props.height)) {
//       _w = props.width;
//       _h = props.height;
//       p.resizeCanvas(_w, _h);
//     }

//     if (props.serverLink && serverLink !== props.serverLink) {
//       serverLink = props.serverLink;
//       //store.dispatch(sendScPattern(serverLink, "~d1 = ~dirt.orbits[0];"));
//     }

//     // clear data on scene change
//     if (props.activeMatrix) {
//       if(activeMatrix !== props.activeMatrix) {
//         startCycleNumber = 0;
//         samples = [];
//         activeMatrix = props.activeMatrix;
//       }
//     }

//     // update resolution and number of total cycles displayed
//     if (props.resolution && props.cycles) {
//       cycleResolution = props.resolution;
//       totalCycleCount = props.cycles;
//     }

//     // refreshes the view
//     if (props.reload) {
//       reload = props.reload;
//       if(reload) {
//         samples = [];
//         if(props.message) startCycleNumber = _.toInteger(props.message.cycle);
//         reload = false;
//       }
//     }

//     // on message -- form a matrix
//     // sample[i] = {s: 'bd', n: [{no: 0, time: [{asd},{asd},{afs},...]}
//     if (props.message && message !== props.message && props.message.s !== undefined) {
//       message = props.message;

//       console.log(message);
      

//       if (startCycleNumber === 0) {
//         startCycleNumber = _.toInteger(message.cycle)
//       }
//       // clean current view
//       if (startCycleNumber + totalCycleCount - 1 < _.toInteger(message.cycle)) {
//         startCycleNumber = _.toInteger(message.cycle);
        
//         samples = [];
//       }

//       cycleIndex = _.toInteger(_.toNumber(message.cycle) - startCycleNumber);
//       subCycleIndex = _.toInteger(_.toNumber(message.cycle)%1.0 * cycleResolution);
      
//       let _channel = message.sirenChan === undefined ? -1 : _.toNumber(message.sirenChan);
//       let _n = message.n === undefined ? 0 : _.toInteger(message.n);
//       let xcoord = cycleIndex*cycleResolution+subCycleIndex;


//       // let _channelindex = _.findIndex(samples, ['chan', _.toNumber(message.sirenChan)]);
//       // if (_channelindex === -1) {

//       // }
//       // else { 

//       // }


//       let _index = _.findIndex(samples, ['s', message.s]);
//       if(_index === -1){
//         samples[samples.length] = { s: message.s, n: [{ no: _n, time: []}]};
//         samples = _.sortBy(samples, 's');
//       }
//       else {
//         let sampleNumberArray = samples[_index].n;
//         let _subindex = _.findIndex(sampleNumberArray, ['no', _n]);
        
//         if (_subindex === -1) {
//           let _t = [];
//           _t[xcoord] = message;
//           samples[_index].n[sampleNumberArray.length] = {no: _n, time: _t}
//         }
//         else {
//           let _t = samples[_index].n[_subindex].time;
//           _t[xcoord] = message;
//           samples[_index].n[_subindex].time = _t;
//         }
//       }
//     }
    
//   };

//   // KEYBOARD INTERACTIONS
//   p.keyTyped = function () {
//   //  if (p.key === 'l')  isLabels = !isLabels;
//   }

//   p.draw = function () {
//     try {
//       p.background(70);

//       // DEBUG FPS
//       p.fill(255, 0, 0)

//       // Grid lines
//       if(true){
//         for(let rows = 0; rows < samples.length; rows++) {
//           p.stroke(0, 60);
//           p.line(0, rows*(p.height/samples.length), p.width, rows*(p.height/samples.length));
//           for(let subrows = 1; subrows < samples[rows].n.length; subrows++) {
//             let _y = rows*(p.height/samples.length) + subrows * (p.height/samples.length) / samples[rows].n.length;  
//             p.stroke(0, 30);
//             p.line(0, _y, p.width, _y);    
//           }
//         }
//         for(let cols = 0; cols < cycleResolution*totalCycleCount; cols++) {
          
//           // TODO : alternate cycle backgrounds
//           p.stroke(0, cols % cycleResolution === 0 ? 60 : 30);
//           p.line(cols*(p.width / (totalCycleCount*cycleResolution)), 0,
//                 cols*(p.width / (totalCycleCount*cycleResolution)), p.height);
//         }
//       }

//       // Draw
//       if (isDraw){
//         // p.colorMode(p.HSB);
//         // sample[i] = {s: 'bd', n: [{no: 0, time: [{}x96]]}
//         for(let i = 0; i < samples.length; i++) {
//           let _ns   = samples[i].n;

//           let w = p.width/(totalCycleCount*cycleResolution);
//           let h = p.height/(samples.length);
          
//           for (let j = 0; j < _ns.length; j++) {
//             let _h = h / _ns.length;

//             let y = i * h + j * _h;
//             for (let k = 0; k < (totalCycleCount*cycleResolution); k++) {
//               if (_ns[j].time && _ns[j].time[k]){
//                 let x = k * w;
//                 let _message = _ns[j].time[k];
                
//                 let _cps = _.toNumber(message.cps);

//                 let _cycleSec = 1.0 / _cps;
//                 let _resSec = _cycleSec / cycleResolution;

//                 let _gainCoeff = p.map((_message.gain === undefined ? 1 : _message.gain), 0, 1.0, 0, 255);
//                 let _sustCoeff = (_message.sustain === undefined ? _resSec : _message.sustain) / _resSec;
//                 // end, legato 

//                 p.stroke(0, _gainCoeff);
//                 p.fill(200, _gainCoeff);
//                 // p.fill(p.map(_ns[j].time[k].sirenChan, -1, 5, 0, 255), 0, 0);
//                 p.rect(x, y, w * _sustCoeff, _h);
//               }
//             }
//           }
//         }
//         // p.colorMode(p.RGB);
//       }

//       if (isLabels) {
//         for(let i = 0; i < samples.length; i++) {
//           let h = p.height/(samples.length);
//           let y = i * h;
//           p.fill(255, 150);
//           p.rect(0, y+3, 15, h-3);
//           p.push();
//           p.fill(0);
//           p.translate(7, y+h*0.5);
//           p.rotate(p.HALF_PI);
//           p.textAlign(p.CENTER, p.CENTER);
//           p.text(samples[i].s, 0, 0);
//           p.pop();
//           for (let j = 0; j < samples[i].n.length; j++) {
//             let _h = h / samples[i].n.length;
//             p.fill(255, 100);
//             p.rect(17, y+j*_h+2, 15, _h-3);
//             p.push();
//             p.fill(0);
//             p.translate(24, y+j*_h+_h*0.5);
//             p.rotate(p.HALF_PI);
//             p.textAlign(p.CENTER, p.CENTER);
//             p.text(samples[i].n[j].no, 0, 0);
//             p.pop();
//           }
//         }
//       }
//     }
//     catch(exception) {
//       console.log("Exception thrown: ", exception)
//     }
//   };
// };