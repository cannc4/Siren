self.onmessage = function(e){
    let samples = e.data.samples;
    let time = e.data.time;
    let b = e.data.b;
    let item_x = e.data.x;
    if(e.data.type === "bootNote"){

    }
    postMessage({type: "sendPatternTwerk", pattern: "~d1.(("+s+ pattern +"));"});
}