import {
    observable,
    action,
    computed
} from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

// nodejs connections
import request from '../utils/request'
// import { rmdirSync } from 'fs';

import sceneStore from './sceneStore'
import channelStore from './channelStore'
import patternStore from './patternStore'


class MenubarStore {
    // 0 = inactive
    // 1 = ready
    // 2 = running
    @observable server_info = 0;
    @observable history_folders = [];
    @observable recording = false;
    @observable playing = false;

    @observable rmsArray = [];
    @observable fileIndex = 0;
    @observable recordings = [];

    sc_log_socket = io('http://localhost:4002/');
    constructor() {
        this.sc_log_socket.on('connect', (reason) => {
            this.server_info = 2;
        });
        this.sc_log_socket.on('disconnect', action((reason) => {
            this.server_info = 0;
        }));
        this.getRecordingNames();
        // this.sc_log_socket.on("/rms", action((data) => {
        //     const i = _.toNumber(data.orbit.charAt(data.orbit.length - 1));

        //     if (i < this.rmsArray.length)
        //         this.rmsArray[i] = {
        //             rms: data.rms,
        //             peak: data.peak
        //         };
        //     else
        //         this.rmsArray.push({
        //             rms: data.rms,
        //             peak: data.peak
        //         });

        //     this.createRMSShape_Left();
        //     this.createRMSShape_Right();
        // }))
    }

    @computed get getActive() {
        return this.server_info;
    }

    @computed get isRecording() {
        return this.recording;
    }

    @action updateFileIndex(findex){
        this.fileIndex = findex;
    }

    @action toggleRecording() {
        this.recording = !this.recording;
        let elem = document.getElementById('homepage');
        if ((elem !== undefined || elem !== null) && this.recording) {
            elem.className += " recording";
        } else if ((elem !== undefined || elem !== null) && !this.recording) {
            elem.className = _.replace(elem.className, " recording", "");
        }
        this.record(this.recording);
    }
    @computed get isPlaying() {
        return this.playing;
    }

    @action togglePlay(index) {
        this.playing = !this.playing;
        this.toggleStop();
        this.play(index);
    }

    @action toggleStop() {
        this.stop();
    }

    @action updateHistoryFolders(hf) {
        this.history_folders = hf;
        console.log(this.history_folders);
    }
    @action generateScene(recordedObjects) { 
        // ADD SCENE
        const newSceneName = "GEN";
        let newNameIndex = 0;
        while (_.indexOf(sceneStore.scene_list, newSceneName + newNameIndex) > 0) newNameIndex++; 
        sceneStore.addScene(newSceneName + newNameIndex);
        
        // CHANGE SCENE
        sceneStore.changeActiveScene(newSceneName + newNameIndex);
        // add silence channel
        patternStore.addPattern("S", sceneStore.active_scene, "silence");


        if (recordedObjects.length > 0) { 
            const startTime = recordedObjects[0].timestamp;
            const endTime = recordedObjects[recordedObjects.length - 1].timestamp;

            let newPatternName = "PAT";
            let newPatternIndex = 0;

            // PARSE RECORDED PATTERS
            recordedObjects.forEach(element => {
                
                // TODO: ALLOW SC CHANNELS
                if (element.type === "Tidal") { 
                    let channelName = '';
                    let stepNumber = 0;
                    
                    // TIME (millis)
                    let time = element.timestamp - startTime;

                    // PATTERN
                    let pat = _.replace(element.pattern, '\n', '');

                    // DETERMINE CHANNEL
                    let re = new RegExp("^.+?\\$", "g");
                    let match = re.exec(pat);
                    if (match !== null && match[0] !== undefined) { 
                        channelName = _.trim(match[0].substring(0, match[0].length - 1));
                        pat = pat.substring(match[0].length, pat.length);
                        channelStore.addChannel(channelName, "Tidal", _.ceil(endTime/1000-startTime/1000), "", 2, false);
    
                        // DETERMINE STEP
                        stepNumber = _.toInteger(time / 1000.);

                        // IF SILENCED OR HUSHED
                        if (pat.includes("silence")) {
                            _.find(channelStore.channels, { 'name': channelName, 'scene': sceneStore.active_scene }).cells[stepNumber] = "S";
                        }
                        else { 
                            // DETERMINE MAIN PATTERN AND PARAMETERS
                            let mainPattern = "";
                            let param1 = "";
                            let param2 = "";
                            re = new RegExp('\\$[ ]*(n|s)[o\\W][^m].*?(#|\\n)', "g");
                            match = re.exec(pat);
                            if (match !== null && match[0] !== undefined) {
                                mainPattern = "`x` " + _.trim(match[0].substring(1, match[0].length - 1)) + " `y`";
                                param1 = pat.substring(0, match.index + 1);
                                param2 = pat.substring(match.index + match[0].length - 1, pat.length);
                                
                                // see if exists
                                // add if not by parameterizing before and after
                                let patternItem = _.find(patternStore.patterns, { 'text': mainPattern, 'scene': sceneStore.active_scene });
                                if (patternItem === undefined) { 
                                    patternStore.addPattern(newPatternName + newPatternIndex, sceneStore.active_scene, mainPattern, 'x,y');
                                    newPatternIndex += 1;
                                }
                                patternItem = _.find(patternStore.patterns, { 'text': mainPattern, 'scene': sceneStore.active_scene });
    
                                // PLACE IT IN THE GRID
                                let cellValue = patternItem.name + " `" + param1 + "` `" + param2 + "`";
                                _.find(channelStore.channels, { 'name': channelName, 'scene': sceneStore.active_scene }).cells[stepNumber] = cellValue;
                            }
                        }
                    }
                }
            });
        }
    }


    createRMSShape_Left() {
        let c = document.getElementById("RMSVis_Left");
        let ctx = c.getContext("2d");

        const length = _.toInteger(this.rmsArray.length * 0.5);
        const w = c.width,
            h = c.height;
        const m = 5;

        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < length; i++) {
            const _w = w / length;
            const _h = _.toNumber(this.rmsArray[i].rms.toFixed(10)) * 10.;

            ctx.fillStyle = "rgba(180, 180, 180, " + (_h + 0.2) / (0.75 * h) + ")";

            ctx.fillRect(i * _w + m, h * 0.5, _w - m, _h);
            ctx.fillRect(i * _w + m, h * 0.5, _w - m, -_h);
        }
    }
    createRMSShape_Right() {
        let c = document.getElementById("RMSVis_Right");
        let ctx = c.getContext("2d");

        const l_left = _.toInteger(this.rmsArray.length * 0.5);
        const l_right = this.rmsArray.length - l_left;
        const w = c.width,
            h = c.height;
        const m = 5;

        ctx.clearRect(0, 0, w, h);
        for (let i = l_left; i < this.rmsArray.length; i++) {
            const _w = w / l_right;
            const _h = _.toNumber(this.rmsArray[i].rms.toFixed(10)) * 10.;

            ctx.fillStyle = "rgba(180, 180, 180, " + (_h + 0.2) / (0.75 * h) + ")";

            ctx.fillRect((i - l_left) * _w + m, h * 0.5, _w - m, _h);
            ctx.fillRect((i - l_left) * _w + m, h * 0.5, _w - m, -_h);
        }
    }

    @action stopServer() {
        this.server_info = 1;
        request.get('http://localhost:3001/quit')
            .then(action((response) => {
                if (response.status === 200) {
                    this.server_info = 0;
                    console.log(" ## Server stopped.");
                } else {
                    this.server_info = 0;
                    console.log(" ## Server quit failed.");
                }
            })).catch(action((error) => {
                this.server_info = 0;
                console.error(" ## Server errors: ", error);
            }));
    }

    @action bootServer(config) {
        this.server_info = 1;
        request.post('http://localhost:3001/init', {
                'b_config': config
            })
            .then(action((response) => {
                if (response.status === 200) {
                    this.server_info = 2;
                    console.log(" ## Server booted.");
                } else {
                    this.server_info = 0;
                    console.log(" ## Server boot failed.");
                }
            })).catch(action((error) => {
                this.server_info = 0;
                console.error(" ## Server errors: ", error);
            }));
    }

    @action record() {
        request.post('http://localhost:3001/record', {
            'isRecord': this.recording
        })
        .then(action((response) => {
            if (response.status === 200 && response.data !== undefined) {
                //this.recordings = response.data.history_folders;
            }
        })).catch(action((error) => {
            //this.recording = false;
            console.error(" ## Server errors: ", error);
        }));
    }

    @action play(index) {
        request.post('http://localhost:3001/playhistory', {
                'isPlay': this.playing,
                'index': index
            })
            .then(action((response) => {
                // if (response.status === 200) {
                //     console.log(" ## Recording.");
                // }
                // else {
                //     this.recording = false;
                //     console.log(" ## Record failed.");
                // }    
                //console.log(response);                    
            })).catch(action((error) => {
                this.playing = false;
                console.error(" ## Server errors: ", error);
            }));
    }
    @action stop() {
        request.get('http://localhost:3001/stophistory', {
            })
            .then(action((response) => {
                // if (response.status === 200) {
                //     console.log(" ## Recording.");
                // }
                // else {
                //     this.recording = false;
                //     console.log(" ## Record failed.");
                // }                        
            })).catch(action((error) => {
                this.playing = false;
                console.error(" ## Server errors: ", error);
            }));
    }

    @computed get recs(){
        return this.recordings;
    }
    @action getRecordingNames() { 
        request.get('http://localhost:3001/recordings')
        .then(action((response) => {
            this.recordings  = response.data.recordings;
        })).catch(action((error) => {
            this.recordings  = [];
        }));
    }

    @action generateNewScene(i) { 
        request.post('http://localhost:3001/generateScene', {
            'fileIndex': i
        })
        .then(action((response) => {
            this.generateScene(response.data.recordedObjects);
        })).catch(action((error) => {
            this.playing = false;
            console.error(" ## Server errors: ", error);
        }));
    }
}

export default new MenubarStore();