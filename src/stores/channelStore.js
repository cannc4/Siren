import {
    observable,
    action,
    computed
} from 'mobx';
import _ from 'lodash';

import pulseStore from './pulseStore';
import sceneStore from './sceneStore';
import patternStore from './patternStore';
import historyStore from './historyStore';
import globalStore from './globalStore';
import consoleStore from './consoleStore';

import request from '../utils/request'

class ChannelStore {
    @observable channels = [{
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
    @observable soloEnabled = false;

    // Getters
    @computed get
    getActiveChannels() {
        return this.channels.filter(c => c.scene === sceneStore.active_scene);
    }
    @computed get
    getMaxStep() {
        if (this.getActiveChannels.length > 0)
            return _.maxBy(this.getActiveChannels, 'steps').steps;
        else
            return 0;
    }
    @computed get
    updateCellActiveClasses() { 
        // deselect all
        for (let i = 0; i < this.getActiveChannels.length; i++) {
            const element = this.getActiveChannels[i];
            for (let j = 0; j < element.cells.length; j++) {
                let dom_cell = document.getElementById('cell_' + i + '_' + j);
                if (dom_cell) { 
                    dom_cell.className = _.replace(dom_cell.className, ' active', ''); 
                }
            }
        }

        // Active
        this.getActiveChannels.forEach(ch => {
            let dom_cell = document.getElementById('cell_' + ch.activeSceneIndex + '_' + (ch.time % ch.steps));
            if (dom_cell) dom_cell.className += ' active'; 
        });
    }

    @action
    clearChannel(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.cells = _.fill(Array(ch.steps), '');
        }
    }

    @action
    resetTime(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.time = 0;
        }
    }

    @action
    resetAllTimes() {
        _.each(this.channels, (ch, i) => {
            if (ch !== undefined) {
                ch.time = 0;
            }
        });

    }
    @action
    seekTimer(step_index, channel_index = -1) {
        let active_channels = this.getActiveChannels;
        if (channel_index === -1)
            _.forEach(active_channels, (channel, i) => {
                channel.time = (step_index >= channel.steps ? channel.steps - 1 : step_index);
            });
        else {
            if (channel_index >= active_channels.length)
                return;
            else {
                // KORG values are between 0-127
                active_channels[channel_index].time = _.toInteger(step_index / 128.0 * active_channels[channel_index].steps);
            }
        }
    }

    silenceChannel(channel) {
        if (channel.type === "Tidal") {
            consoleStore.submitGHC(channel.name + "$ silence");
        }
        // else if ("SuperCollider") { 
        //     consoleStore.submitSC("s.freeAll;");
        // }
    }
    silenceAllChannels() {
        _.each(this.getActiveChannels, (channel) => { 
            this.silenceChannel(channel);
        });
    }

    // Update the timer values based on the pulse 
    @action
    updateAll() {
        _.forEach(this.getActiveChannels, (channel, i) => {
            if (channel.gate && pulseStore.pulse.beat % channel.rate === 0 ) {
                // if not still looping
                if (!channel.executed) {
                    channel.time += 1;
                    let current_step = channel.time % channel.steps;

                    // if cell is not empty
                    if (channel.cells[current_step] !== undefined) {
                        // check if solo or mute enabled
                        if ((!this.soloEnabled || (this.soloEnabled && channel.solo)) && !channel.mute) {
                            if (channel.cells[current_step] !== '')
                                this.sendPattern(channel, channel.cells[current_step]);

                            if (!channel.loop && current_step === channel.steps - 1) {
                                if (!channel.executed) {
                                    channel.executed = true;
                                }
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
            transform: globalStore.global_transform,
            modifier: globalStore.global_modifier,
            param: globalStore.global_param,
            res_parameters: patternStore.reserved_parameters
        }

        let patobj = patternStore.activePatterns;
        request.post('http://localhost:3001/patternstream', {
                'step': step,
                'patterns': patobj,
                'channel': channel,
                'global_mod': globoj,
            })
            .then((response) => {
                console.log(" ## Pattern response: ", response.data.pattern);
                console.log(" ## CID response: ", response.data.cid);
                if (response) {
                    historyStore.updateHistory(response.data.pattern, response.data.cid, response.data.timestamp);
                }


            }).catch(function (error) {
                console.error(" ## Pattern errors: ", error);
            });
    }

    @action overwriteCell(scene_channel_index, cell_index, value) {
        let activeChannels = this.getActiveChannels;
        if (scene_channel_index < activeChannels.length) {
            if (cell_index < activeChannels[scene_channel_index].steps) {
                activeChannels[scene_channel_index].cells[cell_index] = value;
            } else {
                this.addStep(this.getActiveChannels[scene_channel_index].name);
            }
        }
    }

    // LOAD AND DUPLICATE
    @action loadChannels(new_channels) {
        this.channels = new_channels;
    }
    @action duplicateChannels(old_scene, new_scene) {
        _.forEach(_.filter(this.channels, ['scene', old_scene]), element => {
            let new_item = _.cloneDeep(element);
            new_item.scene = new_scene;
            new_item.cells = _.fill(Array(element.steps), '');

            _.forEach(element.cells, (c, i) => {
                new_item.cells[i] = _.cloneDeep(c);
            })
            console.log(element.cells, new_item.cells);

            this.channels.push(new_item);
        });
    }

    // Add Delete Channels
    @action addChannel(name, type, steps, transition, rate = 8, warn = true) {
        if (_.find(this.channels, {
                'name': name,
                'scene': sceneStore.active_scene
            }) === undefined) {
            this.channels.push({
                scene: sceneStore.active_scene,
                activeSceneIndex: this.getActiveChannels.length,
                name: name,
                type: type,
                steps: steps,
                rate: rate,
                time: 0,
                transition: transition,
                cells: _.fill(Array(_.toInteger(steps)), ''),
                gate: false,
                solo: false,
                mute: false,
                loop: true,
                executed: false,
                selected: false,
                cid: this.channels.length
            });
            // const dom = document.getElementById('channelheader_' + (this.getActiveChannels.length - 1));
            // if (dom) dom.focus(); 
        } else {
            if(warn)
                alert(name + ' already exists.');
        }
    }
    @action deleteChannel(name, scene = sceneStore.active_scene) {
        this.channels = _.reject(this.channels, {
            'name': name,
            'scene': scene
        });
        // Rearrange the active scene index
        _.each(this.getActiveChannels, (c, i) => {
            c.activeSceneIndex = i;
        })
    }
    @action deleteAllChannelsInScene(scene) {
        this.channels = _.reject(this.channels, {
            'scene': scene
        });
    }

    // Edit Header Fields
    @action changeChannelRate(name, rate) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.rate = _.toInteger(rate);
        }
    }
    @action changeChannelName(name, new_name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        let ch_new = _.find(this.channels, {
            'name': new_name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined && ch_new === undefined) {
            ch.name = new_name;
        }
    }
    @action changeChannelType(name, new_type) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.type = new_type;
        }
    }
    @action changeChannelTransition(name, transition) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.transition = transition;
        }
    }

    // Toggle Header Fields
    @action toggleMute(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.mute = !ch.mute;

            // actually stop audio
            // TODO: SC
            if (ch.mute === true && ch.type === 'Tidal') {
                consoleStore.submitGHC(ch.name + ' $ silence');
            }
        }
    }
    @action toggleSolo(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.solo = !ch.solo;
            if (ch.solo) {
                this.soloEnabled = true;
                _.forEach(this.getActiveChannels, (other) => {
                    if (other.name !== ch.name) {
                        other.solo = false;

                        // actually stop audio on other channels
                        // TODO: SC
                        if (other.type === 'Tidal') {
                            consoleStore.submitGHC(other.name + ' $ silence');
                        }
                    }
                });
            } else this.soloEnabled = false;
        }
    }
    @action toggleLoop(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.loop = !ch.loop;
            ch.executed = false;
        }
    }
    @action toggleGate(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            ch.gate = !ch.gate;
        }
    }

    // Step Modifiers
    @action addStep(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            const temp = ch.time % ch.steps;
            ch.steps += 1;
            ch.time = temp;
            ch.cells.push('');
        }
    }
    @action removeStep(name) {
        let ch = _.find(this.channels, {
            'name': name,
            'scene': sceneStore.active_scene
        });
        if (ch !== undefined) {
            const temp = ch.time % ch.steps;
            ch.steps -= 1;
            ch.cells.pop();
            ch.time = temp;
        }
    }
}

export default new ChannelStore();