
export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS';
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR';
import axios from 'axios';
import _ from 'lodash';
import Firebase from 'firebase';
import store from '../store';
import { handleEnterHome } from '../routes'

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
      values: 'Object',
      patterns: 'Object',
      sceneIndex: 'Integer',
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


export function changeUsername(username) {
  // console.log("BEFORE");
  // console.log(models);
  // _.forEach(models, function(modelValue) {
  //   modelValue.dataSource = modelValue.dataSource.child(username);
  // })
  // console.log("AFTER");
  // console.log(models);
}

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
    console.log('FBACCOUNT', data);
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
      console.log("FBAUTH", user);
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
      else {
        console.log('USER IS NULL');
      }
    })

  }
}

export function fbfetch(model) {
  return dispatch => {
    console.log('FBFETCH');
    models[model].dataSource.ref.on('value', data => {
      if (Firebase.auth().currentUser !== null)
      {
        const { uid } = Firebase.auth().currentUser;
        console.log("FBFETCH inside data", data.val());
        console.log("FBFETCH inside currentUser", uid);

        const u = _.find(data.val(), (d) => d.uid === uid);

        if (u !== null && u !== undefined) {
          console.log("FBFETCH u !== null", u);

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
          console.log('UIDs : ', u_id, c.val().uid);
          if(c.val().uid === u_id)
            temp.push(c.val());
        })
      }
      // else {
      //   data.forEach(function(c){
      //     temp.push(c.val());
      //   })
      // }
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
    var datakey, sceneIndex, values, patterns, uid;
    models[model].dataSource.ref.once('value', dat => {
      var u_id = Firebase.auth().currentUser.uid;
      if ( u_id !== null)
      {
        console.log('dat.val()', dat.val());
        console.log('UIDs: ', u_id, uid, dat.val().uid, data.uid);
        const obj = _.find(dat.val(), (d) => (d.matName === data.matName));
        console.log('obj: ', obj);
        if(obj !== undefined && obj !== null && u_id === obj.uid){
          console.log('fbcreateMatrix -- OBJ: ', obj);
          datakey = obj.key;
          sceneIndex = obj.sceneIndex;
          if (obj.patterns !== undefined)
          patterns = obj.patterns;
          uid = obj.uid;
        }
      }
    });

    if(patterns === undefined)
      patterns = [];

    if (datakey) {
      data.sceneIndex = sceneIndex;
      data.patterns = patterns;
      console.log('fbcreateMatrix -- update item', data);
      return models[model].dataSource.child(datakey).update({...data})
    } else {
      if (data.patterns === undefined)
        data.patterns  = [];
      console.log('fbcreateMatrix -- new addItem', data);

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
  // console.log(data);
  models[model].dataSource.child(s_key).child("patterns").child(data['key']).update({...data})
}
export function fbdelete(model, data) {
  models[model].dataSource.child(data['key']).remove();
}
export function fbdeletepatterninscene(model, data, s_key) {
  models[model].dataSource.child(s_key).child("patterns").child(data['key']).remove();
}
export function fborder(model, data, key) {
  models[model].dataSource.child(key).update({...data})
  models[model].dataSource.orderByChild('sceneIndex');
}

export function GitHubLogin() {
  return (dispatch) => {
    const provider = new Firebase.auth.GithubAuthProvider();
    provider.addScope('repo');

    Firebase.auth().signInWithRedirect(provider);

    Firebase.auth().getRedirectResult().then(result => {
      console.log("RESULT: ", result);
      if (result.credential) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
        // ...
        console.log("token");
        console.log(token);
      }
      // The signed-in user info.
      console.log("User:");
      var user = result.user;
      console.log(user);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log('ERROR: ', errorCode, errorMessage);
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
      console.log(email);

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
      console.log("param array: ", param);
      return param;
    }

    const cellName = getParameters(v)[0];
    const cmd = _.find(patterns, c => c.name === cellName);
    if(_.indexOf(channels,k) === _.indexOf(channels,'cps')){
      var newCommand = cellName;
      return [k + " " + newCommand, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
    }

    else if(cmd !== undefined && cmd !== null && cmd !== "" && v !== ""){
      var cellItem = _.slice(getParameters(v), 1);
      console.log("cellitem arr", cellItem);
      var newCommand = cmd.pattern;
      var parameters = _.concat( _.split(cmd.params, ','),'t');

      //Param parser
      _.forEach(parameters, function(value, i) {
        console.log("parameters", parameters);
        if(value === 't'){
          console.log("global timer BEFORE", newCommand);
          newCommand = _.replace(newCommand, new RegExp("`t`", "g"), timer.current);
          console.log("global timer AFTER", newCommand);}
        else if(_.indexOf(cellItem[i], '[') != -1 ) // is random parameter??
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
          console.log("random parameter", newCommand);
        }
        else {
          console.log("normal parameter BEFORE", newCommand);
          newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), cellItem[i]);
          console.log("normal parameter AFTER", newCommand);
        }
      });
      //Math Parser
      var re = /(&)(.+)(&)/g;
      console.log('words', _.words(newCommand, re));
      _.forEach(_.words(newCommand, re), function(val, i){
        console.log("MATCH "+ i, val);
        newCommand = _.replace(newCommand, val, _.trim(math.eval(_.trim(val,"&")),"[]"));
        console.log("math eval", newCommand);
      })

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

        if(transition[_.indexOf(channels,_k)] !== undefined && transition[_.indexOf(channels,_k)] !== ""){
          transitionHolder = " " + transition[_.indexOf(channels,_k)]+ " $ ";
          soloHolder = "t"+(k);
        }

        if(solo[_.indexOf(channels,_k)] === true){
          k = "d"+(k);
          soloHolder = "solo $ " + k ;
          transitionHolder = " $ ";
        }
      }
      if(globalTransformations === undefined || globalTransformations === '')
    {
      globalTransformations = '';
    }
    else {
      globalTransformations = globalTransformations + " $ "
    }
      console.log("Reconstructed Pattern: ", soloHolder + transitionHolder + newCommand);

      //create a channel array to keep track of running patterns - reducers
      //create a variable/concept that instantly appends the transformer and recompiles the patterns
      //check for conflicts with timers
      //create interface mechanism
      var pattern;
      if(_.indexOf(channels,_k) === _.indexOf(channels,'JV')){
        pattern =  "m1 $ " + newCommand;
      }
      else
        pattern = soloHolder +  transitionHolder + globalTransformations + newCommand + globalCommands;

      storedPatterns[_k-1] = '';
      storedPatterns[_k-1] = pattern;

      return [pattern , "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
    }
    else
      return false;
    }))
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/patterns', { 'patterns': x })
    .then((response) => {
      //dispatch({ type: 'SET_CC', payload: {channel, command} })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const continousPattern = (server, pattern) => {
  return dispatch => {
    console.log(pattern);
    const x = pattern;
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [x,"sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+6+"\"]"] })
    .then((response) => {
    }).catch(function (error) {
      console.log(error);
    });
  }
}

////////////////// PARSER ENDS HERE //////////////////

//To store last compiled patterns
//export const storePattern = (pattern,chn) => ({type: 'STORE_PATTERN', payload: pattern, channel: chn})



// export const sendSCMatrix = (server,vals,patterns =[]) => {
//
//   return dispatch => {
//       const fsc =  _.compact(_.map(vals,(v,k) => {
//       const sccm = vals['~qcap'];
//
//       const cmd = _.find(patterns, c => c.name === sccm);
//       if(cmd !== undefined){
//         var append = ');';
//         var prepend = '~qcap'
//         const msg =  prepend+ '.' + "set(\\obs," + cmd.pattern + append;
//         console.log(msg);
//         return msg;
//       }
//        else return false;
//     }))
//     console.log(fsc);
//     axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/scpattern', { 'pattern': fsc })
//
//     .then((response) => {
//         dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
//     }).catch(function (error) {
//       console.log(error);
//     });
//   }
// }
//

export const updateMatrix = (patterns, values, i) => {
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

export const sendScPattern = (server, expression) => {
  return dispatch => {
    if (!expression) return;

    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/scpattern', { 'pattern': expression })
    .then((response) => {
      dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const consoleSubmit = (server, expression) => {
  return dispatch => {
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [expression] })
    .then((response) => {
      //dispatch({ type: 'SET_CC', payload: {channel, pattern} })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const resetPattern = () => ({type: 'RESET_CC'});
export const fetchPattern = () => ({type: 'FETCH_CC'});



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
