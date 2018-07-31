import _ from 'lodash'
import layoutStore from './stores/layoutStore'
import sceneStore from './stores/sceneStore'
import pulseStore from './stores/pulseStore'
import consoleStore from './stores/consoleStore'
import globalStore from './stores/globalStore'
import pathStore from './stores/pathStore'
import rollStore from './stores/rollStore';

export const executionCssById = (elem_id, classname = ' SaveExecuted', duration = 750) => {
    let elem = document.getElementById(elem_id);
    if (elem !== undefined || elem !== null) { 
        elem.className += classname;
        _.delay(() => {elem.className = _.replace(elem.className, classname, '')}, duration);
    }
}

export const executionCssByEvent = (event, duration = 500) => {
    event.persist();
    event.target.className += ' Executed';
    _.delay(() => { event.target.className = _.replace(event.target.className, ' Executed', '') },
            duration);
}

export const save = () => {
    sceneStore.save(); 
    consoleStore.save();
    globalStore.save();
    pathStore.save();
    console.log(' ## Saving...')
    executionCssById('logo_disp', ' SaveExecuted');
    return false;
}

export const saveLayout = () => { 
    layoutStore.save();
    executionCssById('logo_disp', ' SaveExecuted');
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
    // layoutStore.fullscreen('graphics');
    layoutStore.graphicsFullscreen();
    rollStore.reloadRoll();
}
export const fullscreen_matrix = () => { 
    layoutStore.matFullscreen();
    // layoutStore.fullscreen('tracker');
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
