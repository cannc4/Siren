import { makeAutoObservable, runInAction } from 'mobx';
import request from '../utils/request';

class ConsoleStore {
    sc_text = '';
    tidal_text = '';

    constructor() {
        makeAutoObservable(this);
        this.load();
    }

    onChangeSC(text) {
        this.sc_text = text;
    }

    onChangeTidal(text) {
        this.tidal_text = text;
    }

    submitSC(expression) {
        request.post('http://localhost:3001/console_sc', { 'pattern': expression })
            .then(() => console.log("RESPONSE SC"))
            .catch((error) => console.error("ERROR", error));
    }

    submitGHC(expression) {
        request.post('http://localhost:3001/console_ghc', { 'pattern': expression })
            .then(() => console.log("RESPONSE GHC"))
            .catch((error) => console.error("ERROR", error));
    }

    load() {
        request.get('http://localhost:3001/console')
            .then((response) => {
                if (response.data.sc !== undefined && response.data.tidal !== undefined) {
                    runInAction(() => {
                        this.sc_text = response.data.sc;
                        this.tidal_text = response.data.tidal;
                    });
                    console.log(" ## Console loaded: ");
                }
            }).catch((error) => console.error(" ## ConsoleStore errors: ", error));
    }

    save() {
        request.post('http://localhost:3001/console', {
            'sc': this.sc_text,
            'tidal': this.tidal_text
        })
            .then(() => console.log(" ## Console save response: "))
            .catch((error) => console.error(" ## ConsoleStore errors: ", error));
    }
}

export default new ConsoleStore();
