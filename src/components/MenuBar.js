import React from 'react';
import { inject, observer } from 'mobx-react';
// import _ from 'lodash'

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/MenuBar.css';
import '../styles/Help.css';
import menubarStore from '../stores/menubarStore';

// import Popup from "reactjs-popup";

@inject('menubarStore', 'pulseStore', 'pathStore')
@observer
export default class MenuBar extends React.Component {

  render() {
    console.log("RENDER MENUBAR.JS");

    let serverStatusClass = 'ServerStatus';
    if (this.props.menubarStore.getActive <= 0) 
      serverStatusClass += ' inactive';
    else if (this.props.menubarStore.getActive === 1) 
      serverStatusClass += ' ready';
    else if (this.props.menubarStore.getActive === 2) 
      serverStatusClass += ' running';

    const startServer = () => {
      this.props.menubarStore.bootServer(this.props.pathStore.paths);
    }
    const stopServer = () => {
      this.props.menubarStore.stopServer()
    }

    return (<div className='MenuBar boxshadow'>
      <div className={'Logo'} id={'logo_disp'} title={"Refresh"}>
        {<img
          onClick={() => {if(window.confirm('Do you want to refresh page? Unsaved changes will be destroyed.')) {
            window.location.reload(false)}}}
          alt=""
          src={require('../assets/logo.svg')}
          height={30} width={30} />}
      </div>

      <div className={'TimerControls'}>
        
        {/* RMS SHAPE LEFT */}
        <canvas className={'RMSVis'} id={'RMSVis_Left'}
          width={menubarStore.rmsArray.length * 0.5 * 20} height={30}>
        </canvas>
        
        {<button className={'Button'} title={'Stop Pulse'}
            onClick={() => (this.props.pulseStore.stopPulseStop())}>◼</button>}
        {!this.props.pulseStore.isActive && 
          <button className={'Button'} title={'Start Pulse'}
              onClick={() => (this.props.pulseStore.startPulse())}>▶</button>}
        {this.props.pulseStore.isActive && 
          <button className={'Button'} title={'Pause Pulse'}
              onClick={() => (this.props.pulseStore.stopPulse())}>⏸</button>}
    
        <div style={{borderLeft: "1px solid var(--global-color)", height: "90%", marginLeft: "5px", marginRight: "10px"}}></div>

        {<button className={'Button ' + (this.props.menubarStore.isRecording ? 'Record' : '')}
          title={(this.props.menubarStore.isRecording ? 'Recording...' : 'Start recording')}
          onClick={() => {this.props.menubarStore.toggleRecording()}}>
          ⬤
        </button>}

        {/* RMS SHAPE RIGHT */}
        <canvas className={'RMSVis'} id={'RMSVis_Right'}
          width={menubarStore.rmsArray.length * 0.5 * 20} height={30}>
        
        </canvas>
      </div>

      {/* <div className={'OtherControls'}>
        
        {!this.props.menubarStore.isPlaying && <button className={'Button '}
          onClick={() => this.props.menubarStore.togglePlay()}>
          >
        </button>}
        {this.props.menubarStore.isPlaying && <button className={'Button '}
          onClick={() => this.props.menubarStore.togglePlay()}>
          ||
        </button>}
      </div> */}

      <div className= 'OtherControls'>
        <div className={serverStatusClass} title={"Server Status"} ></div>
        
        {this.props.menubarStore.getActive === 0 && 
          <button className={'Button draggableCancel ' } 
            onClick={startServer} title={"Initalize Server"}> Start </button>}  
        {this.props.menubarStore.getActive === 1 && 
          <button className={'Button draggableCancel disabledView' } 
            title={"Booting Server"}> Loading </button>}  
        {this.props.menubarStore.getActive === 2 && 
          <button className={'Button draggableCancel ' } 
            onClick={stopServer} title={"Terminate Server"}> Stop </button>}
  
        {/* <Popup trigger={<button className={'Button draggableCancel'} title={"Help"} > Help</button>} position={'bottom right'}>
          <div className={'helpContainer'}>
            TODO 
          </div>
        </Popup> */}
       
      </div>
    </div>)
  }
}