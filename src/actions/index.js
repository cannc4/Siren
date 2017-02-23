

var bjork = require('bjorklund');
export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR';
import axios from 'axios';
import _ from 'lodash';
import Firebase from 'firebase';
import store from '../store';

Firebase.initializeApp({

     apiKey: "AIzaSyD7XtMeL8wakGWpsK4Vbg7zdkPkLQzjaGI",
     authDomain: "eseq-f5fe0.firebaseapp.com",
     databaseURL: "https://eseq-f5fe0.firebaseio.com"

});

const models = {
  Accounts: {
    dataSource: Firebase.database().ref("/accounts"),
    model: {
      name: 'String',
      email: 'String',
      providerData: 'Object',
    }
  },
  Commands: {
    dataSource: Firebase.database().ref("/commands"),
    model: {
      name: 'String',
      params: 'String',
      command: 'String',
      skey: 'String'
    }
  },
  Live: {
    dataSource: Firebase.database().ref("/live"),
    model: {
      timer: 'Object',
      values: 'Object'
    }
  },
  Matrices: {
    dataSource: Firebase.database().ref("/matrices"),
    model: {
      name: 'String',
      values: 'Object',
      commands: 'Object',
      sceneIndex: 'Integer'
    }
  }
}
//
// var client = dgram.createSocket('udp4');
//
// client.on('listening', function () {
//     var address = client.address();
//     console.log('UDP Server listening on ' + address.address + ":" + address.port);
// });
//
// client.on('message', function (message, remote) {
//
//     console.log(remote.address + ':' + remote.port +' - ' + message);
//
// });
//
// client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
//
//     if (err) throw err;
//     console.log('UDP message sent to ' + HOST +':'+ PORT);
//
// var PORT = 3002;
// var HOST = '127.0.0.1';
//
// var client = dgram.createSocket('udp4');
//
// client.on('listening', function () {
//     var address = client.address();
//     console.log('UDP Server listening on ' + address.address + ":" + address.port);
// });
//
// client.on('message', function (message, remote) {
//
//     console.log(remote.address + ':' + remote.port +' - ' + message);
//
// });
//
//
// export const incTimer = () => {
//   return { type: 'INC_TIMER'}
// };
//
// export const click = () => {
//   return dispatch => {
//     timer = setInterval(x, (duration / steps * 1000), dispatch);
//   }
// }
// export const incClick = () => {
//   return { type: 'INC_TIMER'}
// };
//


export function sendZapier(data) {
  const { url } = data;
  delete data.url;
  axios.post(url, JSON.stringify(data))
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}

export function fetchModels() {
  return _.map(models, (e, key) => { return key.toLowerCase() })
}

export function fetchModel(model) {
  return models[model].model
}

export function fbaccount(data) {
  return dispatch => {
    const updates = {}
    updates[data['key']] = data;

    models['Accounts'].dataSource.update(updates, () => {
      models['Accounts'].dataSource.child(data['key']).on('value', (account) => {
        dispatch({
          type: 'FETCH_USER',
          payload: account.val()
        })
      })
    })
  }
}

export function fbauth() {
  return dispatch => {
    Firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        dispatch({
          type: FETCH_USER,
          payload: dispatch(fbaccount({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            key: user.uid
          }))
        })
      }
    })

  }
}

export function fbfetch(model) {
  return dispatch => {
    models[model].dataSource.ref.on('value', data => {
      if (Firebase.auth().currentUser !== null)
      {
        const { uid } = Firebase.auth().currentUser;
        const u = _.find(data.val(), (d) => d.uid === uid);

        if (u !== null && u !== undefined) {
          if (models[model].watch !== undefined) {
            _.each(models[model].watch, (m,i) => {
              if (u[i] !== undefined) {
                dispatch(m(u[i]));
              }
            })
          }
        }
      }
      dispatch({
        type: 'FETCH_' + model.toUpperCase(),
        payload: data.val()
      })
    })
  }
}
export function fbfetchscenes(model) {
  return dispatch => {
    models[model].dataSource.ref.orderByChild('sceneIndex').on('value', data => {
      var temp = [];
      data.forEach(function(c){
        temp.push(c.val());
      })
      if (Firebase.auth().currentUser !== null)
      {
        const { uid } = Firebase.auth().currentUser;
        const u = _.find(data.val(), (d) => d.uid === uid);

        if (u !== null && u !== undefined) {
          if (models[model].watch !== undefined) {
            _.each(models[model].watch, (m,i) => {
              if (u[i] !== undefined) {
                dispatch(m(u[i]));
              }
            })
          }
        }
      }
      dispatch({
        type: 'FETCH_' + model.toUpperCase(),
        payload: temp
      })
    })
  }
}
export function fbcreate(model, data) {
  if (data['key']) {
    return models[model].dataSource.child(data['key']).update({...data})
  } else {
    const newObj = models[model].dataSource.push(data);
    return newObj.update({ key: newObj.key })
  }
}
export function fbcreatecommandinscene(model, data, s_key) {
  if (data['key']) {
    return models[model].dataSource.child(data['key']).update({...data})
  } else {
    const newObj = models[model].dataSource.child(s_key).child("commands").push(data);
    return newObj.update({ key: newObj.key })
  }
}
export function fbFetchLive (model){

  return dispatch => {
    models[model].dataSource.ref.on('value', data => {

      if(data.val().timer.notf === "start") {
        store.dispatch(startTimer(data.val().timer.duration, data.val().timer.steps));
      }
      else if(data.val().timer.notf === "pause"){
        store.dispatch(pauseTimer());
      }
      else if(data.val().timer.notf === "stop"){
        store.dispatch(stopTimer());
      }

      store.dispatch(fbLiveUpdate(data.val().values));
    });
  }

}

export const fbLiveUpdate = (values) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }

  _.forEach(values, function(rowValue, rowKey) {
    _.forEach(rowValue, function(cell, colKey) {
      placeValue(rowKey-1, colKey, cell, values);
    });
  });

  return dispatch => {
    dispatch({ type: 'FETCH_LIVE_MAT', payload: values});
  };
}

export function fbLiveTimer(model, data) {
  models[model].dataSource.child('timer').set(data);
}

export function fbSyncMatrix (model,data){
  models[model].dataSource.child('timer').set({duration: data.duration,
              steps: data.steps,
              notf: "running"});
  return models[model].dataSource.child('values').update(data.values);
}

export function fbcreateMatrix(model, data) {
  console.log('DATA::');
  console.log(data);
  var datakey, sceneIndex, values, commands;
  models[model].dataSource.ref.once('value', dat => {
    const obj = _.find(dat.val(), (d) => d.matName === data.matName);
    datakey = obj.key;
    sceneIndex = obj.sceneIndex;
    commands = obj.commands;
  });

  console.log(commands);

  if (datakey) {
    data.sceneIndex = sceneIndex;
    return models[model].dataSource.child(datakey).update({...data})
  } else {
    const newObj = models[model].dataSource.push(data);
    return newObj.update({ key: newObj.key })
  }
}
export function fbupdateMatrix(model, data) {
  models[model].dataSource.child(data['key']).update({...data})
}

export function fbupdate(model, data) {
  models[model].dataSource.child(data['key']).update({...data})
}
export function fbupdatecommandinscene(model, data, s_key) {
  // console.log(data);
  models[model].dataSource.child(s_key).child("commands").child(data['key']).update({...data})
}
export function fbdelete(model, data) {
  models[model].dataSource.child(data['key']).remove();
}
export function fbdeletecommandinscene(model, data, s_key) {
  models[model].dataSource.child(s_key).child("commands").child(data['key']).remove();
}
export function fborder(model, data, key) {
  models[model].dataSource.child(key).update({...data})
  models[model].dataSource.orderByChild('sceneIndex');
}

export function facebookLogin() {
  return (dispatch) => {
    const provider = new Firebase.auth.FacebookAuthProvider();
    Firebase.auth().signInWithPopup(provider).then(result => {
      console.log('Logged in. You will receive authState from Firebase')
    }).catch(error => {
      dispatch({
        type: FETCH_USER_ERROR,
        payload: error
      })
    });
  }
}

export function googleLogin() {
  return (dispatch) => {
    const provider = new Firebase.auth.GoogleAuthProvider();
    Firebase.auth().signInWithPopup(provider).then(result => {
      console.log('Logged in. You will receive authState from Firebase')
    }).catch(error => {
      dispatch({
        type: FETCH_USER_ERROR,
        payload: error
      })
    });
  }
}

export function logout() {
  return dispatch => {
    Firebase.auth().signOut();
    dispatch({ type: FETCH_USER, payload: {} });
  }
}


export const initMyTidal = (server) => {
  return dispatch => {
    axios.get('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/tidal')
    .then((response) => {
      dispatch({type: 'FETCH_TIDAL', payload: response.data })
    }).catch(function (error) {
      console.error(error);
    });
  }
}

// export const TidalTick = (server) => {
//   return dispatch => {
//     axios.get('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/tidaltick')
//     .then((response) => {
//       dispatch({type: 'FETCH_TIDAL', payload: response.data })
//     }).catch(function (error) {
//       console.log(error);
//     });
//   }
// }

export const sendCommands = (server,vals, commands =[]) => {
  return dispatch => {
  const x =  _.compact(_.map(vals,(v,k) => {
      const cellName = _.split(v, ' ', 1)[0];
      const cmd = _.find(commands, c => c.name === cellName);
      if(cmd !== undefined && cmd !== null && cmd !== "" && v !== ""){
        var cellItem = _.split(v, ' ');
        var newCommand = cmd.command;
        var parameters = _.split(cmd.params, ',');

        _.forEach(parameters, function(value, i) {
          if(_.indexOf(cellItem[i+1], '[') != -1 ){
            cellItem[i+1] = cellItem[i+1].substring(1, _.indexOf(cellItem[i+1], ']'));
            var bounds = _.split(cellItem[i+1], ',');
            if(bounds[0] !== undefined && bounds[0] !== "" &&
               bounds[1] !== undefined && bounds[1] !== ""){
                 bounds[0] = parseFloat(bounds[0]);
                 bounds[1] = parseFloat(bounds[1]);

                 cellItem[i+1] = _.random(_.min(bounds), _.max(bounds));
                 newCommand = _.replace(newCommand, new RegExp("&"+value+"&", "g"), cellItem[i+1]);
            }
          }
          else {
            newCommand = _.replace(newCommand, new RegExp("&"+value+"&", "g"), cellItem[i+1]);
          }
        });

        // var append = "";
        // switch (k) {
        //   case "d1":
        //     append = " # orbit \"4\""; break;
        //   case "d2":
        //     append = " # orbit \"5\""; break;
        //   case "d3":
        //     append = " # orbit \"6\""; break;
        //   case "d4":
        //     append = " # orbit \"7\""; break;
          // case "d5":
          //   append = " # orbit \"4\""; break;
          // case "d6":
          //   append = " # orbit \"5\""; break;
          //   case "d7":
          //     append = " # orbit \"6\""; break;
          //     case "d8":
          //       append = " # orbit \"6\""; break;
          // default:
          //   break;
        //}

        //, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"

        return [ k + ' $ ' + newCommand, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;

      } else return false;
    }))
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/commands', { 'commands': x })
    .then((response) => {
      //dispatch({ type: 'SET_CC', payload: {channel, command} })
    }).catch(function (error) {
      console.log(error);
    });
  }
}
// export const sendSCMatrix = (server,vals,commands =[]) => {
//
//   return dispatch => {
//       const fsc =  _.compact(_.map(vals,(v,k) => {
//       const sccm = vals['~qcap'];
//
//       const cmd = _.find(commands, c => c.name === sccm);
//       if(cmd !== undefined){
//         var append = ');';
//         var prepend = '~qcap'
//         const msg =  prepend+ '.' + "set(\\obs," + cmd.command + append;
//         console.log(msg);
//         return msg;
//       }
//        else return false;
//     }))
//     console.log(fsc);
//     axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/sccommand', { 'command': fsc })
//
//     .then((response) => {
//         dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
//     }).catch(function (error) {
//       console.log(error);
//     });
//   }
// }
//

export const updateMatrix = (commands, values, i) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }

  _.forEach(values, function(rowValue, rowKey) {
    _.forEach(rowValue, function(cell, colKey) {
      placeValue(rowKey-1, colKey, '', values);
    });
  });

  _.forEach(i.values, function(rowValue, rowKey) {
    _.forEach(rowValue, function(cell, colKey) {
      placeValue(rowKey-1, colKey, cell, values);
    });
  });

  return dispatch => {
    dispatch({ type: 'ADD_TIMER'});
  };
}

export const celluarFill = (values, commands, density, steps, duration, channels, timer) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }
  function updateCelluar(){
    var resultVals = {};

    function pickRandom(x, y){
      var cmd, randIndex;
      if(y >= channels.length-4){
        do{
          randIndex = _.random(0, Object.keys(commands).length-1);
        }while(_.includes(Object.values(commands)[randIndex].command, "Message") === false);
        cmd = Object.values(commands)[randIndex].name;
      }
      else {
        do{
          randIndex = _.random(0, Object.keys(commands).length-1);
        }while(_.includes(Object.values(commands)[randIndex].command, "Message") === true);
        cmd = Object.values(commands)[randIndex].name;
      }
      return cmd;
    }

    function _countNeighbours(x, y) {
        x = parseInt(x);
        var amount = 0,
            x_minus_1 = x > 1 ? x-1 : undefined,
            x_plus_1 = x < steps ? x+1 : undefined,
            y_minus_1 = _.indexOf(channels, y) > 0 ? _.nth(channels, _.indexOf(channels, y)- 1) : undefined,
            y_plus_1 = _.indexOf(channels, y) < channels.length-1 ? _.nth(channels, _.indexOf(channels, y) + 1) : undefined;

        function _isFilled(x, y) {
            if(x === undefined || y === undefined)
              return false;
            if(values[x] === undefined || values[x][y] === undefined || values[x][y] === "")
              return false;
            return true;
        }

        if (_isFilled(x_minus_1, y_minus_1)) amount++;
        if (_isFilled(x,         y_minus_1)) amount++;
        if (_isFilled(x_plus_1,  y_minus_1)) amount++;
        if (_isFilled(x_minus_1, y  )) amount++;
        if (_isFilled(x_plus_1,  y  )) amount++;
        if (_isFilled(x_minus_1, y_plus_1)) amount++;
        if (_isFilled(x,         y_plus_1)) amount++;
        if (_isFilled(x_plus_1,  y_plus_1)) amount++;

        return amount;
    }

    var counts = {};

    for (var i = 1; i <= steps; i++) {
      for (var j = 0; j < channels.length; j++) {
        var count = _countNeighbours(i, _.nth(channels, j)),
            alive = "";

        placeValue(i-1, _.nth(channels, j), count, counts);


        if(values[i] !== undefined){
          if(values[i][_.nth(channels, j)] === undefined || values[i][_.nth(channels, j)] === ""){
            alive = count === 3 ? pickRandom(i, j) : "";
          }
          else{
            alive = count === 2 || count === 3 ? pickRandom(i, j) : "";
          }

          placeValue(i-1, _.nth(channels, j), alive, resultVals);
        }
      }
    }

    _.forEach(resultVals, function(rowValue, rowKey) {
      _.forEach(rowValue, function(cell, colKey) {
        placeValue(rowKey-1, colKey, cell, values);
      });
    });

    // Cleans up empty values
    _.forEach(values, function(rowValue, key) {
      if(rowValue !== undefined){
        values[key] = _.pickBy(rowValue, function(n){ return n != "";});
      }
    });
  }

  if(timer.current % steps === steps-1 && timer.isCelluarActive)
  {
    updateCelluar();
    return dispatch => {
    };
  }

  return dispatch => {
    dispatch({ type: 'FETCH_TIMER'});
  }
}
export const addValues = (values, commands, density, steps, duration, channels, timer) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }

  function addItems(){
    var command_len = Object.keys(commands).length;
    var channel_len = channels.length;

    // Add random
    var item_count = steps*channels.length*density/100;

    for (var i = 0; i < item_count; i++) {
      var row = _.random(0, steps-1);
      var col;
      var randIndex = _.random(0, command_len-1);

      if(_.includes(Object.values(commands)[randIndex].command, "Message")){
        col = channels[_.random(channel_len-4, channel_len-1)];
      }
      else {
        col = channels[_.random(0, channel_len-7)];
      }

      placeValue(row, col, Object.values(commands)[randIndex].name, values);
    }
  }

  return dispatch => {
    addItems();
    dispatch({ type: 'ADD_TIMER'});
  }
}
export const celluarFillStop = () => {
  return dispatch => {
    dispatch({ type: 'FETCH_STOP_TIMER'});
  }
}

export const bjorkFill = (values, commands, density, steps, duration, channels, timer) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }
  function pickRandom(x, y){
    var cmd, randIndex;
    if(y >= channels.length-6){
      do{
        randIndex = _.random(0, Object.keys(commands).length-1);
      }while(_.includes(Object.values(commands)[randIndex].command, "Message") === false);
      cmd = Object.values(commands)[randIndex].name;
    }
    else {
      do{
        randIndex = _.random(0, Object.keys(commands).length-1);
      }while(_.includes(Object.values(commands)[randIndex].command, "Message") === true);
      cmd = Object.values(commands)[randIndex].name;
    }
    return cmd;
  }

  function updateBjork() {
    var countArr = [];
    _.forEach(channels, function(channel, c_key){
      var count = 0;
      _.forEach(values, function(rowValue, rowKey) {
        if(values[rowKey] !== undefined && values[rowKey][channel]) {
          count++;
        }
      });
      countArr[c_key] = count;
    });
    var tempArr = [-1, 1];
    _.forEach(countArr, function(item, key) {
      countArr[key] = _.clamp(_.nth(tempArr, _.random(0, 1))+item, 1, steps/2);
    })

    var channel_len = channels.length;
    // Euclidean Rythm
    for (var i = 0; i < channel_len; i++) {
      //var str = bjork(scale(i, 0, channel_len, 3, 7), steps);
      var str = bjork(_.nth(countArr, i), steps);

      for (var j = 0; j < str.length; j++) {
        var row = j;
        var col = _.nth(channels, i);
        if(str[j] === '1'){
          if(parseInt((i/3)%2) === 0)
            placeValue(row+1, col, pickRandom(row+1, i), values);
          else
            placeValue(row, col, pickRandom(row, i), values);
        }
      }
    }
    // Cleans up empty values
    _.forEach(values, function(rowValue, key) {
      if(rowValue !== undefined){
        values[key] = _.pickBy(rowValue, function(n){ return n != '';});
      }
    });
  }

  if(timer.current % steps === steps-1 && timer.isBjorkActive)
  {
    updateBjork();
    return dispatch => {};
  }

  return dispatch => {
    dispatch({ type: 'FETCH_2_TIMER'});
  }
}
export const addBjorkValues = (values, commands, density, steps, duration, channels, timer) => {
  function scale(value, r_min, r_max, o_min, o_max) {
    return parseInt(((value-r_min)/(r_max-r_min))*o_max+o_min);
  }
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }
  function pickRandom(x, y){
    var cmd, randIndex;
    if(y >= channels.length-4){
      do{
        randIndex = _.random(0, Object.keys(commands).length-1);
      }while(_.includes(Object.values(commands)[randIndex].command, "Message") === false);
      cmd = Object.values(commands)[randIndex].name;
    }
    else {
      do{
        randIndex = _.random(0, Object.keys(commands).length-1);
      }while(_.includes(Object.values(commands)[randIndex].command, "Message") === true);
      cmd = Object.values(commands)[randIndex].name;
    }
    return cmd;
  }

  function addItems(){
    var command_len = Object.keys(commands).length;
    var channel_len = channels.length;

    // Euclidean Rythm
    for (var i = 0; i < channel_len; i++) {
      //var str = bjork(scale(i, 0, channel_len, 3, 7), steps);
      var str = bjork(_.random(parseInt(steps/8), parseInt(steps/3)), steps);

      for (var j = 0; j < str.length; j++) {
        var row = j;
        var col = _.nth(channels, i);
        if(str[j] === '1'){
          if(parseInt((i/3)%2) == 0)
            placeValue(row+1, col, pickRandom(row+1, i), values);
          else {
            placeValue(row, col, pickRandom(row, i), values);
          }
        }
      }
    }
  }

  return dispatch => {
    addItems();
    dispatch({ type: 'ADD_TIMER'});
  }
}
export const bjorkFillStop = () => {
  return dispatch => {
    dispatch({ type: 'FETCH_STOP_2_TIMER'});
  }
}

export const sendScCommand = (server, expression) => {
  return dispatch => {
    if (!expression) return;

    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/sccommand', { 'command': expression })
    .then((response) => {
      dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const consoleSubmit = (server, expression) => {
  return dispatch => {
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/command', { 'command': [expression] })
    .then((response) => {
      //dispatch({ type: 'SET_CC', payload: {channel, command} })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const resetCommand = () => ({type: 'RESET_CC'});
export const fetchCommand = () => ({type: 'FETCH_CC'});



var timer = [];
export function startIndividualTimer(_index,_duration, _steps) {
    timerWorker[_index].postMessage({type : "start", id: _index, duration: _duration, steps: _steps, timer: timer[_index]});
}

export const updateTimerduration = (_index,_duration,_steps) => {
  //timerWorker[_index].postMessage({type : "update", id: _index, duration: _duration, steps: _steps,timer: timer[_index]});
  return {
    type: 'UPDATE_TIMER', payload: _index, duration : _duration
  }
}
var timerWorker= [];
export const createTimer = (_index,_duration, _steps) => {

    timerWorker[_index] = new Worker("src/actions/tworker.js");
    timerWorker[_index].onmessage = function(e) {
        if (e.data.type == "tick") {
             //console.log(_index + "tick!")
            store.dispatch(updtmr(e.data.id));
            timer[_index] = e.data.msg;
        }
        else
            console.log("message: " + e.data);
    }
    return {
    type: 'CREATE_TIMER', payload: _index, duration : _duration
  }
}
export const updtmr = (_index) => {

  return {
       type: 'INC_TIMER', payload: _index
     }
}

export const pauseIndividualTimer = (_index) => {
  timerWorker[_index].postMessage({type : "pause", id: _index,timer: timer[_index]});
  //clearInterval(timer[_index]);
  console.log("PAUSE TIMER");
  console.log(timer);
  return {
    type: 'PAUSE_TIMER', payload: _index
  }
}

export const stopIndividualTimer = (_index) => {
  timerWorker[_index].postMessage({type : "stop", id: _index,timer: timer[_index]});
  //clearInterval(timer[_index]);
  return {
    type: 'STOP_TIMER', payload: _index
  }
}


export function startClick() {
  return dispatch => {
    dispatch({ type: 'INC_CLICK'});
  }
}

export function stopClick() {
  return dispatch => {
    dispatch({ type: 'STOP_CLICK'});
  }
}
