import $ from 'jquery';
import jquery from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jquery;

var bjork = require('bjorklund');

export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR';
import axios from 'axios';
import _ from 'lodash';
import Firebase from 'firebase';
// import store from '../store';

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
      command: 'String'
    }
  }
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
      if (Firebase.auth().currentUser !== null){
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

export function fbcreate(model, data) {
  if (data['key']) {
    return models[model].dataSource.child(data['key']).update({...data})
  } else {
    const newObj = models[model].dataSource.push(data);
    return newObj.update({ key: newObj.key })
  }
}

export function fbupdate(model, data) {
  models[model].dataSource.child(data['key']).update({...data})
}

export function fbdelete(model, data) {
  models[model].dataSource.child(data['key']).remove()
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
      console.log(error);
    });
  }
}
export const sendCommands = (server,vals, channelcommands, commands =[]) => {
  return dispatch => {
  const x =  _.compact(_.map(vals,(v,k) => {
      const cmd = _.find(commands, c => c.name === v);
      if(cmd !== undefined && cmd !== null){
        var append = "";
        switch (k) {
          case "d1":
            append = " |+| nudge rand"; break;
          case "d2":
            append = " # cut \"1\""; break;
          case "d3":
            append = " # room \"1\""; break;
          case "d4":
            append = " # delay \"0.6\" # delayfeedback \"12\" # delaytime \"0.3\""; break;
          case "d5":
            append = " # cut \"5\""; break;
          case "d6":
            append = " # cutoff (scale 0 16000 $ slow 4 sinewave1)"; break;
          case "d7":
            append = ""; break;
          case "d8":
            append = " # room \"0.5\""; break;
          case "d9":
            append = ""; break;
          default:
            break;
        }

        return k + ' $ ' + cmd.command + append;
      } else return false;
    }))
  //const url = 'http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/commands';
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/commands', { 'commands': x })
    .then((response) => {
      //dispatch({ type: 'SET_CC', payload: {channel, command} })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const celluarFill = (values, commands, density, steps, duration, channels, timer) => {
  function placeValue(row, col, item, container){
    if (container[parseInt(row)+1] === undefined)
      container[parseInt(row)+1] = {};
    container[parseInt(row)+1][col] = item;
  }

  function update(){
    var resultVals = {};

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
  }

  if(timer.current % steps === 1 && timer.isCelluarActive)
  {
    update();
    return dispatch => {
    };
  }

  return dispatch => {
    dispatch({ type: 'FETCH_TIMER'});
  }
}

export const addValues = (values, commands, density, steps, duration, channels, timer) => {
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

  function addItems(){
    var command_len = Object.keys(commands).length;
    var channel_len = channels.length;

    // Euclidean Rythm
    for (var i = 0; i < channel_len; i++) {
      //var str = bjork(scale(i, 0, channel_len, 3, 7), steps);
      var str = bjork(_.random(3,7), steps);

      for (var j = 0; j < str.length; j++) {
        var row = j;
        var col = _.nth(channels, i);
        if(str[j] === '1'){
          placeValue(row, col, pickRandom(row, i), values);
        }
      }
    }

    // Add random
    /*
    var item_count = steps*channels.length*density/100;

    for (var i = 0; i < item_count; i++) {
      var row = _.random(0, steps-1);
      var col;
      var randIndex = _.random(0, command_len-1);

      if(_.includes(Object.values(commands)[randIndex].command, "Message")){
        col = channels[_.random(channel_len-6, channel_len-1)];
      }
      else {
        col = channels[_.random(0, channel_len-7)];
      }

      placeValue(row, col, Object.values(commands)[randIndex].name, values);
    }*/
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

//export const setCommand = (channel, command) => ({ type: 'SET_CC', payload: {channel, command} });
export const resetCommand = () => ({type: 'RESET_CC'});
export const fetchCommand = () => ({type: 'FETCH_CC'});

export const incTimer = () => {
  return { type: 'INC_TIMER'}
};

var timer = null;
const x = (dispatch) => {
  dispatch(incTimer());
}

export const startTimer = (duration, steps) => {
  return dispatch => {
    timer = setInterval(x, (duration / steps * 1000), dispatch);
  }
}

export const stopTimer = () => {
  clearInterval(timer);
  return {
    type: 'STOP_TIMER'
  }
}

/*
  Functions for popup display on each playbox
*/
/*$(document).ready(function () {
  $("[id^=pt_pop_]").on('change keyup paste', function(event) {
     var lastNumber = new RegExp("[0-9]*$")
     var number = $(this).attr('id').match(lastNumber)[0];

    if($(this).val() === ""){
     	$(this).removeClass('selected');
      $(".pop_"+number).attr('id','messagepop_hidden');
    }

    if($(this).val() !== "" && $(this).hasClass('selected') === false) {
      $(this).addClass('selected');
      $(".pop_"+number).attr('id','messagepop_visible');
    }

    if(event.keyCode === 27){
      console.log(event.keyCode+ "#pt_pop_"+number);
      $("[id^=pt_pop_]").removeClass('selected');
      $("[class^=messagepop_]").attr('id','messagepop_hidden');
    }

    // if databasede varsa
    /*if(function(){
          }
    {
        // alıp textboxa yaz
          $(this).val()

    }

    $(document).mouseup(function (e)
    {
        var container = $("[id^=pt_pop_]");

        if ($(".messagepop_"+number).html().trim() !== e.target.outerHTML
        && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
     				$("#pt_pop_"+number).removeClass('selected');
            $(".pop_"+number).attr('id','messagepop_hidden');

            // if databasede yoksa
            //ekle
          if($(this).val() )
            {
                // ekle
            }
        }
  	});
  });
});*/
