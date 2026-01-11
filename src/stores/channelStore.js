import { makeAutoObservable } from 'mobx';
import _ from 'lodash';

import pulseStore from './pulseStore';
import sceneStore from './sceneStore';
import patternStore from './patternStore';
import historyStore from './historyStore';
import globalStore from './globalStore';
import consoleStore from './consoleStore';
import request from '../utils/request';

class ChannelStore {
    channels = [{
        scene: 'default',
        activeSceneIndex: 0,
        name: 'd1',
        type: 'Tidal',
        steps: 8,
        cells: _.fill(Array(8), ''),
        transition: '',
        rate: 16,
        gate: false,
        solo: false,
        mute: false,
        loop: true,
        executed: false,
        selected: false,
        time: 0,
        cid: 0
    }];
    soloEnabled = false;

    constructor() {
        makeAutoObservable(this);
    }

    get getActiveChannels() {
        return this.channels.filter(c => c.scene === sceneStore.active_scene);
    }

    get getMaxStep() {
        if (this.getActiveChannels.length > 0)
            return _.maxBy(this.getActiveChannels, 'steps').steps;
        return 0;
    }

    get updateCellActiveClasses() {
        for (let i = 0; i < this.getActiveChannels.length; i++) {
            const element = this.getActiveChannels[i];
            for (let j = 0; j < element.cells.length; j++) {
                let dom_cell = document.getElementById('cell_' + i + '_' + j);
                if (dom_cell) {
                    dom_cell.className = _.replace(dom_cell.className, ' active', '');
                }
            }
        }
        this.getActiveChannels.forEach(ch => {
            let dom_cell = document.getElementById('cell_' + ch.activeSceneIndex + '_' + (ch.time % ch.steps));
            if (dom_cell) dom_cell.className += ' active';
        });
    }

    updateTime(ch, step_index) {
        console.log(ch, step_index);
        this.channels[ch].time = step_index;
    }

    clearChannel(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) {
            ch.cells = _.fill(Array(ch.steps), '');
        }
    }

    resetTime(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) ch.time = 0;
    }

    resetAllTimes() {
        _.each(this.channels, (ch) => {
            if (ch !== undefined) ch.time = 0;
        });
    }

    seekTimer(step_index, channel_index = -1) {
        let active_channels = this.getActiveChannels;
        if (channel_index === -1) {
            _.forEach(active_channels, (channel) => {
                channel.time = (step_index >= channel.steps ? channel.steps - 1 : step_index);
            });
        } else {
            if (channel_index >= active_channels.length) return;
            active_channels[channel_index].time = _.toInteger(step_index / 128.0 * active_channels[channel_index].steps);
        }
    }

    silenceChannel(channel) {
        if (channel.type === "Tidal") {
            consoleStore.submitGHC(channel.name + "$ silence");
        }
    }

    silenceAllChannels() {
        _.each(this.getActiveChannels, (channel) => this.silenceChannel(channel));
    }

    updateAll() {
        _.forEach(this.getActiveChannels, (channel) => {
            if (channel.gate && pulseStore.pulse.beat % channel.rate === 0) {
                if (!channel.executed) {
                    channel.time += 1;
                    let current_step = channel.time % channel.steps;
                    if (channel.cells[current_step] !== undefined) {
                        if ((!this.soloEnabled || (this.soloEnabled && channel.solo)) && !channel.mute) {
                            if (channel.cells[current_step] !== '')
                                this.sendPattern(channel, channel.cells[current_step]);
                            if (!channel.loop && current_step === channel.steps - 1) {
                                if (!channel.executed) channel.executed = true;
                            }
                        }
                    }
                } else if (channel.executed && channel.type === 'Tidal') {
                    consoleStore.submitGHC(channel.name + ' $ silence');
                    channel.gate = false;
                }
            }
        });
        sceneStore.progressScenes();
    }

    sendPattern(channel, step) {
        let globoj = {
            channels: globalStore.global_channels,
            transform: globalStore.global_transformer,
            modifier: globalStore.global_modifier,
            param: globalStore.global_name,
            res_parameters: patternStore.reserved_parameters
        };
        let patobj = patternStore.activePatterns;
        let globnew = globalStore.getGlobals;
        request.post('http://localhost:3001/patternstream', {
            'step': step,
            'patterns': patobj,
            'channel': channel,
            'global_mod': globoj,
            'globals': globnew
        }).then((response) => {
            console.log(" ## Pattern response: ", response.data.pattern);
            console.log(" ## CID response: ", response.data.cid);
            if (response) historyStore.updateHistory(response.data.pattern, response.data.cid, response.data.timestamp);
        }).catch((error) => console.error(" ## Pattern errors: ", error));
    }

    overwriteCell(scene_channel_index, cell_index, value) {
        let activeChannels = this.getActiveChannels;
        if (scene_channel_index < activeChannels.length) {
            if (cell_index < activeChannels[scene_channel_index].steps) {
                activeChannels[scene_channel_index].cells[cell_index] = value;
            } else {
                this.addStep(this.getActiveChannels[scene_channel_index].name);
            }
        }
    }

    loadChannels(new_channels) {
        this.channels = new_channels;
    }

    duplicateChannels(old_scene, new_scene) {
        _.forEach(_.filter(this.channels, ['scene', old_scene]), element => {
            let new_item = _.cloneDeep(element);
            new_item.scene = new_scene;
            new_item.cells = _.fill(Array(element.steps), '');
            _.forEach(element.cells, (c, i) => { new_item.cells[i] = _.cloneDeep(c); });
            this.channels.push(new_item);
        });
    }

    addChannel(name, type, steps, transition, rate = 8, warn = true) {
        if (_.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene }) === undefined) {
            this.channels.push({
                scene: sceneStore.active_scene,
                activeSceneIndex: this.getActiveChannels.length,
                name, type, steps, rate, time: 0, transition,
                cells: _.fill(Array(_.toInteger(steps)), ''),
                gate: false, solo: false, mute: false, loop: true, executed: false, selected: false,
                cid: this.channels.length
            });
        } else if (warn) {
            alert(name + ' already exists.');
        }
    }

    deleteChannel(name, scene = sceneStore.active_scene) {
        this.channels = _.reject(this.channels, { 'name': name, 'scene': scene });
        _.each(this.getActiveChannels, (c, i) => { c.activeSceneIndex = i; });
    }

    deleteAllChannelsInScene(scene) {
        this.channels = _.reject(this.channels, { 'scene': scene });
    }

    changeChannelRate(name, rate) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) ch.rate = _.toInteger(rate);
    }

    changeChannelName(name, new_name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        let ch_new = _.find(this.channels, { 'name': new_name, 'scene': sceneStore.active_scene });
        if (ch !== undefined && ch_new === undefined) ch.name = new_name;
    }

    changeChannelType(name, new_type) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) ch.type = new_type;
    }

    changeChannelTransition(name, transition) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) ch.transition = transition;
    }

    toggleMute(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) {
            ch.mute = !ch.mute;
            if (ch.mute === true && ch.type === 'Tidal') consoleStore.submitGHC(ch.name + ' $ silence');
        }
    }

    toggleSolo(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) {
            ch.solo = !ch.solo;
            if (ch.solo) {
                this.soloEnabled = true;
                _.forEach(this.getActiveChannels, (other) => {
                    if (other.name !== ch.name) {
                        other.solo = false;
                        if (other.type === 'Tidal') consoleStore.submitGHC(other.name + ' $ silence');
                    }
                });
            } else this.soloEnabled = false;
        }
    }

    toggleLoop(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) { ch.loop = !ch.loop; ch.executed = false; }
    }

    toggleGate(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) ch.gate = !ch.gate;
    }

    addStep(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) {
            const temp = ch.time % ch.steps;
            ch.steps += 1;
            ch.time = temp;
            ch.cells.push('');
        }
    }

    removeStep(name) {
        let ch = _.find(this.channels, { 'name': name, 'scene': sceneStore.active_scene });
        if (ch !== undefined) {
            const temp = ch.time % ch.steps;
            ch.steps -= 1;
            ch.cells.pop();
            ch.time = temp;
        }
    }
}

export default new ChannelStore();
