import { makeAutoObservable } from 'mobx';
import io from 'socket.io-client';
import channelStore from './channelStore';
import request from '../utils/request';

class PulseStore {
    cps_info = true;
    pulse_info = false;
    pulse = { bpm: 120, beat: '', phase: '' };
    link_pulse = io('http://localhost:4001/');

    constructor() {
        makeAutoObservable(this);
        this.link_pulse.on('connect', (reason) => console.log("Port 4001 Connected: ", reason));
        this.link_pulse.on('disconnect', (reason) => {
            console.log("Port 4001 Disconnected: ", reason);
            this.setActive(false);
        });
        this.link_pulse.on("pulse", (data) => {
            this.pulse.bpm = data.bpm;
            this.pulse.beat = data.beat;
            this.pulse.phase = data.phase;
            channelStore.updateAll();
            this.setActive(true);
        });
    }

    get isActive() { return this.pulse_info; }

    setActive(value) { this.pulse_info = value; }

    startPulse() {
        console.log("Start Pulse");
        request.post('http://localhost:3001/pulse')
            .then((response) => {
                if (response.status === 200) { console.log(" ## Pulse started."); this.setActive(true); }
                else { console.log(" ## Pulse failed."); this.setActive(false); }
            }).catch((error) => console.error(" ## Server errors: ", error));
    }

    stopPulse() {
        request.post('http://localhost:3001/pulseStop')
            .then((response) => {
                if (response.status === 200) { console.log(" ## Pulse stopped."); this.setActive(false); }
                else console.log(" ## Pulse can't be stopped.");
            }).catch((error) => console.error(" ## Server errors: ", error));
    }

    stopPulseStop() {
        channelStore.resetAllTimes();
        channelStore.silenceAllChannels();
        this.stopPulse();
    }
}

export default new PulseStore();
