import _ from 'lodash';

export default function sketch (p) {
  let cycleInfo,
      timestamp;

  let cycleNumber = 0;
  let cycleStack = [];

  let localCycleStartTime = 0;

  let width = 600, height = 80;

  p.setup = function () {
    p.createCanvas(width, height);
  };

  p.windowResized = function() {
    p.resizeCanvas(width, height);
  }

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    if (props.width && props.height) {
      width = props.width;
      height = props.height;
      p.resizeCanvas(width, height);
    }

    if (props.cycleInfo && props.cycleTime) {
      cycleInfo = props.cycleInfo;
      timestamp = props.cycleTime;

      // MOD AL --- DAHA UZUN OLSUN
      if(p.int(cycleInfo.cycle) > cycleNumber) {
        cycleNumber = p.int(cycleInfo.cycle);
        console.log('RESET::before', cycleStack);
        cycleStack = [];
        localCycleStartTime = p.millis();
        console.log('RESET::after ', cycleStack);
        cycleStack[0] = {
          's': cycleInfo.s,
          't': [ {'time': timestamp,
                  'floating': p.float(cycleInfo.cycle) % 1.0,
                  'delta': p.float(cycleInfo.delta)
                 } ]
        };
      }
      else {
        var object = _.find(cycleStack, ['s', cycleInfo.s]);
        if (object !== undefined) {
          if(object.t[object.t.length-1].time !== timestamp)
            object.t[object.t.length] = {'time': timestamp,
                                          'floating': p.float(cycleInfo.cycle) % 1.0,
                                          'delta': p.float(cycleInfo.delta)
                                        }
        }
        else {
          cycleStack[cycleStack.length] = {
            's': cycleInfo.s,
            't': [ {'time': timestamp,
                    'floating': p.float(cycleInfo.cycle) % 1.0,
                    'delta': p.float(cycleInfo.delta)
                   } ]
          };
        }
      }
    }
  };

  p.draw = function () {
    p.background(27, 25); // Menubar Background Color

    if(cycleInfo !== undefined && cycleInfo.cps !== undefined) {
      for(var i = 0 ; i < cycleStack.length; i++) {
        const cellH = (p.height/cycleStack.length);
        const y = i*cellH;
        // const y = i*cellH+cellH/2;

        // Average ASCII value of word
        var averageASCII = 0;
        cycleStack[i]['s'].toUpperCase().split('').forEach(function(alphabet) {
            averageASCII += alphabet.charCodeAt(0);
        });
        averageASCII /= cycleStack[i]['s'].split('').length;

        for(var j = 0 ; j < cycleStack[i].t.length; j++) {
          const cellW = (p.width/cycleStack[i]['t'].length);
          const x  = p.map(cycleStack[i]['t'][j]['floating'], 0, 1, 0, p.width-0);

          p.colorMode(p.HSL, 360, 255, 255);

          // since most characters are between 64-90
          p.fill(p.map(averageASCII, 62, 90, 0, 360),
                 p.map(i, 0, cycleStack.length, 80, 255),
                 p.map(j, 0, cycleStack[i].t.length, 80, 255));
          p.rect(x, y, cellW, cellH);
          p.colorMode(p.RGB);
        }
      }

      const cycleDuration = (1.0/p.float(cycleInfo.cps))*1000;
      const timeslider_x = p.map(p.millis(),
                                 localCycleStartTime, localCycleStartTime+cycleDuration,
                                 0, p.width);
      const timeslider_w = 5;
      p.fill(50, 50);
      p.rect(timeslider_x-timeslider_w*0.5, 0, timeslider_w, p.height);

    }
  };

};
