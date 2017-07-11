import _ from 'lodash';
import config from '../config/config.json'
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import errorHandler from './errorHandler';
import express from 'express';
import bodyParser from 'body-parser';
const startSCD = `${__dirname}/scd_start-default.scd`;
const supercolliderjs = require('supercolliderjs');
const socketIo = require('socket.io');
var exec = require('child_process').exec;
var synchs = exec('cd ' + __dirname + ' && runhaskell sync.hs');

class REPL {

  hush() {
    this.tidalSendExpression('hush');
  }

  doSpawn() {
    this.repl = spawn(config.ghcipath, ['-XOverloadedStrings']);
     this.repl.stderr.on('data', (data) => {
       console.error(data.toString('utf8'));
     });
     this.repl.stdout.on('data', data => console.error(data));
  }

  initTidal() {

    this.myPatterns = { values: [] };
    const patterns = fs.readFileSync(config.tidal_boot).toString().split('\n');
    for (let i = 0; i < patterns.length; i++) {
      this.tidalSendLine(patterns[i]);
    }
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
    const splits = expression.split('\n');

    for (let i = 0; i < splits.length; i++) {
      this.tidalSendLine(splits[i]);
    }
    this.tidalSendLine(':}');
  }

  initSC() {
    const self = this;
    supercolliderjs.resolveOptions(config.path).then((options) => {
      const SCLang = supercolliderjs.sclang.SCLang;
      const lang = new SCLang(options);
      lang.boot().then((sclang) => {
        self.sc = lang;
        setTimeout(function(){
          const samples = fs.readFileSync(config.scd_start).toString().replace("{samples_path}", config.samples_path)
          lang.interpret(samples);

        }, 4000)
      });
    });
  }
  // exitSC() {
  //     const self = this;
  //     supercolliderjs.resolveOptions(config.path).then((options) => {
  //     const SCLang = supercolliderjs.sclang.SCLang;
  //     const lang = new SCLang(options);
  //     lang.quit()
  //   });
  // }
  sendSC(message) {
    var self = this;
    self.sc.interpret(message);
  }

  start() {
    this.doSpawn();
    this.initTidal();
    this.initSC();
    //synchs();
  }
}

const TidalData = {
  TidalConsole: new REPL()
}

const Siren = () => {
  const app = express();

  var udpHosts = [];
  var dgram = require("dgram");
  var UDPserver = dgram.createSocket("udp4");

  var tick = socketIo.listen(3003);

  //Get tick from sync.hs Port:3002
  UDPserver.on("listening", function () {
    var address = UDPserver.address();
    console.log("UDP server listening on " +
        address.address + ":" + address.port);
  });

  UDPserver.on("message", function (msg, rinfo) {
    // console.log("server got: " + msg + " from " +rinfo.address + ":" + rinfo.port);
    tick.sockets.emit('osc', {osc:msg});
  });

  UDPserver.on("disconnect", function (msg) {
    tick.sockets.emit('dc', {osc:msg});
  });

  UDPserver.bind(3002);

  app.use(bodyParser.json())

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  const startTidal = (reply) => {
    if (TidalData.TidalConsole.repl && TidalData.TidalConsole.repl.killed === false) {
      reply.status(200).json({ isActive: !TidalData.TidalConsole.repl.killed, pattern: TidalData.TidalConsole.myPatterns });
    } else {
      if (TidalData.TidalConsole.repl && TidalData.TidalConsole.repl.killed) {
        TidalData.TidalConsole = new REPL();
      }
      TidalData.TidalConsole.start();
      TidalData.TidalConsole.myPatterns.values.push('initiate tidal');
      reply.status(200).json({ isActive: !TidalData.TidalConsole.repl.killed, pattern: TidalData.TidalConsole.myPatterns });
    }
  };

  const sendPattern = (expr, reply) => {
    _.each(expr, c => {
      TidalData.TidalConsole.tidalSendExpression(c);
      TidalData.TidalConsole.myPatterns.values.push(c);
    })
    reply.status(200).json({ isActive: !TidalData.TidalConsole.repl.killed, patterns: TidalData.TidalConsole.myPatterns });
  };

  const sendPatterns = (patterns, reply) => {
    _.each(patterns, c => {
      TidalData.TidalConsole.tidalSendExpression(c[0]);
      TidalData.TidalConsole.tidalSendExpression(c[1]);
    })
    reply.status(200).json({ isActive: !TidalData.TidalConsole.repl.killed, patterns: TidalData.TidalConsole.myPatterns });
  };

  const sendScPattern = (expr, reply) => {
    TidalData.TidalConsole.sendSC(expr);
    console.log(expr);
    reply.status(200).send(expr);
  }

  app.use("/", express.static(path.join(__dirname, "public")));

  app.get('/tidal', (req, reply) => startTidal(reply));
  // app.get('/tidaltick', (req, reply) => startTidal(reply));

  app.post('/pattern', (req, reply) => {
    const { pattern } = req.body;
    console.log('Pattern inbound:', pattern);
    sendPattern(pattern, reply);
  });

  app.post('/patterns', (req, reply) => {
    const { patterns } = req.body;
    console.log('Pattern inbound:', patterns);
    sendPatterns(patterns, reply);
  });

  app.post('/scpattern', (req, reply) => {
    const {pattern} = req.body;
    _.replace(pattern, "\\", '');
    console.log('ScPattern inbound:', pattern);
    sendScPattern(pattern, reply);
  })

  app.get('*', errorHandler);

  app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
  });

}

process.on('SIGINT', () => {
  if (TidalData.TidalConsole.repl !== undefined) TidalData.TidalConsole.repl.kill();
  process.exit(1)
});

module.exports = Siren;
