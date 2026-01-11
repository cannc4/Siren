import { makeAutoObservable, runInAction } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';
import request from '../utils/request';
import sceneStore from './sceneStore';
import channelStore from './channelStore';
import patternStore from './patternStore';

class MenubarStore {
    server_info = 0;
    history_folders = [];
    recording = false;
    playing = false;
    rmsArray = [];
    fileIndex = 0;
    recordings = [];
    sc_log_socket = io('http://localhost:4002/');

    constructor() {
        makeAutoObservable(this);
        this.sc_log_socket.on('connect', () => { this.server_info = 2; });
        this.sc_log_socket.on('disconnect', () => { this.server_info = 0; });
        this.getRecordingNames();
    }

    get getActive() { return this.server_info; }
    get isRecording() { return this.recording; }
    get isPlaying() { return this.playing; }
    get recs() { return this.recordings; }

    updateFileIndex(findex) { this.fileIndex = findex; }

    toggleRecording() {
        this.recording = !this.recording;
        let elem = document.getElementById('homepage');
        if (elem && this.recording) elem.className += " recording";
        else if (elem) elem.className = _.replace(elem.className, " recording", "");
        this.record(this.recording);
    }

    togglePlay(index) {
        this.playing = !this.playing;
        this.toggleStop();
        this.play(index);
    }

    toggleStop() { this.stop(); }

    updateHistoryFolders(hf) { this.history_folders = hf; }

    generateScene(recordedObjects) {
        const newSceneName = "GEN";
        let newNameIndex = 0;
        while (_.indexOf(sceneStore.scene_list, newSceneName + newNameIndex) > 0) newNameIndex++;
        sceneStore.addScene(newSceneName + newNameIndex);
        sceneStore.changeActiveScene(newSceneName + newNameIndex);
        patternStore.addPattern("S", sceneStore.active_scene, "silence");

        if (recordedObjects.length > 0) {
            const startTime = recordedObjects[0].timestamp;
            const endTime = recordedObjects[recordedObjects.length - 1].timestamp;
            let newPatternName = "PAT";
            let newPatternIndex = 0;

            recordedObjects.forEach(element => {
                if (element.type === "Tidal") {
                    let channelName = '';
                    let stepNumber = 0;
                    let time = element.timestamp - startTime;
                    let pat = _.replace(element.pattern, '\n', '');
                    let re = new RegExp("^.+?\\$", "g");
                    let match = re.exec(pat);
                    if (match !== null && match[0] !== undefined) {
                        channelName = _.trim(match[0].substring(0, match[0].length - 1));
                        pat = pat.substring(match[0].length, pat.length);
                        channelStore.addChannel(channelName, "Tidal", _.ceil(endTime / 1000 - startTime / 1000), "", 2, false);
                        stepNumber = _.toInteger(time / 1000.);
                        if (pat.includes("silence")) {
                            _.find(channelStore.channels, { 'name': channelName, 'scene': sceneStore.active_scene }).cells[stepNumber] = "S";
                        } else {
                            let mainPattern = "";
                            re = new RegExp('\\$[ ]*(n|s)[o\\W][^m].*?(#|\\n)', "g");
                            match = re.exec(pat);
                            if (match !== null && match[0] !== undefined) {
                                mainPattern = "`x` " + _.trim(match[0].substring(1, match[0].length - 1)) + " `y`";
                                let param1 = pat.substring(0, match.index + 1);
                                let param2 = pat.substring(match.index + match[0].length - 1, pat.length);
                                let patternItem = _.find(patternStore.patterns, { 'text': mainPattern, 'scene': sceneStore.active_scene });
                                if (patternItem === undefined) {
                                    patternStore.addPattern(newPatternName + newPatternIndex, sceneStore.active_scene, mainPattern, 'x,y');
                                    newPatternIndex += 1;
                                }
                                patternItem = _.find(patternStore.patterns, { 'text': mainPattern, 'scene': sceneStore.active_scene });
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
        if (!c) return;
        let ctx = c.getContext("2d");
        const length = _.toInteger(this.rmsArray.length * 0.5);
        const w = c.width, h = c.height, m = 5;
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
        if (!c) return;
        let ctx = c.getContext("2d");
        const l_left = _.toInteger(this.rmsArray.length * 0.5);
        const l_right = this.rmsArray.length - l_left;
        const w = c.width, h = c.height, m = 5;
        ctx.clearRect(0, 0, w, h);
        for (let i = l_left; i < this.rmsArray.length; i++) {
            const _w = w / l_right;
            const _h = _.toNumber(this.rmsArray[i].rms.toFixed(10)) * 10.;
            ctx.fillStyle = "rgba(180, 180, 180, " + (_h + 0.2) / (0.75 * h) + ")";
            ctx.fillRect((i - l_left) * _w + m, h * 0.5, _w - m, _h);
            ctx.fillRect((i - l_left) * _w + m, h * 0.5, _w - m, -_h);
        }
    }

    stopServer() {
        this.server_info = 1;
        request.get('http://localhost:3001/quit')
            .then((response) => {
                runInAction(() => { this.server_info = response.status === 200 ? 0 : 0; });
                console.log(response.status === 200 ? " ## Server stopped." : " ## Server quit failed.");
            }).catch((error) => {
                runInAction(() => { this.server_info = 0; });
                console.error(" ## Server errors: ", error);
            });
    }

    bootServer(config) {
        this.server_info = 1;
        request.post('http://localhost:3001/init', { 'b_config': config })
            .then((response) => {
                runInAction(() => { this.server_info = response.status === 200 ? 2 : 0; });
                console.log(response.status === 200 ? " ## Server booted." : " ## Server boot failed.");
            }).catch((error) => {
                runInAction(() => { this.server_info = 0; });
                console.error(" ## Server errors: ", error);
            });
    }

    record() {
        request.post('http://localhost:3001/record', { 'isRecord': this.recording })
            .then(() => {}).catch((error) => console.error(" ## Server errors: ", error));
    }

    play(index) {
        request.post('http://localhost:3001/playhistory', { 'isPlay': this.playing, 'index': index })
            .then(() => {}).catch((error) => {
                runInAction(() => { this.playing = false; });
                console.error(" ## Server errors: ", error);
            });
    }

    stop() {
        request.get('http://localhost:3001/stophistory')
            .then(() => {}).catch((error) => {
                runInAction(() => { this.playing = false; });
                console.error(" ## Server errors: ", error);
            });
    }

    getRecordingNames() {
        request.get('http://localhost:3001/recordings')
            .then((response) => { runInAction(() => { this.recordings = response.data.recordings; }); })
            .catch(() => { runInAction(() => { this.recordings = []; }); });
    }

    generateNewScene(i) {
        request.post('http://localhost:3001/generateScene', { 'fileIndex': i })
            .then((response) => { this.generateScene(response.data.recordedObjects); })
            .catch((error) => {
                runInAction(() => { this.playing = false; });
                console.error(" ## Server errors: ", error);
            });
    }
}

export default new MenubarStore();
