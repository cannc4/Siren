// import { observable, action, computed} from 'mobx';
// import _ from 'lodash';
// import io from 'socket.io-client';

// import channelStore from "./channelStore"
// import consoleStore from "./consoleStore"
// import pulseStore from "./pulseStore"
// import historyStore from './historyStore';

class NanoStore 
{
    // nano = io('http://localhost:4003/');    
    
    // constructor() {
    //     const ctx = this;
    //     this.nano.on('connect', (reason) => {
    //         console.log("Port 4003 Connected: ", reason);
    //     });
    //     this.nano.on('disconnect', action((reason) => {
    //         console.log("Port 4003 Disconnected: ", reason);
    //     }));
    //     this.nano.on("/nanoknob", action((data) => {
            
    //         // TODO: PATLIYOR
    //         if(historyStore.latestPatterns[data.index] !== undefined){
    //             let activePatterns = historyStore.latestPatterns;
    //             let selected_param = "#nudge ";
    //             let nano_pattern = activePatterns[data.index][activePatterns.length-1].pattern + selected_param + data.value;
    //             historyStore.submitNano(nano_pattern,channelStore.channels[data.index]);
    //         }
    //     }));
    //     this.nano.on("/nanobutton", action((data) => {
    //         channelStore.updateChannel(data.index, data.type, data.value);
    //     }));
    //     this.nano.on("/nanostart", action((data) => {
    //         if(data.trigger === true) 
    //             pulseStore.startPulse();
    //         else {
    //             pulseStore.setActive(false);
    //             pulseStore.stopPulse();
    //             pulseStore.stopPulse();
    //         }
    //     }));
        
    // }
  
    
}
export default new NanoStore();