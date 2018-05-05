<<<<<<< HEAD
import { observable, action,computed } from 'mobx';
import _ from 'lodash';

// nodejs connections
// import request from '../utils/request'
import sceneStore from './sceneStore'

class PatternStore 
{
    @observable patterns = [{
        scene: 'default',
        name: 'def',
        params: '',
        text: 'sound "bd" # end `x`'
    }];

    @action loadPatterns(new_patterns) {
        this.patterns = new_patterns;
    }
    @action duplicatePatterns(old_scene, new_scene) {
        _.forEach(_.filter(this.patterns, ['scene', old_scene]), element => {
            let new_item = _.cloneDeep(element);
                new_item.scene = new_scene
            this.patterns.push(new_item);
        });
    }

    @action changePatternName(name, new_name, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if(item !== undefined) {
            item.name = new_name;
        }
    }
    @action changePatternText(name, text, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if(item !== undefined) {
            // parse pattern for parameters
            let expr = /`([^`]+)`/g, 
                match = expr.exec(text), 
                matches = [];
            while (match) {
                const param_default = _.split(match[1], '?');
                if(_.indexOf(matches, param_default[0]) === -1){
                    matches.push(param_default[0]);
                }
                match = expr.exec(text);
            }
            _.remove(matches, function(n) { return n === 't';});

            item.text = text;
            item.params = matches.toString();
        }
    }
    @action addPattern(name, active_scene) {
        if(_.find(this.patterns, { 'name': name, 'scene': active_scene }) === undefined) {
            this.patterns.push({
                scene: active_scene,
                name: name,
                params: '',
                text: ''
            });
        }
        else {
            alert(name + ' already exists.');
        }
    }

    @action deletePattern(name, active_scene) {
        this.patterns = _.reject(this.patterns, { 'name': name, 'scene': active_scene });
    }
    @action deleteAllPatternsInScene(scene) {
        this.patterns = _.reject(this.patterns, { 'scene': scene });
    }

    @computed get activePatterns(){
        return this.patterns.filter(c => c.scene === sceneStore.active_scene);
    }
}

export default new PatternStore();
=======
import { observable, action,computed } from 'mobx';
import _ from 'lodash';

// nodejs connections
// import request from '../utils/request'
import sceneStore from './sceneStore'

class PatternStore 
{
    @observable patterns = [{
        scene: 'default',
        name: 'def',
        params: '',
        text: 'sound "bd" # end `x`'
    }];

    @action loadPatterns(new_patterns) {
        this.patterns = new_patterns;
    }
    @action duplicatePatterns(old_scene, new_scene) {
        _.forEach(_.filter(this.patterns, ['scene', old_scene]), element => {
            let new_item = _.cloneDeep(element);
                new_item.scene = new_scene
            this.patterns.push(new_item);
        });
    }

    @action changePatternName(name, new_name, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if(item !== undefined) {
            item.name = new_name;
        }
    }
    @action changePatternText(name, text, active_scene) {
        let item = _.find(this.patterns, { 'name': name, 'scene': active_scene });
        if(item !== undefined) {
            // parse pattern for parameters
            let expr = /`([^`]+)`/g, 
                match = expr.exec(text), 
                matches = [];
            while (match) {
                const param_default = _.split(match[1], '?');
                if(_.indexOf(matches, param_default[0]) === -1){
                    matches.push(param_default[0]);
                }
                match = expr.exec(text);
            }
            _.remove(matches, function(n) { return n === 't';});

            item.text = text;
            item.params = matches.toString();
        }
    }
    @action addPattern(name, active_scene) {
        if(_.find(this.patterns, { 'name': name, 'scene': active_scene }) === undefined) {
            this.patterns.push({
                scene: active_scene,
                name: name,
                params: '',
                text: ''
            });
        }
        else {
            alert(name + ' already exists.');
        }
    }

    @action deletePattern(name, active_scene) {
        this.patterns = _.reject(this.patterns, { 'name': name, 'scene': active_scene });
    }
    @action deleteAllPatternsInScene(scene) {
        this.patterns = _.reject(this.patterns, { 'scene': scene });
    }

    @computed get activePatterns(){
        return this.patterns.filter(c => c.scene === sceneStore.active_scene);
    }
}

export default new PatternStore();
>>>>>>> c2d69e2fbe3a4638434652e70bff28edf8c5d029
