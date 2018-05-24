import { action } from 'mobx';
import _ from 'lodash';
import io from 'socket.io-client';

import channelStore from "./channelStore"
import pulseStore from './pulseStore';
import sceneStore from './sceneStore';

class NanoStore 
{
    nano = io('http://localhost:4005/');    
    
    constructor() {
        const ctx = this;
        ctx.nano.on('connect', (reason) => {
            console.log("KORG Socket Connected: ", reason);
        });
        ctx.nano.on('disconnect', action((reason) => {
            console.log("KORG Socket Disconnected: ", reason);
        }));
        
        ctx.nano.on("/nano_knob", action((data) => {
            let channel_id = _.toInteger(data.key);
            let channel_val = _.toInteger(data.value);

            let chans = channelStore.getActiveChannels;
            if (channel_id < chans.length) { 
                channelStore.changeChannelRate(
                    chans[channel_id].name,
                    channel_val / 127 * 14 + 2
                );
            }
        }));

        ctx.nano.on("/nano_slider", action((data) => {
            let channel_id = _.toInteger(data.key);
            let channel_val = Math.abs(_.toInteger(data.value)-127);

            channelStore.seekTimer(channel_val, channel_id);
        }));

        // cycle // rec // prev // next // marker:set // market:prev // marker:next
        // track:prev // track:next // stop // play // s:0.. // m:0.. // r:0..
        ctx.nano.on("/nano_button", action((data) => {
            // Channel Buttons
            if (_.startsWith(data.key, 's:') || _.startsWith(data.key, 'm:') || _.startsWith(data.key, 'r:')) {
                let channel_id = _.toInteger(data.key.charAt(2));

                let chans = channelStore.getActiveChannels;
                if (channel_id < chans.length) {
                    switch (data.key.charAt(0)) {
                        case 's':
                            channelStore.toggleSolo(chans[channel_id].name);
                            break;
                        case 'm':
                            channelStore.toggleMute(chans[channel_id].name);
                            break;
                        case 'r':
                            channelStore.toggleLoop(chans[channel_id].name);
                            break;
                        default:
                            break;    
                    }
                }
            }
            else if (data.key === "play") {
                if (!pulseStore.isActive) {
                    pulseStore.setActive(true);
                    pulseStore.startPulse();
                }
                else {
                    pulseStore.setActive(false);
                    pulseStore.stopPulse();
                }
            }
            else if (data.key === "stop") {
                if (data.value && pulseStore.isActive) {
                    pulseStore.setActive(false);
                    pulseStore.stopPulseStop();
                }
            }
            else if (data.key === "prev") { 
                if(data.value) sceneStore.changePrevScene();
            }
            else if (data.key === "next") { 
                if(data.value) sceneStore.changeNextScene();
            }
            
        }));
    }
}
export default new NanoStore();