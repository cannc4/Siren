import _ from 'lodash';
import config from '../config/index.js'
//console.log(config.path)
import osc from 'osc';
import fs from 'fs';
import { spawn } from 'child_process';
import errorHandler from './errorHandler';
import express from 'express';
import bodyParser from 'body-parser';

const bootFilePath = `${__dirname}/BootTidal.hs`;
const startSCD = `${__dirname}/start.scd`;
const supercolliderjs = require('supercolliderjs');
const socketIo = require ('socket.io');

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
    //console.log(config)
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
    //console.log("tidalSendExpression "+ expression);
    this.tidalSendLine(':{');
    const splits = expression.split('\n');

    for (let i = 0; i < splits.length; i++) {
      this.tidalSendLine(splits[i]);
    }
    this.tidalSendLine(':}');
  }

  initSC() {
    const self = this;
    //console.log('1 REMOVE LATER')
    //console.log('config.path', config.path);
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
  var serverPorts = {
      K2Side : 3002,
      ControllerSide: 3002
  };

  var udpHosts = [];

  // UDP server, listens to controllers.
  var dgram = require("dgram");
  var UDPserver = dgram.createSocket("udp4");
  // socket.io, listening to K2
  var K2IO = require('socket.io').listen(serverPorts.K2Side);

  // Got messages on the server
  UDPserver.on("message", function (msg, rinfo) {
    console.log("server got: " + msg + " from " +
      rinfo.address + ":" + rinfo.port);
      // Send them to the K2 clients
      console.log ("emitting on osc: " + msg);
      K2IO.sockets.emit('osc', {osc: msg});
  });

  UDPserver.on("listening", function () {
    var address = UDPserver.address();
    console.log("UDP server listening on " +
        address.address + ":" + address.port);
  });

  UDPserver.bind(serverPorts.ControllerSide);


//  K2IO.sockets.on('connection', function (socket) {

  //   // Tell who we are and our version
  //   socket.emit('admin', { id: 'K2OSCSERVER', version: 0.1});
  //   console.log ("Emitted ID and version on the admin channel")
  //
  //   // K2 sent us OSC data
  //   socket.on('osc', function (data) {
  //     console.log ("Received data on the 'osc' channel: " + data);
  //     // Send data on each one of the UDP hosts
  //     var message = new Buffer(data.osc, 'binary');
  //     var client = dgram.createSocket("udp4");
  //     for (var i = 0; i < udpHosts.length; i+=1) {
  //         console.log ("Sending message to " + udpHosts[i].host + ":" + udpHosts[i].port);
  //         client.send(message, 0, message.length, udpHosts[i].port, udpHosts[i].host, function(err, bytes) {
  //             console.log ("err: ", err, "bytes: ", bytes);
  //             //client.close();
  //         });
  //     }
  //   });
  //
  //   // K2 sent us admin data
  //   socket.on('admin', function (data) {
  //     console.log ("Received data on the 'admin' channel of type " + data.type);
  //     switch(data.type)
  //     {
  //     // UDP hosts on which we replicate the OSC messages
  //     case 'udphosts':
  //       udpHosts = data.content;
  //       break;
  //     default:
  //       console.error ("Unrecognized admin command: " + data.type);
  //     }
  //   });
  //});
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

  const sendCommand = (expr, reply) => {
    // console.log("mesjageldiSERVERCVERSVERVERE " + expr)
    _.each(expr, c => {
      TidalData.myTidal.tidalSendExpression(c);
      TidalData.myTidal.myCommands.values.push(c);
    })
    reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, commands: TidalData.myTidal.myCommands });
  };

  const sendCommands = (commands, reply) => {
    _.each(commands, c => {
      TidalData.myTidal.tidalSendExpression(c);
      TidalData.myTidal.myCommands.values.push(c);
    })
    reply.status(200).json({ isActive: !TidalData.myTidal.repl.killed, commands: TidalData.myTidal.myCommands });
  };

  const sendScCommand = (expr, reply) => {
    TidalData.myTidal.sendSC(expr);
    console.log(expr);
    reply.status(200).send(expr);
  }

  app.get('/tidal', (req, reply) => startTidal(reply));
  // app.get('/tidaltick', (req, reply) => startTidal(reply));

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
    _.replace(command, "\\", '');
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
