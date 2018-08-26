import {
    observable,
    action,
    computed
} from 'mobx';
import _ from 'lodash';
// nodejs connections
import request from '../utils/request'
import historyStore from './historyStore';

class GlobalStore {
    @observable global_mod = [{
        name:'',
        channels: '',
        transformer: '',
        modifier: '',
        param: ''
    }]

    constructor() {
       this.load();
    }

    // getters
    @computed get getGlobals() {
        return this.global_mod;
    }
    @computed get getChannels() {
        return this.global_channels;
    }
    @computed get getTransform() {
        return this.global_transformer;
    }
    @computed get getModifier() {
        return this.global_modifier;
    }
    @computed get getParam() {
        return this.global_name;
    }

    @action addGlobal(name) {
        if (_.find(this.global_mod, {
                'name': name
            }) === undefined) {
            this.global_mod.push({
                name: name,
                channels: '',
                transformer: '',
                modifier: '',
                param: ''
            });
        } else {
            alert(name + ' already exists.');
        }
    }


    @action deleteGlobal(name) {
        this.global_mod = _.reject(this.global_mod, {
            'name': name
        });
    }

    @action compileGlobal(name) {
     
        let gitem = _.find(this.global_mod, {
            'name': name,
        });
        const ctx = this;
        let channels = gitem.channels;
        let transformer = gitem.transformer;
        let modifier = gitem.modifier;
        let gbchan = channels.split(" ");

        // TODO: CHANGE HISTORY AND FIX THIS PROPERLY
        let activePatterns = historyStore.latestPatterns;
        let activePatternsLen = activePatterns.length;
        if (transformer !== undefined && modifier !== undefined) {
            // console.log("GLOBAL UPDATE PATTERNS:", channels, transformer, modifier,activePatterns,activePatternsLen);
            if (gbchan !== undefined && gbchan.length > 0 && activePatterns !== undefined && activePatternsLen > 0) {
                for (let i = 0; i < activePatternsLen; i++) {
                    let curPat = _.last(activePatterns[i]);
                    if (curPat !== undefined && curPat.pattern !== '') {
                        let patternbody = curPat.pattern.substring(_.indexOf(curPat.pattern, "$") + 1);
                        let patname = curPat.pattern.substring(0, _.indexOf(curPat.pattern, "$") + 1);
                        
                        let patchannumber = _.toInteger(patname.charAt(1));
                        if (_.includes(gbchan, patchannumber.toString()) || _.includes(gbchan, "0")) { 
                            if (transformer === undefined) transformer = '';
                            if (modifier === undefined) modifier = '';

                            let pattern = patname + transformer + patternbody + modifier;

                            ctx.submitGHC(pattern);
                        }
                    }
                }
            }
        }
    }

    @action changeGlobalName(name, new_name) {
        let gitem = _.find(this.global_mod, {
            'name': name,
        });
        if (gitem !== undefined) {
            gitem.name = new_name;
        }
    }
    @action updateTransformer(name,transformer) {
        let gitem = _.find(this.global_mod, {
            'name': name
        });
        gitem.transformer = transformer;
    }
    @action updateModifier(name,modifier) {
        let gitem = _.find(this.global_mod, {
            'name': name
        });
        gitem.modifier = modifier;
    }

    @action updateChannels(name,channels) {
        let gitem = _.find(this.global_mod, {
            'name': name
        });
        gitem.channels = channels;
    }

    // @action saveGlobals() {
    //     let gobj = {
    //         channels: this.global_channels,
    //         transformer: this.global_transformer,
    //         modifier: this.global_modifier,
    //         param: this.global_name,
    //     };
    //     this.global_mod.push(gobj);
    //     this.active_index = this.global_mod.length - 1;
    //     this.save();
    // }

    submitGHC(expression) {
        request.post('http://localhost:3001/global_ghc', {
                'pattern': expression
            })
            .then((response) => {
                console.log("RESPONSE GHC");
            }).catch(function (error) {
                console.error("ERROR", error);
            });
    }


    load() {
        request.get('http://localhost:3001/globals_load')
            .then(action((response) => {
                if (response.data.globals !== undefined) {
                    this.global_mod = response.data.globals;
                    console.log(" ## Globals loaded: ", this.globals);
                }
            })).catch(function (error) {
                console.error(" ## GlobalStore errors: ", error);
            });
    };

    save() {
        request.post('http://localhost:3001/globals_save', {
                'globals': this.getGlobals
            })
            .then((response) => {
                console.log(" ## Globals Saved");
            }).catch(function (error) {
                console.error(" ## GlobalStore errors: ", error);
            });
    };
}

export default new GlobalStore();