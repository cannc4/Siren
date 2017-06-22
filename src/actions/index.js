
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
export function fbupdateglobalsinscene(model, data, s_key) {
	//--
	models[model].dataSource.child(s_key).child("storedGlobals").push(data)
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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

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
			// solo or not (obsolete)
			var soloHolder = k;
			var transitionHolder = "" ;
			var _k = k;
			if(_.indexOf(channels,_k) === _.indexOf(channels, 'cps')){
				transitionHolder = _k;
				soloHolder = " ";
			}
			else {
				if (transition[_.indexOf(channels,_k)] === "" || transition[_.indexOf(channels,_k)] === undefined ){
					soloHolder = k ;
					transitionHolder = " $ ";
				}

				else if(transition[_.indexOf(channels,_k)] !== undefined && transition[_.indexOf(channels,_k)] !== ""){
					transitionHolder = " " + transition[_.indexOf(channels,_k)]+ " $ ";
					soloHolder = "t"+ (_.indexOf(channels,_k)+1);
				}

				else if(solo[_.indexOf(channels,_k)] === true){
					soloHolder = "solo $ " + _k ;
					transitionHolder = " $ ";
				}
			}

			if (_k === 'm1' || _k === 'm2' ||  _k === 'm3' ||  _k === 'm4' || _k === 'v1' || _k === 'u1'){

				var storechan = _k + " $ ";
				pattern = storechan+ newCommand;
				storedPatterns[_.indexOf(channels,_k)] = '';
				storedPatterns[_.indexOf(channels,_k)] = pattern;
				console.log(pattern);
				return [pattern,"sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"]

			}
			else {
				var storechan = "d"+ (_.indexOf(channels,_k)+1) + " $ ";
				var storepat= storechan+ newCommand;
				//var orbit = " #orbit " + _.indexOf(channels,_k);
				storepat = storepat;
				storedPatterns[_.indexOf(channels,_k)] = '';
				storedPatterns[_.indexOf(channels,_k)] = storepat;
				var pattern = soloHolder + transitionHolder +globalTransformations+ newCommand + " " + globalCommands;
				if (_.indexOf(channels,_k) === _.indexOf(channels, 'd1')){
					newCommand = globalTransformations+ newCommand + " " + globalCommands
					newCommand = newCommand.replaceAll(' s ', ' image ');
					newCommand = newCommand.replaceAll('n ', 'npy ');
					newCommand = newCommand.replaceAll('speed', 'pspeed');
					newCommand = newCommand.replaceAll('nudge', 'threshold');
					newCommand = newCommand.replaceAll('room', 'blur');
					newCommand = newCommand.replaceAll('end', 'median');
					newCommand = newCommand.replaceAll('coarse', 'edge');
					newCommand = newCommand.replaceAll('up', 'hough');
					newCommand = newCommand.replaceAll('gain', 'means');
					return [pattern, "v1 $ "+ newCommand] ;
				}
				else if (_.indexOf(channels,_k) === _.indexOf(channels, 'v1')){
					pattern =  "v1 $ " + newCommand;
					newCommand = newCommand.replaceAll('image', 's');
					newCommand = newCommand.replaceAll('npy', 'n');
					newCommand = newCommand.replaceAll('pspeed', 'speed');
					newCommand = newCommand.replaceAll('threshold', 'nudge');
					newCommand = newCommand.replaceAll('blur', 'room');
					newCommand = newCommand.replaceAll('median', 'end');
					newCommand = newCommand.replaceAll('edge', 'coarse');
					newCommand = newCommand.replaceAll('hough', 'up');

					console.log(pattern, "d1 $ "+ newCommand);
					return [pattern, "d1 $ "+ newCommand] ;
				}
				else {
					return [pattern, "sendOSC d_OSC $ Message \"tree\" [string \"command\", string \""+cellItem+"\"]"] ;
				}
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
export const sendGlobals = (server,storedPatterns,storedGlobals, vals,channels) => {
	return dispatch => {
		const getParameters = (v) => {
				var param = [];
				_.map(_.split(v, /[`]+/g), (p1, p2) => {
					p1 = _.trim(p1);

					if(p1 !== "") param.push(p1);
				});
				return param;
			}

		const globalindex = getParameters(vals)[0];
		if(globalindex !== undefined){
		var pat = [],ch;
		// command of the pattern
		var currentglobal = Object.values(storedGlobals[globalindex]);
			var activeChannels = _.slice(getParameters(vals), 1);
			// Construct the active channel list from channel list
			var tch = [];
			activeChannels = _.split(activeChannels, ' ');
			var b = new RegExp("^[A-Za-z0-9]+", "g");
			_.forEach(activeChannels, function(chan, i) {
				tch.push (chan);
				var stp=storedPatterns[chan-1];
				if(stp !== undefined){
					ch = stp.match(b)[0];
					ch = ch + ' $ ';
					stp = stp.substring(stp.indexOf('$')+1);
					console.log(stp);
					var pp =  ch  + currentglobal[1]  + stp + currentglobal[0];
					console.log(pp);
					pat.push(pp);
				}
			});
					// for (var j = 0; j < storedPatterns.length; j++) {
					// 			pat.push(storedPatterns[j]);
					// }
			}
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': pat })
		.then((response) => {
		}).catch(function (error) {
			console.error(error);
		});

		}

}

export const consoleSubmitHistory = (server, expression, storedPatterns,channels) => {
	return dispatch => {
		var b = new RegExp("^[A-Za-z0-9]+", "g");
		var ch = expression.match(b)[0];
		console.log(ch);
		if (ch === 'm1' || ch === 'm2' ||  ch === 'm3' ||  ch === 'm4' || ch === 'v1' || ch === 'u1'){
			storedPatterns[_.indexOf(channels,ch)] = '';
			storedPatterns[_.indexOf(channels,ch)] = expression;
		}
		else if ( expression === 'jou'){
			for (var i = 0; i < storedPatterns.length; i++) {
				storedPatterns[i] = channels[i] + ' $ silence' ;
			}

		}
		else{
			storedPatterns[_.indexOf(channels,ch)] = '';
			storedPatterns[_.indexOf(channels,ch)] = expression;
		}
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
					timer[_index] = e.data.msg;
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
