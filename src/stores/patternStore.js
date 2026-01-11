import { makeAutoObservable } from 'mobx';
import _ from 'lodash';
import sceneStore from './sceneStore';

class PatternStore {
    reserved_parameters = [
        { word: 't', value: 'time' },
        { word: 'rt', value: 'rate' },
        { word: 'st', value: 'steps' }
    ];

    patterns = [{ scene: 'default', name: 'def', params: '', text: 'sound "bd" # end `x`' }];

    constructor() {
        makeAutoObservable(this);
    }

    get activePatterns() {
        return this.patterns.filter(c => c.scene === sceneStore.active_scene);
    }

    loadPatterns(new_patterns) {
        this.patterns = new_patterns;
    }

    duplicatePatterns(old_scene, new_scene) {
        _.forEach(_.filter(this.patterns, ['scene', old_scene]), element => {
            let new_item = _.cloneDeep(element);
            new_item.scene = new_scene;
            this.patterns.push(new_item);
        });
    }

    changePatternName(name, new_name, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if (item !== undefined) item.name = new_name;
    }

    changePatternText(name, text, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if (item !== undefined) {
            let expr = /`([^`]+)`/g, match = expr.exec(text), matches = [];
            while (match) {
                const param_default = _.split(match[1], '?');
                if (_.indexOf(matches, param_default[0]) === -1) matches.push(param_default[0]);
                match = expr.exec(text);
            }
            _.each(this.reserved_parameters, (p) => { _.remove(matches, (n) => n === p.word); });
            item.text = text;
            item.params = matches.toString();
        }
    }

    addPattern(name, active_scene, text = '', params = '') {
        if (_.find(this.patterns, { 'name': name, 'scene': active_scene }) === undefined) {
            this.patterns.push({ scene: active_scene, name, params, text });
        } else {
            alert(name + ' already exists.');
        }
    }

    deletePattern(name, active_scene) {
        this.patterns = _.reject(this.patterns, { 'name': name, 'scene': active_scene });
    }

    deleteAllPatternsInScene(scene) {
        this.patterns = _.reject(this.patterns, { 'scene': scene });
    }
}

export default new PatternStore();
