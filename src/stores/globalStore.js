import { makeAutoObservable, runInAction } from 'mobx';
import _ from 'lodash';
import request from '../utils/request';
import historyStore from './historyStore';

class GlobalStore {
    global_mod = [{ name: '', channels: '', transformer: '', modifier: '', param: '' }];

    constructor() {
        makeAutoObservable(this);
        this.load();
    }

    get getGlobals() { return this.global_mod; }
    get getChannels() { return this.global_channels; }
    get getTransform() { return this.global_transformer; }
    get getModifier() { return this.global_modifier; }
    get getParam() { return this.global_name; }

    addGlobal(name) {
        if (_.find(this.global_mod, { 'name': name }) === undefined) {
            this.global_mod.push({ name, channels: '', transformer: '', modifier: '', param: '' });
        } else {
            alert(name + ' already exists.');
        }
    }

    deleteGlobal(name) {
        this.global_mod = _.reject(this.global_mod, { 'name': name });
    }

    compileGlobal(name) {
        let gitem = _.find(this.global_mod, { 'name': name });
        let channels = gitem.channels;
        let transformer = gitem.transformer;
        let modifier = gitem.modifier;
        let gbchan = channels.split(" ");

        let activePatterns = historyStore.latestPatterns;
        let activePatternsLen = activePatterns.length;
        if (transformer !== undefined && modifier !== undefined) {
            if (gbchan !== undefined && gbchan.length > 0 && activePatterns !== undefined && activePatternsLen > 0) {
                for (let i = 0; i < activePatternsLen; i++) {
                    let curPat = _.last(activePatterns[i]);
                    if (curPat !== undefined && curPat.pattern !== '') {
                        let patternbody = curPat.pattern.substring(_.indexOf(curPat.pattern, "$") + 1);
                        let patname = curPat.pattern.substring(0, _.indexOf(curPat.pattern, "$") + 1);
                        let patchannumber = _.toInteger(patname.charAt(1));
                        if (_.includes(gbchan, patchannumber.toString()) || _.includes(gbchan, "0")) {
                            let pattern = patname + (transformer || '') + patternbody + (modifier || '');
                            this.submitGHC(pattern);
                        }
                    }
                }
            }
        }
    }

    changeGlobalName(name, new_name) {
        let gitem = _.find(this.global_mod, { 'name': name });
        if (gitem !== undefined) gitem.name = new_name;
    }

    updateTransformer(name, transformer) {
        let gitem = _.find(this.global_mod, { 'name': name });
        if (gitem) gitem.transformer = transformer;
    }

    updateModifier(name, modifier) {
        let gitem = _.find(this.global_mod, { 'name': name });
        if (gitem) gitem.modifier = modifier;
    }

    updateChannels(name, channels) {
        let gitem = _.find(this.global_mod, { 'name': name });
        if (gitem) gitem.channels = channels;
    }

    submitGHC(expression) {
        request.post('http://localhost:3001/global_ghc', { 'pattern': expression })
            .then(() => console.log("RESPONSE GHC"))
            .catch((error) => console.error("ERROR", error));
    }

    load() {
        request.get('http://localhost:3001/globals_load')
            .then((response) => {
                if (response.data.globals !== undefined) {
                    runInAction(() => { this.global_mod = response.data.globals; });
                    console.log(" ## Globals loaded: ", this.globals);
                }
            }).catch((error) => console.error(" ## GlobalStore errors: ", error));
    }

    save() {
        request.post('http://localhost:3001/globals_save', { 'globals': this.getGlobals })
            .then(() => console.log(" ## Globals Saved"))
            .catch((error) => console.error(" ## GlobalStore errors: ", error));
    }
}

export default new GlobalStore();
