import { makeAutoObservable } from 'mobx';
import _ from 'lodash';
import io from 'socket.io-client';
import channelStore from "./channelStore";
import pulseStore from './pulseStore';
import sceneStore from './sceneStore';

class NanoStore {
    nano = io('http://localhost:4005/');

    constructor() {
        makeAutoObservable(this);
        this.nano.on('connect', (reason) => console.log("KORG Socket Connected: ", reason));
        this.nano.on('disconnect', (reason) => console.log("KORG Socket Disconnected: ", reason));

        this.nano.on("/nano_knob", (data) => {
            let channel_id = _.toInteger(data.key);
            let channel_val = _.toInteger(data.value);
            let chans = channelStore.getActiveChannels;
            if (channel_id < chans.length) {
                channelStore.changeChannelRate(chans[channel_id].name, channel_val / 127 * 14 + 2);
            }
        });

        this.nano.on("/nano_slider", (data) => {
            let channel_id = _.toInteger(data.key);
            let channel_val = Math.abs(_.toInteger(data.value) - 127);
            channelStore.seekTimer(channel_val, channel_id);
        });

        this.nano.on("/nano_button", (data) => {
            if (_.startsWith(data.key, 's:') || _.startsWith(data.key, 'm:') || _.startsWith(data.key, 'r:')) {
                let channel_id = _.toInteger(data.key.charAt(2));
                let chans = channelStore.getActiveChannels;
                if (channel_id < chans.length) {
                    switch (data.key.charAt(0)) {
                        case 's': channelStore.toggleSolo(chans[channel_id].name); break;
                        case 'm': channelStore.toggleMute(chans[channel_id].name); break;
                        case 'r': channelStore.toggleLoop(chans[channel_id].name); break;
                        default: break;
                    }
                }
            } else if (data.key === "play") {
                if (!pulseStore.isActive) { pulseStore.setActive(true); pulseStore.startPulse(); }
                else { pulseStore.setActive(false); pulseStore.stopPulse(); }
            } else if (data.key === "stop") {
                if (data.value && pulseStore.isActive) { pulseStore.setActive(false); pulseStore.stopPulseStop(); }
            } else if (data.key === "prev") {
                if (data.value) sceneStore.changePrevScene();
            } else if (data.key === "next") {
                if (data.value) sceneStore.changeNextScene();
            }
        });
    }
}

export default new NanoStore();
