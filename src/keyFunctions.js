import _ from 'lodash'
import layoutStore from '../src/stores/layoutStore'
import sceneStore from '../src/stores/sceneStore'
import pulseStore from '../src/stores/pulseStore'
import consoleStore from '../src/stores/consoleStore'
import globalStore from '../src/stores/globalStore'
import pathStore from '../src/stores/pathStore'
import rollStore from './stores/rollStore';

export const executionCssById = (elem_id, classname = ' SaveExecuted', duration = 750) => {
    let elem = document.getElementById('logo_disp');
    if (elem !== undefined || elem !== null) { 
        elem.className += classname;
        _.delay(() => {elem.className = _.replace(elem.className, classname, '')}, duration);
    }
}

export const executionCssByEvent = (event, duration = 500) => {
    event.persist();
    event.target.className += ' Executed';
    _.delay( () => (event.target.className = _.replace(event.target.className, ' Executed', '') ),
            duration);
}

export const save = () => {
    sceneStore.save(); 
    consoleStore.save();
    globalStore.save();
    pathStore.save();
    console.log(' ## Saving...')
    executionCssById('logo_disp');
    return false;
}

export const saveLayout = () => { 
    layoutStore.save();
    executionCssById('logo_disp');
    return false;
}

export const timer = () => {
    if (pulseStore.isActive) 
        pulseStore.stopPulse();
    else
        pulseStore.startPulse();
}

export const resetLayout = () => { 
    layoutStore.reset();
}
export const fullscreen_graphics = () => { 
    layoutStore.fullscreen('graphics');
    rollStore.reloadRoll();
}
export const fullscreen_matrix = () => { 
    layoutStore.fullscreen('tracker');
}
export const loadCustomLayout_0 = () => { 
    layoutStore.loadCustom(0);
}
export const loadCustomLayout_1 = () => { 
    layoutStore.loadCustom(1);
}
export const loadCustomLayout_2 = () => { 
    layoutStore.loadCustom(2);
}
export const loadCustomLayout_3 = () => { 
    layoutStore.loadCustom(3);
}
