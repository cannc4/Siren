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

class MenubarStore {
    // 0 = inactive
    // 1 = ready
    // 2 = running
    @observable server_info = 0;
    @observable history_folders = [];
    @observable recording = false;
    @observable playing = false;

    @observable rmsArray = [];

    sc_log_socket = io('http://localhost:4002/');
    constructor() {
        this.sc_log_socket.on('connect', (reason) => {
            this.server_info = 2;
        });
        this.sc_log_socket.on('disconnect', action((reason) => {
            this.server_info = 0;
        }));
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

    @action togglePlay() {
        this.playing = !this.playing;
        this.play(this.playing);
    }
    @action updateHistoryFolders(hf) {
        this.history_folders = hf;
        console.log(this.history_folders);
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
                    this.updateHistoryFolders(response.data.history_folders);
                }
            })).catch(action((error) => {
                //this.recording = false;
                console.error(" ## Server errors: ", error);
            }));
    }

    @action play() {
        request.post('http://localhost:3001/playhistory', {
                'isPlay': this.playing
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


}

export default new MenubarStore();