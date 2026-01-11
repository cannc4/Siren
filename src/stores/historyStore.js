import { makeAutoObservable } from 'mobx';
import _ from 'lodash';
import channelStore from "./channelStore";

const max_pattern_history = 10;

class HistoryStore {
    channels_history = _.fill(Array(max_pattern_history), []);

    constructor() {
        makeAutoObservable(this);
    }

    get latestPatterns() {
        return this.channels_history.filter(h => h.length !== 0);
    }

    updateHistory(pattern, cid, timestamp) {
        let ch_sid = _.findIndex(channelStore.getActiveChannels, ['cid', cid]);
        if (ch_sid >= 0 && ch_sid < max_pattern_history) {
            this.channels_history[ch_sid].push({
                'timestamp': timestamp,
                'pattern': pattern,
                'cid': cid
            });
        }
    }
}

export default new HistoryStore();
