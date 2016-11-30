//Similar interface for a

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


export const sendCommand = (server, expression) => {
  return dispatch => {
    if (!expression) return;
    // console.log(server, expression)
    axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/command', { 'command': expression })
    .then((response) => {
      dispatch({ type: 'FETCH_TIDAL', payload: response.data })
    }).catch(function (error) {
      console.log(error);
    });
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

export const setCommand = (channel, command) => ({ type: 'SET_CC', payload: {channel, command} });
export const resetCommands = () => ({type: 'RESET_CC'});

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
