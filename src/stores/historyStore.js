import { observable, action, computed} from 'mobx';
import _ from 'lodash';

import channelStore from "./channelStore"
// import consoleStore from "./consoleStore"
// import pulseStore from "./pulseStore"
import request from '../utils/request'
// import io from 'socket.io-client';
const max_pattern_history = 10;

class HistoryStore 
{
    
    @observable channels_history = _.fill(Array(max_pattern_history), [])
    
    @computed get latestPatterns() {
        return this.channels_history.filter(h => h.length !== 0  );
    }

    @action updateHistory(pattern,cid, timestamp){
        let ch_sid = _.findIndex(channelStore.getActiveChannels, ['cid',  cid]);
        if(ch_sid >= 0 && ch_sid < max_pattern_history) {
            this.channels_history[ch_sid].push({'timestamp': timestamp, 'pattern': pattern, 'cid':cid});
        }
    }

    submitNano(expression, channel) {
        const ctx = this;
        request.post('http://localhost:3001/nano_ghc', { 'pattern': expression ,
                                                         'channel': channel})
          .then((response) => { 
            if (response){
                ctx.updateHistory(response.data.pattern, response.data.cid, response.data.timestamp);
            }
          }).catch(function (error) {
            console.error("ERROR", error);
          });
    }


    
}
export default new HistoryStore();