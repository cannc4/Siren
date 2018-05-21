import _ from 'lodash'
import layoutStore from '../src/stores/layoutStore'
import sceneStore from '../src/stores/sceneStore'
import pulseStore from '../src/stores/pulseStore'
import consoleStore from '../src/stores/consoleStore'
import globalStore from '../src/stores/globalStore'
import pathStore from '../src/stores/pathStore'

const executionCss = (duration = 750) => {
    let logo = document.getElementById('logo_disp');
    logo.className += ' SaveExecuted';
    _.delay(() => {logo.className = _.replace(logo.className, ' SaveExecuted', '')}, duration);
}

export const save = () => {
    sceneStore.save(); 
    consoleStore.save();
    globalStore.save();
    pathStore.save();
    console.log(' ## Saving...')
    executionCss();
    return false;
}

export const saveLayout = () => { 
    layoutStore.save();
    executionCss();
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
export const fullscreenLayout = () => { 
    layoutStore.matrixFullscreen();
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
