// import _ from 'lodash';

// export default function patternRoll (p) {
//   // primary data
//   let future_messages,
//       messageS,
//       totalCycleCount = 8,
//       cycleResolution = 12,
//       cycleIndex = 0,
//       subCycleIndex = 0;

//   // time parameters
//   let currentCycle = 0;
//   let isPulseActive = false;
//   let pulse = { bpm: 120, beat: "", phase: "" };
  
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

//   p.setup = function () {
//     p.createCanvas(1080, 95);
//   };

//   p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
//     // resizing
//     if (props.width && props.height && (_w !== props.width || _h !== props.height)) {
//       _w = props.width;
//       _h = props.height;
//       p.resizeCanvas(_w, _h);
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

//     if (props.message && messageS !== props.message) { 
//       messageS = props.message;
//       currentCycle = messageS.cycle;
//     }

//     if (props.future_messages) {
//       future_messages = props.future_messages;

//       _.each(future_messages, (elem, i) => { 
//         addMessage(elem, i);
//       })
//       console.log("Future stuff:", future_messages);
//     }
//   };

//   p.draw = function () {
//     try {
//       p.background(30);

//       p.push();
//         p.stroke(255, 255, 0);
//         drawGrid();
        
//         let _cps = (messageS !== undefined ? _.toNumber(messageS.cps) : 1);
//         let off = (messageS !== undefined ? startCycleNumber - _.toNumber(messageS.cycle) : 0) * (p.width * 0.5) / (totalCycleCount * 0.5 / _cps);
//         // p.translate(p.width * 0.5 + off, 0);
        
//         console.log(off);
        
//       p.translate(off - p.width/2, 0);
        
        
//       //px
//       // (p.width * 0.5) / (totalCycleCount * 0.5 / _cps)
      
//       // s
//       // (totalCycleCount * 0.5 / _cps);
      
        
//         drawBlocks();

//       p.pop();

//       p.push();
//         p.stroke(180, 180, 20);
//         p.line(p.width * 0.5, 0, p.width * 0.5, p.height);
//       p.pop();
//     }
//     catch(exception) {
//       console.log("Exception thrown: ", exception)
//     }
//   };

//   let drawGrid = function () { 
//     if(true){
//       for(let rows = 0; rows < samples.length; rows++) {
//         p.stroke(0, 60);
//         p.line(0, rows*(p.height/samples.length), p.width, rows*(p.height/samples.length));
//         for(let subrows = 1; subrows < samples[rows].n.length; subrows++) {
//           let _y = rows*(p.height/samples.length) + subrows * (p.height/samples.length) / samples[rows].n.length;  
//           p.stroke(0, 30);
//           p.line(0, _y, p.width, _y);    
//         }
//       }
//       for(let cols = 0; cols < cycleResolution*totalCycleCount; cols++) {
//         // TODO : alternate cycle backgrounds
//         p.stroke(0, cols % cycleResolution === 0 ? 60 : 30);
//         p.line(cols*(p.width / (totalCycleCount*cycleResolution)), 0,
//               cols*(p.width / (totalCycleCount*cycleResolution)), p.height);
//       }
//     }
//   }
//   let drawBlocks = function () {
//     for(let i = 0; i < samples.length; i++) {
//       let _ns   = samples[i].n;

//       let w = p.width/(totalCycleCount*cycleResolution);
//       let h = p.height/(samples.length);
      
//       for (let j = 0; j < _ns.length; j++) {
//         let _h = h / _ns.length;

//         let y = i * h + j * _h;
//         for (let k = 0; k < (totalCycleCount*cycleResolution); k++) {
//           if (_ns[j].time && _ns[j].time[k]){
//             let x = k * w;
//             let _message = _ns[j].time[k];
            
//             let _cps = _.toNumber(messageS.cps);

//             let _cycleSec = 1.0 / _cps;
//             let _resSec = _cycleSec / cycleResolution;

//             let _gainCoeff = p.map((_message.gain === undefined ? 1 : _message.gain), 0, 1.0, 0, 255);
//             let _sustCoeff = (_message.sustain === undefined ? _resSec : _message.sustain) / _resSec;
//             // end, legato 

//             p.stroke(0, _gainCoeff);
//             p.fill(200, _gainCoeff);
//             p.rect(x, y, w * _sustCoeff, _h);
//           }
//         }
//       }
//     }
//   }

//   let addMessage = function (message, i) { 
//     if (startCycleNumber === 0) {
//       startCycleNumber = _.toInteger(message.cycle)
//     }
//     // clean current view
//     if (startCycleNumber + totalCycleCount - 1 < _.toInteger(message.cycle)) {
//       startCycleNumber = _.toInteger(message.cycle);
      
//       samples = [];
//     }

//     cycleIndex = _.toInteger(_.toNumber(message.cycle) - startCycleNumber);
//     subCycleIndex = _.toInteger(_.toNumber(message.cycle)%1.0 * cycleResolution);
    
//     let _channel = message.sirenChan === undefined ? -1 : _.toNumber(message.sirenChan);
//     let _n = message.n === undefined ? 0 : _.toInteger(message.n);
//     let xcoord = cycleIndex * cycleResolution + subCycleIndex;
    
//     let _index = _.findIndex(samples, ['s', message.s]);
//     if(_index === -1){
//       samples[samples.length] = { s: message.s, n: [{ no: _n, time: []}]};
//       samples = _.sortBy(samples, 's');
//     }
//     else {
//       let sampleNumberArray = samples[_index].n;
//       let _subindex = _.findIndex(sampleNumberArray, ['no', _n]);
      
//       if (_subindex === -1) {
//         let _t = [];
//         _t[xcoord] = message;
//         samples[_index].n[sampleNumberArray.length] = {no: _n, time: _t}
//       }
//       else {
//         let _t = samples[_index].n[_subindex].time;
//         _t[xcoord] = message;
//         samples[_index].n[_subindex].time = _t;
//       }
//     }
//   }
// };