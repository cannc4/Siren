var t, handle;
self.onmessage = function(e){

    console.log('TWERK     !!');
    if (e.data.type === "startCanvasTimer") {
        let cycle = e.data.cycle;
        let resolution = e.data.resolution;
        

        console.log('TWERK1!!', t, cycle, resolution);

        handle = setInterval(function(){ 
            let samples = e.data.samples
            let item_x = parseInt(t, 10);
            let notex = [];
            for(let a = 0; a < samples.length; a++) {
              for(let b = 0; b < samples[a].n.length; b++) {
                if (samples[a].n[b].time[item_x] && samples[a].n[b].time[item_x].executed === false) {
                    
                    samples[a].n[b].time[item_x].executed = true;
                    
                    let s = "";
                    for(var key in samples[a].n[b].time[item_x]) {
                        if(samples[a].n[b].time[item_x].hasOwnProperty(key)) {
                            if(key !== "s" && key !== "n" && key !== "executed" &&
                                key !== "cps" && key !== "delta" && key !== "cycle" && key !== "time")
                                s += key+":"+samples[a].n[b].time[item_x][key]+",";
                        }
                    }
                
                    let pattern = "sound: \"" + samples[a].s + ":"+ samples[a].n[b].no +"\"";
                    let newNote = "~d1.(("+s+ pattern +"));"
                    notex.push(newNote);
                    
            
                }
              }
            }
            
            postMessage({type: "seq", time: t++%(cycle*resolution), notes: notex});
            
        }, (cycle*1000)/(cycle*resolution))
    }
    else if(e.data.type === "resetCanvasTimer") {
        console.log('TWERK2!!', handle, '##', t);
        
        t = 0;
        clearInterval(handle);
        postMessage({type: "seq", time: 0});
    }
}


// var t, handle, tarr,totaln;
// self.onmessage = function(e){
//     if (e.data.type === "bootCanvasTimer") {
//         totaln = e.data.totaln;
//         for(var k = 0; k < totaln.length; k++){
//             if(tarr[k] !== undefined || tarr[k]!== 1){
//                 postMessage({type: "bootTimer", id: k, time: t});
//                 tarr[k] = 1;
//             }
//         }
//     }
//     else if(e.data.type === "StartCanvasTimer"){
//         let cycle = e.data.cycle;
//         let resolution = e.data.resolution;
//         handle = setInterval(function(){ 
//         postMessage({type: "seq", time: t++%(cycle*resolution)});
//     }, (cycle*2000)/(cycle*resolution))
//     }
//     else if(e.data.type === "resetCanvasTimer") {
//         t = 0;
//         clearInterval(handle);
//         for(var c = 0; c < totaln.length; c++){
//             if( tarr[k]!== 0){
//                 tarr[k] = 0;
//             }
//         }
//         postMessage({type: "seq", time: 0});
//     }
