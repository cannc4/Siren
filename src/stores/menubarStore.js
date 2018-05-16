import { observable, action, computed } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

// nodejs connections
import request from '../utils/request'
// import { rmdirSync } from 'fs';

class MenubarStore 
{
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
        this.sc_log_socket.on("/rms", action((data) => {
            const i = _.toNumber(data.orbit.charAt(data.orbit.length - 1));

            if (this.rmsArray[i] !== undefined)
                this.rmsArray[i] = { rms: data.rms, peak: data.peak };
            else
                this.rmsArray.push({ rms: data.rms, peak: data.peak });
        }))
    }

    @computed get getActive() {
        return this.server_info;  
    }

    @computed get isRecording() { 
        return this.recording;
    }

    @action toggleRecording() { 
        this.recording = !this.recording;
        // this.record(this.recording);
    }
    @computed get isPlaying() { 
        return this.playing;
    }

    @action togglePlay() { 
        this.playing = !this.playing;
        this.play(this.playing);
    }
    @action updateHistoryFolders(hf){
        this.history_folders = hf;
        console.log(this.history_folders);
    }
    createRMSShape(orbit) { 
        const setCharAt = (str, index, chr) => {
            if (index > str.length - 1) return str;
            return str.substr(0, index) + chr + str.substr(index + 1);
        };

        let rms = this.rmsArray.length > orbit ? this.rmsArray[orbit].rms : 0;

        let shape = "⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀";
        for(let i = 0; i < _.toInteger(rms * 20); i++) { 
            let mod = rms * 20.0 - i;
            if (mod < 0.33)
                shape = setCharAt(shape, i, '\\');
            else if (mod < 0.66)
                shape = setCharAt(shape, i, '|');
            else if (mod < 1.0) 
                shape = setCharAt(shape, i, '/');
            else
                shape = setCharAt(shape, i, '⣿');
        }
        return shape;
    }

    @action stopServer() {
        this.server_info = 1;
        request.get('http://localhost:3001/quit')
            .then(action((response) => {
                if (response.status === 200) 
                {
                    this.server_info = 0;
                    console.log(" ## Server stopped.");
                }
                else {
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
        request.post('http://localhost:3001/init', { 'b_config': config })
            .then(action((response) => {
                if (response.status === 200) 
                {
                    this.server_info = 2;
                    console.log(" ## Server booted.");
                }
                else {
                    this.server_info = 0;
                    console.log(" ## Server boot failed.");
                }                        
            })).catch(action((error) => {
                this.server_info = 0;                
                console.error(" ## Server errors: ", error);
            }));
    }

    @action record() {
        request.post('http://localhost:3001/record', { 'isRecord' : this.recording } )
            .then(action((response) => {
                if (response.status === 200) {
                    this.updateHistoryFolders(response.data.history_folders);
                 }  
            })).catch(action((error) => {
                //this.recording = false;
                console.error(" ## Server errors: ", error);
            }));
    }
    
    @action play() {
        request.post('http://localhost:3001/playhistory', { 'isPlay' : this.playing } )
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
