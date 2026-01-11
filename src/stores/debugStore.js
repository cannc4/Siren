import { makeAutoObservable } from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';

class DebugStore {
    sc_log = io('http://localhost:4003/');
    msg = '';

    constructor() {
        makeAutoObservable(this);
        this.sc_log.on('connect', () => {});
        this.sc_log.on('disconnect', () => {});
        this.sc_log.on("/scdebuglog", (data) => {
            console.log(data.msg);
            this.updateLog(data.msg);
        });
    }

    updateLog(msg) {
        var console_len = 5000;
        this.msg = this.msg + msg;
        if (this.msg.length > console_len) {
            this.msg = _.drop(this.msg, console_len);
        }
    }

    get debugLogMessage() {
        return this.msg;
    }
}

export default new DebugStore();
