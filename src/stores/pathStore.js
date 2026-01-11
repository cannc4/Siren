import { makeAutoObservable, runInAction } from 'mobx';
import request from '../utils/request';

class PathStore {
    isLoading = false;
    paths = {
        userpath: '',
        ghcipath: '',
        sclang: '',
        scsynth: '',
        sclang_conf: '',
        tidal_boot: '',
        scd_start: ''
    };

    constructor() {
        makeAutoObservable(this);
        this.load();
    }

    load() {
        console.log(" ## LOADING PATHS...");
        this.isLoading = true;
        request.get('http://localhost:3001/paths')
            .then((response) => {
                runInAction(() => {
                    if (response.data.paths) {
                        this.paths = response.data.paths;
                        console.log(" ## Paths loaded: ", this.paths);
                    }
                    this.isLoading = false;
                });
            }).catch((error) => {
                console.error(" ## Paths errors: ", error);
                runInAction(() => { this.isLoading = false; });
            });
    }

    save() {
        request.post('http://localhost:3001/paths', { 'paths': this.paths })
            .then((response) => {
                console.log(response.status === 200 ? " ## Paths saved." : " ## Paths save failed.");
            }).catch((error) => console.error(" ## Paths errors: ", error));
    }

    updateValue(key, value) {
        this.paths[key] = value;
    }
}

export default new PathStore();
