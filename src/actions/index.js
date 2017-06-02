
export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS';
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR';
import axios from 'axios';
import _ from 'lodash';
import Firebase from 'firebase';
import store from '../store';
import { handleEnterHome } from '../routes'
import worker from './tworker.js'
Firebase.initializeApp({

     apiKey: "AIzaSyD7XtMeL8wakGWpsK4Vbg7zdkPkLQzjaGI",
     authDomain: "eseq-f5fe0.firebaseapp.com",
     databaseURL: "https://eseq-f5fe0.firebaseio.com"

});

const models = {
  Accounts: {
    dataSource: Firebase.database().ref("/accounts"),
    model: {
      email: 'String',
      name: 'String',
      uid: 'String',
    }
  },
  Patterns: {
    dataSource: Firebase.database().ref("/patterns"),
    model: {
      name: 'String',
      params: 'String',
      pattern: 'String',
      skey: 'String',
      uid: 'String'
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
      durations: 'Object',
      values: 'Object',
      transitions: 'Object',
      patterns: 'Object',
      sceneIndex: 'Integer',
      storedGlobals: 'Object',
      uid: 'String'
    }
  }
}

String.prototype.replaceAt = function(index, character) {
  return this.substr(0, index) + character + this.substr(index+character.length);
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
    console.error(error);
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
          type: 'FETCH_ACCOUNTS',
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
          type: FETCH_ACCOUNTS,
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
          dispatch({
            type: 'FETCH_' + model.toUpperCase(),
            payload: u
          })
        }
      }
    })
  }
}
export function fbfetchscenes(model) {
  return dispatch => {
    models[model].dataSource.ref.orderByChild('sceneIndex').on('value', data => {
      var temp = [];
      if (Firebase.auth().currentUser !== null)
      {
        data.forEach(function(c){
          var u_id = Firebase.auth().currentUser.uid;
          if(c.val().uid === u_id)
            temp.push(c.val());
        })
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
export function fbcreatepatterninscene(model, data, s_key) {
  if (data['key']) {
    return models[model].dataSource.child(data['key']).update({...data})
  } else {
    const newObj = models[model].dataSource.child(s_key).child("patterns").push(data);
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
  if (Firebase.auth().currentUser !== null)
  {
    var datakey, sceneIndex, values, patterns, uid, transition, duration, storedGlobals;
    models[model].dataSource.ref.once('value', dat => {
      var u_id = Firebase.auth().currentUser.uid;
      if ( u_id !== null)
      {
        const obj = _.find(dat.val(), (d) => (d.matName === data.matName));
        if(obj !== undefined && obj !== null && u_id === obj.uid){
          datakey = obj.key;
          sceneIndex = obj.sceneIndex;
          // transitions = obj.transition;
          // duration = obj.duration;
          // storedGlobals = obj.globals;
          if (obj.transitions !== undefined) transition = obj.transitions;
          if (obj.globals !== undefined) storedGlobals = obj.globals;
          if (obj.patterns !== undefined) patterns = obj.patterns;
          uid = obj.uid;
        }
      }
    });

    if(patterns === undefined)
      patterns = [];

    if(transition === undefined)
      transition = [];

    if(storedGlobals === undefined)
      storedGlobals = [];

    if (datakey) {
      data.sceneIndex = sceneIndex;
      data.patterns = patterns;
      data.globals = storedGlobals;
      return models[model].dataSource.child(datakey).update({...data})
    } else {
      if (data.patterns === undefined)
        data.patterns  = [];
      if (data.transitions === undefined)
        data.transitions = [];
      if (data.globals === undefined)
          data.storedGlobals = [];

      const newObj = models[model].dataSource.push(data);
      return newObj.update({ key: newObj.key })
    }
  }
}
export function fbupdateMatrix(model, data) {
  models[model].dataSource.child(data['key']).update({...data})
}

export function fbupdate(model, data) {
  models[model].dataSource.child(data['key']).update({...data})
}
export function fbupdatepatterninscene(model, data, s_key) {
  models[model].dataSource.child(s_key).child("patterns").child(data['key']).update({...data})
}
export function fbdelete(model, data) {
  models[model].dataSource.child(data['key']).remove();
}
export function fbdeletepatterninscene(model, data, s_key) {
  models[model].dataSource.child(s_key).child("patterns").child(data['key']).remove();
}
export function fborder(model, data, key) {
  if(data.patterns === undefined)
    data.patterns = {};

  models[model].dataSource.child(key).update({...data})
  models[model].dataSource.orderByChild('sceneIndex');
}

export function GitHubLogin() {
  return (dispatch) => {
    const provider = new Firebase.auth.GithubAuthProvider();
    provider.addScope('repo');

    Firebase.auth().signInWithRedirect(provider);

    Firebase.auth().getRedirectResult().then(result => {
      if (result.credential) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
      }
      // The signed-in user info
      var user = result.user;
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      dispatch({
        type: FETCH_ACCOUNTS_ERROR,
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
        type: FETCH_ACCOUNTS_ERROR,
        payload: error
      })
    });
  }
}

export function logout() {
  return dispatch => {
    Firebase.auth().signOut();
    dispatch({ type: FETCH_ACCOUNTS, payload: {} });
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
export const exitSC = (server) => {
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
export const assignTimer = (timer,steps, _index) => {
  var dum =timer.current + (_index - timer.current%steps);
  return {
    type: 'ASSIGN_TIMER', payload: timer.id , current : dum
  };
}
// Context //
////////////////// PARSER STARTS HERE //////////////////
var math = require('mathjs');
var patListBack = [];
export const sendPatterns = (server,vals, patterns =[], solo, transition, channels, timer,globalTransformations,globalCommands, storedPatterns) => {
  return dispatch => {
    const x =  _.compact(_.map(vals,(v,k) => {

    // gets parameters list
    const getParameters = (v) => {
      var param = [];
      _.map(_.split(v, /[`]+/g), (p1, p2) => {
        p1 = _.trim(p1);

        if(p1 !== "") param.push(p1);
      });
      return param;
    }

    const getMathExpr = (v) => {
      var maths = [];
      _.map(_.split(v, /[&]+/g), (p1, p2) => {
        p1 = _.trim(p1);

        if(p1 !== "") maths.push(p1);
      });
      return maths;
    }
    // function storePatterns(){
    //
    //
    //
    // }

    // pattern name
    const cellName = getParameters(v)[0];

    // command of the pattern
    const cmd = _.find(patterns, c => c.name === cellName);

    // CPS channel handling
    if(_.indexOf(channels,k) === _.indexOf(channels,'cps')){
      var newCommand = cellName;
      return [k + " " + newCommand, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
    }
    // other channels
    else if(cmd !== undefined && cmd !== null && cmd !== "" && v !== ""){
      var cellItem = _.slice(getParameters(v), 1);
      var newCommand = cmd.pattern;

      // Construct the parameter list from command
      var parameters = _.concat( _.split(cmd.params, ','),'t');

      // For each parameter in parameter list
      _.forEach(parameters, function(value, i) {
        // Temporal parameter
        if(value === 't'){
          newCommand = _.replace(newCommand, new RegExp("`t`", "g"), timer.current);
        }
        // Random parameter
        else if(_.indexOf(cellItem[i], '|') != -1 )
        {
          cellItem[i] = cellItem[i].substring(1, _.indexOf(cellItem[i], ']'));
          var bounds = _.split(cellItem[i], ',');
          if(bounds[0] !== undefined && bounds[0] !== "" &&
             bounds[1] !== undefined && bounds[1] !== ""){
               bounds[0] = parseFloat(bounds[0]);
               bounds[1] = parseFloat(bounds[1]);

               cellItem[i] = _.random(_.min(bounds), _.max(bounds));
               newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), cellItem[i]);
          }
        }
        // Value parameter
        else {
          newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), cellItem[i]);
        }
      });

      // Math Parser
      var re = /\&(.*?)\&/g;
      _.forEach(_.words(newCommand, re), function(val, i){
        newCommand = _.replace(newCommand, val, _.trim(math.eval(_.trim(val,"&")),"[]"));
      })

      // solo or not
      var soloHolder = "d"+(k);
      var transitionHolder = "" ;
      var _k = k;
      if(_.indexOf(channels,_k) === _.indexOf(channels, 'cps')){
        transitionHolder = k;
        soloHolder = " ";
      }
      else {
        if (transition[_.indexOf(channels,_k)] === "" || transition[_.indexOf(channels,_k)] === undefined ){
          k = "d"+(k);
          soloHolder = k ;
          transitionHolder = " $ ";
        }

        else if(transition[_.indexOf(channels,_k)] !== undefined && transition[_.indexOf(channels,_k)] !== ""){
          transitionHolder = " " + transition[_.indexOf(channels,_k)]+ " $ ";
          soloHolder = "t"+(k);
        }

        else if(solo[_.indexOf(channels,_k)] === true){
          k = +(k);
          soloHolder = "solo $ " + k ;
          transitionHolder = " $ ";
        }
      }

      if(globalTransformations === undefined || globalTransformations === ''){
        globalTransformations = '';
      }
      else {
        globalTransformations = globalTransformations ;
      }


      var storepat= soloHolder+ transitionHolder+ newCommand;
      // var orbit = "#orbit " + _.indexOf(channels,_k);
      // storepat = storepat + orbit;
      storedPatterns[_k-1] = '';
      storedPatterns[_k-1] = storepat;
      var pattern = soloHolder + transitionHolder +globalTransformations+ newCommand + " " + globalCommands;
      if (_.indexOf(channels,_k) === _.indexOf(channels, 'MIDI')){
        pattern =  "m1 $ " + newCommand;
        storedPatterns[_k-1] = '';
        storedPatterns[_k-1] = pattern;
        console.log(pattern);
        //var orbit = "#orbit " + _.indexOf(channels,_k);
        return [pattern, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
      }
      else {
        storedPatterns[_k-1] = '';
        // var orbit = "#orbit " + _.indexOf(channels,_k);
        // pattern = pattern + orbit ;
        storedPatterns[_k-1] = pattern;
        return [pattern, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
      }
    }
    else
      return false;
    }))
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/patterns', { 'patterns': x })
    .then((response) => {
    }).catch(function (error) {
      console.error(error);
    });
  }
}
// export const storePatterns = (sp) => {
//   return {
//     type: 'PATTERN_GLOBAL', payload: sp
//   }
// }
export const continousPattern = (server, pattern) => {
  return dispatch => {
    const x = pattern;
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [x,"sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+6+"\"]"] })
    .then((response) => {
    }).catch(function (error) {
      console.error(error);
    });
  }
}
////////////////// PARSER ENDS HERE //////////////////



export const updateMatrix = (patterns, values, i, transition, duration, steps, channels) => {
  function placeValue2D(row, col, item, container){
    if(item !== undefined){
      if (container[parseInt(row)+1] === undefined)
        container[parseInt(row)+1] = {};
      container[parseInt(row)+1][col] = item;
    }
  }
  function placeValue1D(index, item, container){
    if(item !== undefined)
      container[parseInt(index)] = item;
    else
      container[parseInt(index)] = '';

      // if (container[parseInt(index)] === undefined)
      //   container[parseInt(index)] = '';
  }

  _.forEach(values, function(rowValue, rowKey) {
    _.forEach(rowValue, function(cell, colKey) {
      placeValue2D(rowKey-1, colKey, '', values);
    });
  });

  _.forEach(i.values, function(rowValue, rowKey) {
    _.forEach(rowValue, function(cell, colKey) {
      placeValue2D(rowKey-1, colKey, cell, values);
    });
  });

  for (var i = 0; i < channels.length; i++) {
    placeValue1D(i, transition[i], transition);
  }

  _.forEach(duration, function(obj, index) {
    store.dispatch(updateTimerduration(index,obj,steps));
  });

  // TODO durations

  return dispatch => {
    dispatch({ type: 'ADD_TIMER'});
  };
}

export const sendScPattern = (server, expression) => {
  return dispatch => {
    if (!expression) return;
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/scpattern', { 'pattern': expression })
    .then((response) => {
      dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
    }).catch(function (error) {
    });
  }
}

export const consoleSubmit = (server, expression) => {
  return dispatch => {
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [expression] })
    .then((response) => {
    }).catch(function (error) {
      console.error(error);
    });
  }
}


export const globalUpdate = (t, c) => {
  return {
    type: 'UPDATE_GLOBAL', transform: t, command: c
  }
}
export const globalStore = (storedG) => {
  return {
    type: 'STORE_GLOBAL', storedGlobals: storedG
  }
}

export const resetPattern = () => ({type: 'RESET_CC'});
export const fetchPattern = () => ({type: 'FETCH_CC'});

var timer = [];
export const updateTimerduration = (_index,_duration,_steps) => {
  if(_duration === "" || !isNaN(parseInt(_duration)))
    return {
      type: 'UPDATE_TIMER', payload: _index, duration : _duration
    }
}

var timerWorker= [];
export const createTimer = (_index,_duration, _steps) => {

    timerWorker[_index] = new Worker("./src/actions/tworker.js");
    timerWorker[_index].onmessage = function(e) {
      if (e.data.type == "tick") {
          store.dispatch(updtmr(e.data.id));
          console.log("e.data.msg", e.data.msg);
          timer[_index] = e.data.msg;
          console.log("timer", timer);
      }
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

var stopParam = [];
export const startIndividualTimer = (_index,_duration, _steps) => {
  if(!stopParam[_index]){
    stopParam[_index] = true;
    timerWorker[_index].postMessage({type : "start", id: _index, duration: _duration, steps: _steps, timer: timer[_index]});
  }
}

export const pauseIndividualTimer = (_index) => {
  stopParam[_index] = false;
  timerWorker[_index].postMessage({type : "pause", id: _index,timer: timer[_index]});
  return {
    type: 'PAUSE_TIMER', payload: _index
  }
}

export const stopIndividualTimer = (_index) => {
  stopParam[_index] = false;
  timerWorker[_index].postMessage({type : "stop", id: _index, timer: timer[_index]});
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
