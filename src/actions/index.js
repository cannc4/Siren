
export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS';
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR';
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
      email: 'String',
      name: 'String',
      uid: 'String',
			layouts: 'Object'
    }
  },
  Matrices: {
    dataSource: Firebase.database().ref("/matrices"),
    model: {
      name: 'String',
      patterns: 'Object',
			channels: 'Object',
      sceneIndex: 'Integer',
      storedGlobals: 'Object',
      uid: 'String'
    }
  }
}
// eslint-disable-next-line
String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
}
// eslint-disable-next-line
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

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
						key: user.uid,
						layouts: user.layouts
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
export function fbfetchlayout(model) {
	return dispatch => {
		models[model].dataSource.ref.on('value', data => {
			if (Firebase.auth().currentUser !== null)
			{
				const { uid } = Firebase.auth().currentUser;
				const u = _.find(data.val(), (d) => d.uid === uid);

				if (u !== null && u !== undefined) {
					// console.log('fbfetchlayout: ', Object.values(u.layouts.default_layout));
					dispatch({
						type: 'UPDATE_LAYOUT',
						payload: _.filter(Object.values(u.layouts.default_layout), ['isVisible', true])
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
export function fbcreatechannelinscene(model, data, s_key){
	if (data['key']) {
		return models[model].dataSource.child(data['key']).update({...data})
	} else {
		const newObj = models[model].dataSource.child(s_key).child("channels").push(data);

		newObj.update({ key: newObj.key })
		return newObj.key

	}
}

// data = { matName, patterns, channels, sceneIndex: snd, uid, storedGlobals }
export function fbcreateMatrix(model, data) {
	if (Firebase.auth().currentUser !== null)
	{
		var datakey, sceneIndex, patterns, channels, storedGlobals;
		models[model].dataSource.ref.once('value', dat => {
			var u_id = Firebase.auth().currentUser.uid;
			if ( u_id !== null)
			{
				const obj = _.find(dat.val(), (d) => (d.matName === data.matName));
				if(obj !== undefined && obj !== null && u_id === obj.uid){
					datakey = obj.key;
					sceneIndex = obj.sceneIndex;
					if (obj.channels !== undefined) channels = obj.channels;
					if (obj.globals !== undefined) storedGlobals = obj.globals;
					if (obj.patterns !== undefined) patterns = obj.patterns;
					u_id = obj.uid;
				}
			}
		});

		if(patterns === undefined)
			patterns = [];

		if(channels === undefined)
			channels = [];

		if(storedGlobals === undefined)
			storedGlobals = [];

		if (datakey) {
			data.sceneIndex = sceneIndex;
			data.patterns = patterns;
			data.channels = channels;
			data.globals = storedGlobals;
			return models[model].dataSource.child(datakey).update({...data})

		}
		else {
			if (data.patterns === undefined)
				data.patterns  = [];

			channels = data.channels
			data.channels = []

			if (data.globals === undefined)
				data.storedGlobals = [];

			const newObj = models[model].dataSource.push(data);
			newObj.update({ key: newObj.key })

			_.each(channels, function(x) {
				x.scene = data.matName
				const newChn = models[model].dataSource.child(newObj.key).child('channels').push(x);
				newChn.update({ key : newChn.key })
			})

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
	models[model].dataSource.child(s_key).child("storedGlobals").update({...data})
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

	if(data.channels === undefined)
		data.channels = {};

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
				// var token = result.credential.accessToken;
			}
			// The signed-in user info
			// var user = result.user;
		}).catch(function(error) {
			// var errorCode = error.code;
			// var errorMessage = error.message;
			// var email = error.email;
			// var credential = error.credential;
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

// boot and start tidal
export const initTidalConsole = (server, expression) => {
	return dispatch => {
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/tidal', {'b_config' :expression})
		.then((response) => {
			dispatch({type: 'FETCH_TIDAL', payload: response })
			dispatch({type: 'CONFIG_TIDAL', payload: response })
		}).catch(function (error) {
			console.error(error);
		});
	}
}

export const exitSC = (server) => {
	return dispatch => {
		axios.get('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/tidal')
		.then((response) => {
			dispatch({type: 'FETCH_TIDAL', payload: response })
		}).catch(function (error) {
			console.error(error);
		});
	}
}

export const dCon = ( expression) => {
	return dispatch => {
			dispatch({type: 'DEBUG_TIDAL', payload: expression })
		};
}
//SC BINDING
// export const dConSC = ( expression) => {
// 	return dispatch => {
// 			dispatch({type: 'DEBUG_SCCOMMAND', payload: expression })
// 		};
// }

export const TidalTick = (server) => {
  return dispatch => {
    axios.get('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/tidaltick')
    .then((response) => {
      dispatch({type: 'FETCH_TIDAL', payload: response.data })
    }).catch(function (error) {
      console.log(error);
    });
  }
}

export const setExecution = () => {
	return dispatch => {
		dispatch({ type: 'EXECUTION_CLICK' })
	};
}

export const continousPattern = (server, pattern) => {
	return dispatch => {
		const x = pattern;
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [x] })
		.then((response) => {
		}).catch(function (error) {
			console.error(error);
		});
	}
}

export const seekTimer = (step) => {
	return dispatch => {
		dispatch({ type: 'SEEK_CLICK', payload: step});
	};
}
export const updateMatrix = (item) => {
	//reducer
	return dispatch => {
		dispatch({ type: 'UPDATE_CHANNEL', payload: item});
	};
}
export const selectCell = (selectedcell) => {
    //reducer
    return dispatch => {
        dispatch({ type: 'SELECT_CELL', payload: selectedcell });
    };
}
export const updateCell = (cell) => {
    //reducer
    return dispatch => {
        dispatch({ type: 'REFINE_CELL', payload: cell });
    };
}
export const bootCells = (cell) => {
    //reducer
    return dispatch => {
        dispatch({ type: 'BOOT_CELL', payload: cell });
    };
}
export const createCell = (cell) => {
    //reducer
    return dispatch => {
        dispatch({ type: 'CREATE_CELL', payload: cell });
    };
}
export const sendScPattern = (server, expression) => {
	return dispatch => {
		console.log(expression);
		if (!expression) return;
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/scpattern', { 'pattern': expression })
		.then((response) => {
			console.log("sendScPattern response", response);
			dispatch({ type: 'FETCH_SCCOMMAND', payload: response.data })
		}).catch(function (error) {
		});
	}
}

export const consoleSubmit = (server, expression) => {
	return dispatch => {
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [expression] })
		.then((response) => {
			dispatch({ type: 'DEBUG_TIDAL', payload: response.data })
		}).catch(function (error) {
			console.error(error);
		});
	}
}

export const sendPatterns = (server, channel, stepValue, scenePatterns, click, globalparams) => {
	return dispatch => {
		const getFinalPattern = () => {
			console.log('INDEXJS ', channel, stepValue);

			var math = require('mathjs');

			// channel, pattern
			var k = channel.name, v = stepValue;

			const getParameters = (v) => {
				var param = [];
				_.map(_.split(v, /[`]+/g), (p1, p2) => {
					p1 = _.trim(p1);

					if(p1 !== "") param.push(p1);
				});
				return param;
			}
			const processParameters = (parameters, newCommand, cellItem) => {
				// For each parameter in parameter list
				_.forEach(parameters, function(value, i) {
					// Temporal parameter
					if(value === 't'){
						newCommand = _.replace(newCommand, new RegExp("`t`", "g"), click.current);
					}
					// Random parameter
					else if(_.indexOf(cellItem[i], '|') === 0 && _.lastIndexOf(cellItem[i], '|') === cellItem[i].length-1)
					{
						cellItem[i] = cellItem[i].substring(1, _.indexOf(cellItem[i], '|', 1));
						var bounds = _.split(cellItem[i], ',');
						if(bounds[0] !== undefined && bounds[0] !== "" &&
							 bounds[1] !== undefined && bounds[1] !== ""){
								 bounds[0] = parseFloat(bounds[0]);
								 bounds[1] = parseFloat(bounds[1]);
								 newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), _.random(_.min(bounds), _.max(bounds)));
						}
					}
					// Value parameter
					else {
						newCommand = _.replace(newCommand, new RegExp("`"+value+"`", "g"), cellItem[i]);
					}
				});
				return newCommand
			}

			// pattern name
			const cellName = getParameters(v)[0];

			// command of the pattern
			const cmd = _.find(scenePatterns, c => c.name === cellName);
			var newCommand;

			// CPS channel handling
			if( k === 'cps'){
				newCommand = cellName;
				return [ k + " " + newCommand ];
			}

			// other channels
			else if(cmd !== undefined && cmd !== null && cmd !== "" && v !== ""){
				var cellItem = _.slice(getParameters(v), 1);
				newCommand = cmd.pattern;

				// Applies parameters
				newCommand = processParameters(_.concat( _.split(cmd.params, ','),'t'), newCommand, cellItem);

				// Math Parser
				// eslint-disable-next-line
				_.forEach(_.words(newCommand, /\&(.*?)\&/g), function(val, i){
					newCommand = _.replace(newCommand, val, _.trim(math.eval(_.trim(val,"&")),"[]"));
				})

				// Prepare transition and solo
				var	transitionHolder;
				if (channel.transition === "" || channel.transition === undefined )
					transitionHolder = k + " $ ";
				else
					transitionHolder = "t"+ (channel.cid +1) + " " + channel.transition + " $ ";

				var pattern;

				if (k === 'm1' || k === 'm2' ||  k === 'm3' ||  k === 'm4' || k === 'v1' || k === 'u1'){
					pattern = k + " $ " + newCommand;
				}
				else if( channel.type === "SuperCollider"){

					dispatch({ type: 'UPDATE_SCCOMMAND', payload: newCommand });
					//this.sendScPattern('localhost:3001', newCommand);
					//console.log(newCommand);
				}
				else {
					pattern = transitionHolder + newCommand;
				}

				// Apply global parameters
				globalparams.storedPatterns[channel.cid] = pattern;
				if (globalparams.globalChannels.includes(channel.cid.toString()) || globalparams.globalChannels.includes(0)){
					if(globalparams.globalCommands[0] === '#' || globalparams.globalCommands[1] === '+'||globalparams.globalCommands[1]=== '*'){
						pattern = transitionHolder + globalparams.globalTransformations + newCommand + globalparams.globalCommands;
					}
					else {
						pattern = transitionHolder + globalparams.globalCommands + newCommand + globalparams.globalTransformations;
					}
				}
				else {
					pattern = transitionHolder + newCommand ;
				}

				console.log('actually sending it: ', pattern);
				return [ pattern ];
			}
			else
				return false;
			}
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': _.compact(getFinalPattern()) })
		.then((response) => {
			dispatch({ type: 'DEBUG_TIDAL', payload: response.data })
		}).catch(function (error) {
			console.error(error);
		});
	}
}

// export const scStatus = (server) => {
// 	return dispatch => {
// 		axios.get('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/status', { })
// 		.then((response) => {
// 			console.log('SCStatus: ', response);
// 		}).catch(function (error) {
// 			console.error(error);
// 		});
// 	}
// }

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
					ch += ' $ ';
					stp = stp.substring(stp.indexOf('$')+1);
					pat.push(ch  + currentglobal[1]  + stp + currentglobal[0]);
				}
			});
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
		var chan = expression.match(b)[0];
		if ( expression === 'jou'){
			_.each(channels, function (ch, i) {
				if(ch.type === 'Tidal' || ch.type === 'SCSynth' || ch.type === 'Audio'){
				storedPatterns[ch.cid] = ch.name + ' $ silence';
				}
			})
		}
		else if ( expression === 'mjou'){
			_.each(channels, function (ch, i) {
				if(ch.type === 'Tidal-MIDI' || ch.type === 'MIDI'){
					storedPatterns[ch.cid] = ch.name + ' $ silence';
				}
			})
		}
		else{
			_.each(channels, function (ch, i) {
				if(chan === ch.name){
					storedPatterns[ch.cid] = expression;
				}
			})
		}
		axios.post('http://' + server.replace('http:', '').replace('/', '').replace('https:', '') + '/pattern', { 'pattern': [expression] })
		.then((response) => {
		}).catch(function (error) {
			console.error(error);
		});
	}
}

export const globalUpdate = (t, c, d) => {
	return {
		type: 'UPDATE_GLOBAL', transform: t, command: c, channel:d
	}
}
export const globalStore = (storedG,storedPatterns) => {
	return {
		type: 'STORE_GLOBAL', storedGlobals: storedG, storedPatterns: storedPatterns
	}
}

export const resetPattern = () => ({type: 'RESET_CC'});
export const fetchPattern = () => ({type: 'FETCH_CC'});

export const createChannel = (newc) => {
	return  {
		type: 'CREATE_CHANNEL',  payload: newc }
}
export const updateChannel = (item) => {
	return  { type: 'UPDATE_CHANNEL', payload: item }
}
export const stepChannel = (channel) => {
	return  { type: 'RESTEP_CELL', payload: channel}
}
export const deleteChannel = (key) => {
	return  { type: 'DELETE_CHANNEL', payload: key }
}

export function forceUpdateLayout(windows, current_layout_length) {
	// react-grid-layout only rerenders when number of layouts have changed.
	// Add or remove a dummy layout to change the number of layouts, and force
	// it to rerender itself
	if(windows.length === current_layout_length){
		if(_.find(windows, function(o) { return o.i === 'dummy'; })){
			windows = _.reject(windows, ['i', 'dummy']);
		}
		else {
			windows = _.concat(windows, {i: 'dummy', x: 11, y: 100, w: 5, h: 4, minW: 2, isVisible: false});
		}
	}
	return dispatch => {
		dispatch({ type: 'UPDATE_LAYOUT', payload: windows });
	}
}
export function updateLayout(windows) {
	return dispatch => {
		dispatch({ type: 'UPDATE_LAYOUT', payload: windows });
	}
}

export function chokeClick() {
	return  { type: 'TOGGLE_CLICK'};
}


export function startClick() {
	return dispatch => {
		dispatch({ type: 'INC_CLICK'});
	}
}

export function resetClick() {
	return dispatch => {
		dispatch({ type: 'RESET_CLICK'});
	}
}

export function fbupdatechannelinscene(model, data, s_key) {
	models[model].dataSource.child(s_key).child("channels").child(data['key']).update({...data})
}

export function fbdeletechannelinscene(model, s_key, c_key) {
	models[model].dataSource.child(s_key).child("channels").child(c_key).remove();
	store.dispatch(deleteChannel(c_key));
}

export function fbsavelayout(model, layout, uid, c_id) {
	if ( uid !== undefined ) {
		var temp_layouts = {};
		_.forEach(layout, function(o) {
			temp_layouts[o.i] = o;
		})
		models[model].dataSource.child(uid).child("layouts").child("customs").child(c_id).set(temp_layouts)
	}
}

export function fbdeletecustomlayout(model, uid, c_id) {
	if ( uid !== undefined ) {
		models[model].dataSource.child(uid).child("layouts").child("customs").child(c_id).remove();
	}
}


export function fbupdatelayout(model, layout, uid) {
	// console.log(layout, uid);
	if ( uid !== undefined ) {
		var temp_layouts = {};
		_.forEach(layout, function(o) {
			temp_layouts[o.i] = o;
		})
		models[model].dataSource.child(uid).child("layouts").child("default_layout").set(temp_layouts)
	}
}

export function fbsaveconfig(model, uid, config) {
	if ( uid !== undefined ) {
		models[model].dataSource.child(uid).child("config").update({...config});
	}
}
