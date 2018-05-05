import _ from 'lodash'
import sceneStore from '../src/stores/sceneStore'
import pulseStore from '../src/stores/pulseStore'
import consoleStore from '../src/stores/consoleStore'
import globalStore from '../src/stores/globalStore'


const executionCss = (duration = 750) => {
    let logo = document.getElementById('logo_disp');
    logo.className += ' Executed';
    _.delay(() => {logo.className = _.replace(logo.className, ' Executed', '')}, duration);
}

export const save = () => {
    sceneStore.save(); 
    consoleStore.save();
    globalStore.save();
    console.log(' ## Saving...')
    executionCss();
    return false;
}

export const tidalCps = () => {
    pulseStore.submitGHC(); 
    return false;
}
export const timer = () => {
    if (pulseStore.isActive) 
        pulseStore.stopPulse();
    else
        pulseStore.startPulse();
}


