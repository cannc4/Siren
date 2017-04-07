self.onmessage=function(e){
  if (e.data.type == "start") {
    var interval= e.data.duration / e.data.steps * 1000;
    console.log("starting");
    var t = setInterval(function(){postMessage({type:"tick", id:e.data.id, msg: t});},interval)

  }
  else if (e.data.type == "update") {
    var interval= e.data.duration / e.data.steps * 1000;
    if (e.data.timer) {
      clearInterval(e.data.timer);
      var t=setInterval(function(){postMessage({type: "tick", id:e.data.id, msg:t});},interval)
    }
  }
  else if (e.data.type == "stop" || e.data.type == "pause") {
    console.log("stopping");
    clearInterval(e.data.timer);
    e.data.timer=null;

  }
}
