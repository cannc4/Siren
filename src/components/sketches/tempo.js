import _ from 'lodash';

export default function sketch (p) {
  let click = 0,
      cycleInfo,
      timestamp;

  let cycleNumber = 0;
  let cycleStack = [];

  p.setup = function () {
    p.createCanvas(600, 40);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    if (props.click)
      click = props.click;

    if (props.cycleInfo && props.cycleTime) {
      cycleInfo = props.cycleInfo;
      timestamp = props.cycleTime;

      // MOD AL
      if(p.int(cycleInfo.cycle) > cycleNumber) {
        cycleNumber = p.int(cycleInfo.cycle);
        console.log('RESET::before', cycleStack);
        cycleStack = [];
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

    if(cycleInfo.cps !== undefined) {
      const cycleDuration = (1.0/p.float(cycleInfo.cps));
      for(var i = 0 ; i < cycleStack.length; i++) {
        const y = i*(p.height/cycleStack.length)+(p.height/cycleStack.length)/2;

        for(var j = 0 ; j < cycleStack[i].t.length; j++) {
          const x  = p.map(cycleStack[i]['t'][j]['floating'], 0, 1, 3, p.width-3);

          p.stroke(p.map(i, 0, cycleStack.length, 0, 255),
                   p.map(j, 0, cycleStack[i].t.length, 0, 255),
                   0);
          p.ellipse(x, y, 5, 5);
        }
      }
    }
  };

};
