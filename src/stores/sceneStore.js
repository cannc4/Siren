import { makeAutoObservable, runInAction } from 'mobx';
import _ from 'lodash';
import patternStore from './patternStore';
import channelStore from './channelStore';
import cellStore from './cellStore';
import request from '../utils/request';

class SceneStore {
    active_scene = 'default';
    scene_list = ['default'];
    scene_mode = false;

    constructor() {
        makeAutoObservable(this);
        this.load();
    }

    isActive(name) { return this.active_scene === name; }

    get scenesReversedOrder() {
        let temp = this.scene_list.filter(s => s !== "default");
        return _.concat("default", _.reverse(temp));
    }

    get activeScene() { return this.active_scene; }
    get activeSceneId() { return _.indexOf(this.scenesReversedOrder, this.active_scene); }

    changeActiveScene(name) {
        this.active_scene = name;
        channelStore.soloEnabled = _.some(_.filter(channelStore.channels, ['scene', name]), ['solo', true]);
        if (this.scene_mode) {
            _.each(channelStore.getActiveChannels, (c) => { c.loop = false; c.executed = false; });
        }
        cellStore.updateSelectState(false);
    }

    changeNextScene() {
        const reversed = this.scenesReversedOrder;
        let index = _.indexOf(reversed, this.active_scene);
        if (index >= reversed.length - 1) index = 0;
        this.changeActiveScene(reversed[index + 1]);
    }

    changePrevScene() {
        const reversed = this.scenesReversedOrder;
        const index = _.indexOf(reversed, this.active_scene);
        if (index <= 0) return;
        this.changeActiveScene(reversed[index - 1]);
    }

    clearActiveGrid() {
        _.forEach(channelStore.getActiveChannels, (c) => channelStore.clearChannel(c.name));
    }

    addScene(name) {
        if (name !== '') {
            if (_.indexOf(this.scene_list, name) < 0) {
                this.scene_list.push(name);
                console.log(" ## \"" + name + "\" added.");
            } else alert(name + " already exists.");
        } else alert("Please enter a scene name.");
    }

    toggleScenemode() {
        this.scene_mode = !this.scene_mode;
        _.each(channelStore.getActiveChannels, (c) => { c.loop = !this.scene_mode; c.executed = !this.scene_mode; });
    }

    progressScenes() {
        if (this.scene_mode === true && _.every(channelStore.getActiveChannels, ['executed', true])) {
            this.changeNextScene();
        }
    }

    deleteScene(name) {
        if (name !== '' && name !== 'default') {
            patternStore.deleteAllPatternsInScene(name);
            channelStore.deleteAllChannelsInScene(name);
            this.scene_list = _.remove(this.scene_list, (n) => n !== name);
        }
    }

    duplicateScene(name) {
        if (name !== '') {
            if (_.find(this.scene_list, name) === undefined) {
                this.scene_list.push(name);
                patternStore.duplicatePatterns(this.active_scene, name);
                channelStore.duplicateChannels(this.active_scene, name);
                console.log(" ## \"" + this.active_scene + "\" duplicated in \"" + name + "\".");
            } else alert(name + " already exists.");
        } else alert("Please enter a scene name.");
    }

    load() {
        console.log(" ## LOADING SCENES...");
        request.get('http://localhost:3001/scenes')
            .then((response) => {
                if (response.data.scenes && response.data.patterns && response.data.channels && response.data.active_s) {
                    runInAction(() => {
                        this.scene_list = response.data.scenes;
                        this.active_scene = response.data.active_s;
                    });
                    patternStore.loadPatterns(response.data.patterns);
                    channelStore.loadChannels(response.data.channels);
                    console.log(" ## Scenes loaded: ", this.scene_list);
                }
            }).catch((error) => console.error(" ## SceneStore errors: ", error));
    }

    save() {
        request.post('http://localhost:3001/scenes', {
            'scenes': this.scene_list,
            'active_s': this.active_scene,
            'patterns': patternStore.patterns,
            'channels': channelStore.channels
        }).then((response) => console.log(" ## Scene save response: ", response))
          .catch((error) => console.error(" ## SceneStore errors: ", error));
    }
}

export default new SceneStore();
