import _ from 'lodash';
import fs from 'fs';
const math = require("mathjs");
import { spawn } from 'child_process';
import express from 'express';
import bodyParser from 'body-parser';
import jsonfile from'jsonfile';
const supercolliderjs = require('supercolliderjs');
const socketIo = require('socket.io');
const exec = require('child_process').exec;
const osc = require("osc");
const Queue = require('better-queue');

// timers
const abletonlink = require('abletonlink');
const link = new abletonlink();
const NanoTimer = require('nanotimer');
let nano = new NanoTimer();

let link_pulse = socketIo.listen(4001);

class REPL {
  hush() {
    this.tidalSendExpression('hush');
  }

  doSpawn(config, reply) {
    this.repl = spawn(config.ghcipath, ['-XOverloadedStrings']);
    
    let tidalog = socketIo.listen(4003);
    this.repl.stderr.on('data', (data) => {
      console.error(data.toString('utf8'));
      tidalog.sockets.emit('/scdebuglog', {msg: data.toString('utf8')});
    });
    this.repl.stdout.on('data', data => {
      console.error(data.toString())
      tidalog.sockets.emit('/scdebuglog', {msg: data.toString('utf8')});
    });
    console.log(" ## -->   GHC Spawned");


    /*KORG 
    let nano_socket = socketIo.listen(4003);
    nanoKONTROL.connect('nanoKONTROL2').then((device) => {
      
      device.on('slider:*', function(value){
        //console.log(this.event+' => '+value);
        //SuperCollider
        let scorbit;
        let slider_value = value.map(0, 127, 0, 2);
        let slider_index = _.replace(this.event,"slider:","")
        let sc_msg = "~dirt.orbits[" + slider_index+ "].set(\\amp,"+ slider_value + ");"// reduce the amplitude of one orbit
        SirenComm.siren_console.sendSCLang(sc_msg); 

        //last 2 dif functions
      });
      
      device.on('knob:*', function(value){
        // console.log(this.event+' => '+value);
        let knob_value = value.map(0, 127, 0, 2);
        let knob_index = _.replace(this.event,"knob:","");

        nano_socket.sockets.emit('/nanoknob', {index: knob_index, value: knob_value});
      });
      
      device.on('button:**', function(value){
        // console.log(this.event+' => '+value);
        //gate: false ,solo: false, mute: false, loop: true//
        let button_value = value;
        let button_index = _.replace(this.event,"button:","");
        // console.log(button_index);
        switch (button_index) {
          case 'next':
      
            break;
          case 'prev':
            
            break;
          case 'play':
            if(button_value === true) nano_socket.sockets.emit('/nanostart', {trigger: true});
            break;
          case 'stop':
            if(button_value === true) nano_socket.sockets.emit('/nanostart', {trigger: false});
            break;
          case 'rec':
            if(button_value === 'true'){
              let sc_msg = "Server.default.record;"; SirenComm.siren_console.sendSCLang(sc_msg); 
            }
            else{
              let sc_msg = "Server.default.stopRecording"; SirenComm.siren_console.sendSCLang(sc_msg); 
            }
            break;        
          default:
            break;
        }
        button_index = _.replace(button_index, ":", "");
        if(button_index !== undefined){
          nano_socket.sockets.emit('/nanobutton', {type:button_index[0], index: button_index[1], value: button_value});
        }
      });
    });*/
  }

  initGHC(config) {
    const tidalparams = fs.readFileSync(config.tidal_boot).toString().split('\n');
    if ( tidalparams )
      for (let i = 0; i < tidalparams.length; i++) {
        this.tidalSendLine(tidalparams[i]);
      }
    console.log(" ## -->  GHC initialized");
  }

  initSCSynth(config, reply) {
    const self = this;
    
    supercolliderjs.resolveOptions(config.path).then((options) => {
      // replace options
      options.sclang = config.sclang;
      options.scsynth = config.scsynth;
      options.sclang_conf = config.sclang_conf;
      options.debug = true;

      supercolliderjs.lang.boot(options).then((sclang) => {
        self.sc = sclang;
        
        // open socket for SuperCollider log
        let sclog = socketIo.listen(4002);
        var udpPort = new osc.UDPPort({
          localAddress: "127.0.0.1",
          localPort: 57121,
          metadata: true
        });
        udpPort.open();
        
        // socket for Tidal future values
        let future_vis = socketIo.listen(4006);
        
        let future_values = [];
        let current_cycle = 0;
        udpPort.on("message", (oscMsg) => {
          try {
            if (oscMsg.address === "/vis") {
              let blob = Buffer.from(oscMsg.args[1].value);
              let blobJSON = JSON.parse(blob.toString())
             
              // Process incoming data
               
              // TEMP ARRAY I
 
              // let future_values = []; 
 
              let json = JSON.parse(blobJSON);
              json.forEach((element, index) => {
                let obj = _.fromPairs(json[index][1]);
                obj['cycle'] = json[index][0][0].numerator / json[index][0][0].denominator;
                   
                future_values.push(obj);
              });

              // Delete old samples
              future_values = _.dropWhile(future_values, (i) => {
                let max_cycles = 32;
                return i.cycle < current_cycle - max_cycles;
              })
             
              // TEMP ARRAY II
               
              let GROUPED_DATA = [];
             
              if (future_values !== undefined && future_values.length !== 0) {
                     
                // min and max of the data
                // this.canvas_min_cycle = _.minBy(DATA, 'cycle').cycle;
                // this.canvas_max_cycle = _.maxBy(DATA, 'cycle').cycle;
     
                // canvas_data: [c1, c2, c3, c4], length channel_num
                //               c# = {ch: #, samples: [s1, s2, s3], length sample_num}
                //                                      s# = {s: #, notes: [n1, n2], length note_num}
                //                                                          n# = {n: #, time: [objs]}
                _.forEach(future_values, (d) => {
                  if (d['sirenChan'] === undefined) d['sirenChan'] = 0;
                  if (d['n'] === undefined) d['n'] = 0;
                  // d = {cycle: ##, s: ##, n: ##, sirenChan: ##, ... }
     
                  let new_obj = {
                    ch: d['sirenChan'],
                    samples: [
                      {
                        s: d['s'],
                        notes: [
                          {
                            n: d['n'],
                            time: [d]
                          }
                        ]
                      }
                    ]
                  };
     
                  // process data
                  let _ch, _s, _n;
                  if ((_ch = _.find(GROUPED_DATA, ['ch', d['sirenChan']])) !== undefined) {
                    // if channel exist, manipulate samples
                             
                    if ((_s = _.find(_ch.samples, ['s', d['s']])) !== undefined) {
                      // if sample exist, manipulate notes
     
                      if ((_n = _.find(_s.notes, ['n', d['n']])) !== undefined) {
                        // if note exist, manipulate time
                                     
                        _n.time.push(d);
                      } else {
                        // if note DOESNT exist
                        _s.notes.push(new_obj.samples[0].notes[0]);
                      }
                    } else {
                      // if sample DOESNT exist
                      _ch.samples.push(new_obj.samples[0]);
                    }
                  } else {
                    // if channel DOESNT exist
                    GROUPED_DATA.push(new_obj);
                  }
                });
                     
                // build final data
                 
                // TEMP ARRAY III
                 
                let canvas_data = [];
                _.forEach(GROUPED_DATA, (d, i) => {
                  _.forEach(d.samples, (_s, j) => {
                    _.forEach(_s.notes, (_n, k) => {
                      _.forEach(_n.time, (_t, l) => {
                        canvas_data.push({
                          obj: _t,
                          aux: {
                            c_n: GROUPED_DATA.length,
                            s_n: d.samples.length,
                            n_n: _s.notes.length,
                            c_i: i,
                            s_i: j,
                            n_i: k
                          }
                        });
                      });
                    });
                  });
                });
                 
                // Send processed data
                future_vis.sockets.emit('/vis', canvas_data );
              }
           
            }
          }
          catch (e) { 
            console.error(e.toString()); 
          }
           
        }); 

        // On SC Message
        sclang.on('stdout', (d) => {
          // Send SuperCollider log to front end
          sclog.sockets.emit('/scdebuglog', {msg: d});
          
          // Siren loaded message
          if (_.startsWith(d, 'SIREN LOADED')) {
            reply.sendStatus(200);
          }

          // Converts 'd' into an object
          let re = /\[.+\]/g, match = re.exec(d);
          if(match !== null && match !== undefined && match[0] !== undefined) {
            let msg = _.split(_.trim(match[0], '[]'), ',')
            _.each(msg, function(m, i) {
              msg[i] = _.trim(m)
            })

            let time = 0;
            re = /(time:).+/g;
            match = re.exec(d);
            if(match !== null && match !== undefined && match[0] !== undefined) {
              time = _.toNumber(_.trim(match[0].substring(5, 16)));
            }

            // Relay SCSynth debug log to React
            if (_.trim(msg[0]) === '/play2') {
              let cycleInfo = _.fromPairs(_.chunk(_.drop(msg), 2));
              cycleInfo['time'] = time;
              current_cycle = cycleInfo.cycle;

              // Send current cycle playback info to front end  
              sclog.sockets.emit('/sclog', { trigger: cycleInfo });
            }
            else if (_.startsWith(_.trim(msg[0]), '/orbit' )) { 
              // Send RMS to the front end
              sclog.sockets.emit('/rms', {
                orbit: msg[0],
                peak: _.toNumber(_.drop(msg)[3]),
                rms: _.toNumber(_.drop(msg)[4])
              });
            }
          }
        });

        setTimeout(function() {
          const samples = fs.readFileSync(config.scd_start).toString()
          sclang.interpret(samples).then((samplePromise) => {
            console.log(' ## -->   SuperCollider initialized');
            
            // compile functions for Tidal future values
            self.sendFutureExprs();
          });
        }, 4000)
      });
    });
  }
    

    
  start(config, reply) {
    this.doSpawn(config);
    this.initGHC(config);
    this.initSCSynth(config, reply);
  }

  stdinWrite(pattern) {
    this.repl.stdin.write(pattern);
  }

  tidalSendLine(pattern) {
    this.stdinWrite(pattern);
    this.stdinWrite('\n');
  }

  tidalSendExpression(expression) {
    this.tidalSendLine(':{');
    this.tidalSendLine(expression);
    this.tidalSendLine(':}');
  }
  sendFutureExprs() {
    // DONOT MODIFY FORMATTING
    this.tidalSendExpression('let (sirenChan, sirenChan_p) = pF \"sirenChan\" (Nothing)');
    this.tidalSendExpression("import Sound.OSC.FD");
    this.tidalSendExpression("import Sound.Tidal.Utils");
    this.tidalSendExpression("import qualified Data.Aeson as A");
    this.tidalSendExpression(`
    killSnd :: (a, b, c) -> (a, c)
    killSnd (a,b,c) = (a,c)`);
    this.tidalSendExpression(`
    instance A.ToJSON Value where
      toJSON (VS s) = A.toJSON s
      toJSON (VF f) = A.toJSON f
      toJSON (VI i) = A.toJSON i`);
    this.tidalSendExpression(`
    instance A.ToJSON Param where
      toJSON param = A.toJSON (name param)`);
    this.tidalSendExpression("instance A.ToJSONKey Param");
    this.tidalSendExpression(`
    let wrapDirts ds = do x <- openUDP "127.0.0.1" 57121
                          let f (n,d) p = do now <- getNow
                                             sendOSC x $ Message "/vis" [int32 (floor now),
                                                                         Blob $
                                                                         Data.ByteString.Lazy.fromStrict $
                                                                         Data.ByteString.Char8.pack $
                                                                         show $
                                                                         A.encode $ A.toJSON $
                                                                         map killSnd $
                                                                         arc p (now+0, now+11)]
                                             d p
                              fs = map f (enumerate ds)
                          return fs`);
    this.tidalSendExpression("[x1,x2,x3,x4,x5,x6,x7,x8,x9] <- wrapDirts [d1,d2,d3,d4,d5,d6,d7,d8,d9]");
  }

  sendSCLang(message) {
    this.sc.interpret(message)
      .then(function(result) {
        console.log(" ### sendSC: " , result);
      }, function(error) {
        console.error("### sendSC ERROR:" , error);
      });
  }

  sendSC(message, reply) {
    this.sc.interpret(message)
      .then(function(result) {
        console.log(" ### sendSC: " , result);
        reply.status(200).json({sc_result: result});
      }, function(error) {
        console.error("### sendSC ERROR:" , error);
        reply.status(500).json({sc_result: undefined});
      });
  }
}

const SirenComm = {
  siren_console: new REPL()
}

const Siren = () => {

    const app = express();
    app.use(bodyParser.json({limit:'50mb'}))
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    
    const tidalPatternQueue = new Queue((pat, cb) => {
      SirenComm.siren_console.tidalSendExpression(pat);
      cb(null, result);
    },{ });

    const sendPattern = (expr) => {
      SirenComm.siren_console.tidalSendExpression(expr);
    };

    const startSiren = (b_config, reply) => {
      try{
        SirenComm.siren_console = new REPL();
        SirenComm.siren_console.start(b_config, reply);
      }catch(e) { 
        reply.sendStatus(500);
      }
    };
  
    const stopSiren = (req, reply) => {
      sendScPattern("s.quit;", null);
      stopPulse(null);
      SirenComm.siren_console = null;
      this.repl.exit();
    };

    const sendScPattern = (pattern, reply) => {
      SirenComm.siren_console.sendSC(pattern, reply);
    };
  
    //Pattern Stream <->
    app.post('/patternstream', (req, reply) => {
      const { step, channel, patterns, global_mod } = req.body;
      let k = channel.name, v = step;
      
      const getParameters = (v) => {
        let param = [];
        _.map(_.split(v, /[`]+/g), (p1, p2) => {
          p1 = _.trim(p1);
    
          if(p1 !== "") param.push(p1);
        });
        return param;
      }
      const processParameters = (parameters, newCommand, cellItem) => {
        // For each parameter in parameter list
        _.forEach(parameters, function(value, i) {
          // Temporal parameter
          if(value === 't') {
            newCommand = _.replace(newCommand, new RegExp("`t`", "g"), channel.time);
          }
          // Random parameter
          else if(_.indexOf(cellItem[i], '|') === 0 && _.lastIndexOf(cellItem[i], '|') === cellItem[i].length-1)
          {
            cellItem[i] = cellItem[i].substring(1, _.indexOf(cellItem[i], '|', 1));
            let bounds = _.split(cellItem[i], ',');
            if(bounds[0] !== undefined && bounds[0] !== "" &&
                bounds[1] !== undefined && bounds[1] !== ""){
                  bounds[0] = parseFloat(bounds[0]);
                  bounds[1] = parseFloat(bounds[1]);
                  newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), _.random(_.min(bounds), _.max(bounds)));
            }
          }
          // Value parameter
          else {
            // Value is NOT provided in the gridcell
            if (cellItem[i] === '' || cellItem[i] === undefined) 	{
              // Look for the default value (e.g. "`x?slow 3`")
              // eslint-disable-next-line
              let re = new RegExp("`(("+value+"\?)[^`]+)`", "g"), match = re.exec(newCommand);
    
              // We have a default parameter ready
              if (match[1] !== undefined && _.indexOf(match[1], '?') !== -1) {
                const defaultValue = match[1].substring(_.indexOf(match[1], '?')+1);
                newCommand = _.replace(newCommand, new RegExp("`("+value+")[^`]*`", "g"), defaultValue);
              }
              // We have nothing, using most general parameter i.e. 1
              else {
                newCommand = _.replace(newCommand, new RegExp("`("+value+")[^`]*`", "g"), 1);
              }
            }
            // Value IS provided in the gridcell
            else {
              newCommand = _.replace(newCommand, new RegExp("`("+value+")[^`]*`", "g"), cellItem[i]);
            }
          }
        });
        return newCommand
      }

      // pattern name
      const cellName = getParameters(v)[0];
      
      // command of the pattern
      const pat = _.find(patterns, c => c.name === cellName);
      let newCommand;

      // CPS channel handling
      // console.log("TIDAL COMMAND: " , newCommand);
      if( channel.type === 'CPS'){
        newCommand = cellName;
        console.log(newCommand);
        
        return "cps " + newCommand;
      }
      // other channels
      else if(pat !== undefined && pat !== null && pat !== "" && v !== ""){
        let cellItem = _.slice(getParameters(v), 1);
        newCommand = pat.text;
        
        // Applies parameters
        if(pat.params !== '')
          newCommand = processParameters(_.concat( _.split(pat.params, ','),'t'), newCommand, cellItem);
        else
          newCommand = processParameters(['t'], newCommand, cellItem);

        // Math Parser
        // eslint-disable-next-line
        _.forEach(_.words(newCommand, /\&(.*?)\&/g), function(val, i){
          newCommand = _.replace(newCommand, val, _.trim(math.eval(_.trim(val,"&")),"[]"));
        })

        // Prepare transition, solo & globals
        let	transitionHolder, pattern;
        
        if( channel.type === "SuperCollider"){
          pattern = newCommand;
          
          console.log("Send SuperCollider: ", pattern);
          
          sendScPattern(pattern, reply);
          // reply.status(200);
        }
        else if(channel.type === "FoxDot"){
          pattern = newCommand;
          //sendPythonPattern(pattern);
          reply.status(200).json({pattern: pattern, cid: channel.cid});
        }
        else if(channel.type === "Tidal"){
          if (channel.transition !== "" && channel.transition !== undefined ){
            let na = channel.name.substring(1,channel.name.length);
            transitionHolder = "t"+ na + " " + channel.transition + " $ ";
          }
          else {
            transitionHolder = k + " $ ";
          }
          if (global_mod.channels.includes(channel.cid.toString()) || global_mod.channels.includes(0)){
            if (global_mod.transform === undefined) global_mod.transform = '';
            if (global_mod.modifier === undefined) global_mod.modifier = '';
            newCommand = global_mod.transform + newCommand + global_mod.modifier;
          }
          pattern = transitionHolder + newCommand + " # sirenChan " + channel.activeSceneIndex.toString();
          tidalPatternQueue.push(pattern);
          reply.status(200).json({pattern: pattern, cid: channel.cid, timestamp: new Date().getMilliseconds()});
        }
        else if(channel.type === "TidalV"){
          let chn = channel.name.substring(1,channel.name.length);
          transitionHolder = "x"+ chn + " $ ";
          pattern = transitionHolder + newCommand;
          tidalPatternQueue.push(pattern);
          reply.status(200).json({pattern: pattern, cid: channel.cid, timestamp: new Date().getMilliseconds()});
        }
        else if(channel.type === ''){
          pattern = newCommand;
          tidalPatternQueue.push(pattern);
          reply.status(200).json({pattern: pattern, cid: channel.cid, timestamp: new Date().getMilliseconds()});
        }
        else{
          reply.sendStatus(400); 
        }
      }
    });

    const startPulse = (reply) => {
      if(!nano) 
        nano = new NanoTimer();

      let count = 0;
      // const callback = (nano) => {
      //   link_pulse.sockets.emit('pulse', {beat: 60,
      //                                     phase: count++,
      //                                     bpm: 120 });
      // };
      // nano.setInterval(callback, [nano], '125m');

      let lastBeat = 0.0;
      if(!link){
        const link = new abletonlink();
      }
      link.startUpdate(60, (beat, phase, bpm) => {
        beat = 0 ^ beat;
        if(0 < beat - lastBeat) {
          link_pulse.sockets.emit('pulse', {beat: beat,
                                            phase:beat,
                                            bpm: bpm });
            lastBeat = beat;
        }
        //console.log("updated: ", beat, phase, bpm);
      });
      reply.sendStatus(200);
    }
    
    const stopPulse = (reply) => {
      if(nano){
        //nano.clearInterval();
        link.stopUpdate();
        reply.sendStatus(200);  
      }
      else{
        reply.sendStatus(400);  
      }
      
    }
    app.post('/pulse', (req, reply) => {
      startPulse(reply);
    });
    app.post('/pulseStop', (req, reply) => {
      stopPulse(reply);
    });
    app.post('/global_ghc', (req, reply) => {
      const { pattern } = req.body;
      console.log(' ## -->   Pattern inbound:', pattern);
      tidalPatternQueue.push(pattern);
      reply.sendStatus(200);
    });
  
    app.post('/console_ghc', (req, reply) => {
      const { pattern } = req.body;
      console.log(' ## -->   Pattern inbound:', pattern);
      tidalPatternQueue.push(pattern);
      reply.sendStatus(200);
    });
  
    app.post('/nano_ghc', (req, reply) => {
      const { pattern, channel } = req.body;
      console.log(' ## -->   Pattern inbound:', pattern);
      tidalPatternQueue.push(pattern);
      reply.status(200).json({pattern: pattern, cid: channel.cid, timestamp: new Date().getMilliseconds()});
    });
    app.post('/console_sc', (req, reply) => {
      const { pattern } = req.body;
      console.log(' ## -->   SC Pattern inbound:', pattern);
      sendScPattern(pattern, reply);
    })
    // Save Paths
    app.post('/paths', (req, reply) => {
      const { paths } = req.body;
      if( paths ) {
        jsonfile.writeFileSync('./server/save/paths.json', 
                                paths , 
                                {spaces: 1, flag: 'w'});

        reply.sendStatus(200);
      }
      else
        reply.sendStatus(400);
    });
    // Load Paths
    app.get('/paths', (req, reply) => {
      const obj = jsonfile.readFileSync('./server/save/paths.json');
      if ( obj )
        reply.status(200).json({ paths: obj });
      else
        reply.status(404).json({ paths: undefined });
    });
    // Save Scenes
    app.post('/scenes', (req, reply) => {
        const { scenes, patterns, channels, active_s } = req.body;

        if( scenes && patterns && channels) {
          jsonfile.writeFileSync('./server/save/scene.json', 
                                  { 'scenes': scenes, 
                                    'active_s': active_s, 
                                    'patterns': patterns,
                                    'channels': channels }, 
                                    {spaces: 1, flag: 'w'});

          reply.sendStatus(200);
        }
        else
          reply.sendStatus(400);
    });
    // Load Scenes
    app.get('/scenes', (req, reply) => {
      const obj = jsonfile.readFileSync('./server/save/scene.json');
      if ( obj.scenes && obj.active_s && obj.patterns && obj.channels )
        reply.status(200).json({ 'scenes': obj.scenes,
                                 'active_s': obj.active_s, 
                                 'patterns': obj.patterns,
                                 'channels': obj.channels });
      else
        reply.status(404).json({ layouts: undefined });
    });

    // Save Globals
    app.post('/globals_save', (req, reply) => {
      const { globals } = req.body;
      if( globals ) {
        jsonfile.writeFileSync('./server/save/globals.json', 
                                globals, 
                                {spaces: 1, flag: 'w'});

        reply.sendStatus(200);
      }
      else
        reply.sendStatus(400);
    });
    
    // Load Globals
    app.get('/globals_load', (req, reply) => {
      const obj = jsonfile.readFileSync('./server/save/globals.json');
      if ( obj )
        reply.status(200).json({ globals: obj });
      else
        reply.status(404).json({ globals: undefined });
    });
    // Save Console
    app.post('/console', (req, reply) => {
      const { sc, tidal } = req.body;
      // console.log(tidal, sc, req.body);
      if( tidal !== undefined && sc !== undefined) {
        
        jsonfile.writeFileSync('./server/save/console.json', 
                                { 'sc': sc, 
                                  'tidal': tidal }, 
                                {flag: 'w'});

        reply.sendStatus(200);
      }
      else reply.sendStatus(400);
    });
    // Load Console
    app.get('/console', (req, reply) => {
      const obj = jsonfile.readFileSync('./server/save/console.json');
      if ( obj.tidal !== undefined && obj.sc !== undefined)
        reply.status(200).json({ 'sc': obj.sc,
                                 'tidal': obj.tidal });
      else
        reply.status(404).json({ layouts: undefined });
    });


    // Save Layouts
    app.post('/layouts', (req, reply) => {
      const { layouts, customs } = req.body;

      if( layouts ) {
        jsonfile.writeFileSync('./server/save/layout.json', 
                                { 'layouts' : layouts, 'customs' : customs }, 
                                {spaces: 1, flag: 'w'});

        reply.status(200).json({ saved: true });
      }
      else
        reply.status(400).json({ saved: false });
    });

    // Load Layouts
    app.get('/layouts', (req, reply) => {
      const obj = jsonfile.readFileSync('./server/save/layout.json');
      if ( obj )
        reply.status(200).json({ layouts: obj.layouts, customs: obj.customs });
      else
        reply.status(404).json({ layouts: undefined, customs: undefined });
    });

    app.post('/init', (req, reply) => {
      const { b_config } = req.body;
      if( b_config ) {
        startSiren(b_config, reply);
      }
      else
        reply.sendStatus(400);
    });

    app.get('/quit', (req, reply) => {
      try{
        stopSiren(req, reply);
        reply.sendStatus(200);
      }catch(error) {
        reply.sendStatus(500);
      }
    });

    app.listen(3001, () => {
      console.log(` ## -->   Server started at http://localhost:${3001}`);

    });
    
    
  }

  // process.on('SIGINT', () => {
  //   if (TidalData.TidalConsole.repl !== undefined) TidalData.TidalConsole.repl.kill();
  //   process.exit(1)
  // });
  //app.use("/", express.static(path.join(__dirname, "build")));
  module.exports = Siren;




