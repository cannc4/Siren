import $ from 'jquery';
import jquery from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jquery;

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
// export const sendCommand = (server, channel, command) => {
//   return dispatch => {
//     //console.log("2004");
// axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/command', { 'command': command })
// .then((response) => {
//       dispatch({ type: 'SET_CC', payload: {channel, command} })
//       dispatch({ type: 'FETCH_TIDAL', payload: response.data })
// }).catch(function (error) {
//   console.log(error);
//     });
//   }
// }
export const sendCommands = (server,vals, channelcommands,commands =[]) => {
  return dispatch => {
  const x =  _.compact(_.map(vals,(v,k) => {
      const cmd = _.find(commands, c => c.name === v);
      if(cmd !== undefined && cmd !== null){
        return k + ' $ ' + cmd.command
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeValue(row, col, index, commands, values){
  if (values[row+1] === undefined) values[row+1] = {}
  values[row+1][col] = Object.values(commands)[index].name;
}

export const celluarFill = (values, commands, density, steps, duration, channels) => {
  console.log("second celluarFill -- begin");
  return dispatch => {
    /*console.log("-----------------");
    console.log(values);
    console.log(commands);

    console.log(density);
    console.log(steps);
    console.log(duration);

    console.log(channels);
    console.log("-----------------");*/

    var command_len = Object.keys(commands).length;
    var channel_len = channels.length;

    for (var i = 0; i < density; i++) {
      var row = getRandomInt(0, steps);
      var col;
      var randIndex = getRandomInt(0, command_len-1);

      /*console.log(randIndex);
      console.log(Object.values(commands)[randIndex].command);
      console.log(_.includes(Object.values(commands)[randIndex].command, "Message"));*/
      if(_.includes(Object.values(commands)[randIndex].command, "Message")){
        col = channels[getRandomInt(channel_len-3, channel_len)];
      }
      else {
        col = channels[getRandomInt(0, channel_len-4)];
      }

      placeValue(row, col, randIndex, commands, values);
    }
    /*row = getRandomInt(0, steps);
    col = channels[getRandomInt(0, channel_len-4)];
    if (values[row+1] === undefined) values[row+1] = {}
    values[row+1][col] = "s";*/

    dispatch({ type: 'FETCH_CELLUAR', payload: {values} });
    console.log("second celluarFill -- afterdispatch");
  }
  console.log("second celluarFill -- end");
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

export const incTimer = (v) => {
  return {
    type: 'INC_TIMER',
  }
};

var timer = null;
const x = (dispatch) => {
  dispatch(incTimer())
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
