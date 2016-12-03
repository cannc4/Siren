import _ from 'lodash';
import config from '../config/index.js'
console.log(config.path)

import fs from 'fs';
import { spawn } from 'child_process';
import errorHandler from './errorHandler';
import express from 'express';
import bodyParser from 'body-parser';

const bootFilePath = `${__dirname}/BootTidal.hs`;
const startSCD = `${__dirname}/start.scd`;
const supercolliderjs = require('supercolliderjs');
const socketIo = require ('socket.io');
//


// REPL is an GHCI Instance
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
    this.myCommands = { values: [] };
    console.log(config)
    const commands = fs.readFileSync(config.tidal_boot).toString().split('\n');
    for (let i = 0; i < commands.length; i++) {
      this.tidalSendLine(commands[i]);
    }
  }

  stdinWrite(command) {
    this.repl.stdin.write(command);
  }

  tidalSendLine(command) {
    this.stdinWrite(command);
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
    console.log('1 REMOVE LATER')
    console.log('config.path', config.path);
    supercolliderjs.resolveOptions(config.path).then((options) => {
      // console.log(options);
      const SCLang = supercolliderjs.sclang.SCLang;
      const lang = new SCLang(options);
      lang.boot().then((sclang) => {
        self.sc = lang;
        // Check users quarks folder
        // if (notExists) {

        setTimeout(function(){
          const commands = fs.readFileSync(config.scd_start).toString().replace("{samples_path}", config.samples_path)
          lang.interpret(commands);

        }, 4000)
      });
    });

  }

  sendSC(message) {
    var self = this;
    self.sc.interpret(message);
  }

  start() {
    this.doSpawn();
    this.initTidal();
    this.initSC();
    // this.sendSC('SuperDirt.start')
  }
}

const TidalData = {
  myTidal: new REPL()
}

const myApp = () => {
  const app = express();

  app.use(bodyParser.json())

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  const startTidal = (reply) => {
    if (TidalData.myTidal.repl && TidalData.myTidal.repl.killed === false) {
      reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, command: TidalData.myTidal.myCommands });
    } else {
      if (TidalData.myTidal.repl && TidalData.myTidal.repl.killed) {
        TidalData.myTidal = new REPL();
      }
      TidalData.myTidal.start();
      TidalData.myTidal.myCommands.values.push('initiate tidal');
      reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, command: TidalData.myTidal.myCommands });
    }
  };

  // const sendCommand = (expr, reply) => {
  //   console.log("mesjageldiSERVERCVERSVERVERE")
  //   TidalData.myTidal.tidalSendExpression(expr);
  //   TidalData.myTidal.myCommands.values.push(expr);
  //   reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, commands: TidalData.myTidal.myCommands });
  // };

  const sendCommands = (commands, reply) => {
    _.each(commands, c => {
      TidalData.myTidal.tidalSendExpression(c);
      TidalData.myTidal.myCommands.values.push(c);
    })
    reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, commands: TidalData.myTidal.myCommands });
  };

  const sendScCommand = (expr, reply) => {
    TidalData.myTidal.sendSC(expr);
    reply.status(200).send(expr);
  }

  app.get('/tidal', (req, reply) => startTidal(reply));

  app.post('/command', (req, reply) => {
    const { command } = req.body;
    console.log('Command inbound:', command);
    sendCommand(command, reply);
  });

  app.post('/commands', (req, reply) => {
    const { commands } = req.body;
    console.log('Command inbound:', commands);
    sendCommands(commands, reply);
  });

  app.post('/sccommand', (req, reply) => {
    const {command} = req.body;
    console.log('ScCommand inbound:', command);
    sendScCommand(command, reply);
  })

  app.get('*', errorHandler);
  app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
  });

}

process.on('SIGINT', () => {
  if (TidalData.myTidal.repl !== undefined) TidalData.myTidal.repl.kill();
  process.exit(1)
});

module.exports = myApp;
