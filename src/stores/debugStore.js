import { observable, action, computed } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

class DebugStore 
{
    sc_log = io('http://localhost:4003/');    

    @observable msg = '';
    
    constructor() {
        const ctx = this;
        this.sc_log.on('connect', (reason) => {
            
        });
        this.sc_log.on('disconnect', action((reason) => {
            
        }));
        this.sc_log.on("/scdebuglog", action((data) => {
            console.log(data.msg);
            ctx.updateLog(data.msg);
        }))
    }

    @action updateLog(msg){
        var console_len = 5000;
        this.msg = this.msg + msg;
        if(this.msg.length > console_len){
            this.msg = _.drop(this.msg, console_len);
        }
        
    }
    @computed get debugLogMessage(){
        return this.msg;
    }
    
}
export default new DebugStore();
