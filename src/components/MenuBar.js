import React from 'react';
import { inject, observer } from 'mobx-react';
// import _ from 'lodash'

// CSS Imports
import '../styles/_comp.css';
import '../styles/Layout.css';
import '../styles/App.css';
import '../styles/MenuBar.css';
import '../styles/Help.css';
import Popup from "reactjs-popup";

@inject('menubarStore', 'pulseStore', 'pathStore')
@observer
export default class MenuBar extends React.Component {

  render() {
    console.log("RENDER MENUBAR.JS");

    let serverStatusClass = 'ServerStatus';
    if (this.props.menubarStore.getActive === 0) 
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
      <div style={{display: 'flex', displayDirection: 'row'}}>
        <div className={'Logo'} id={'logo_disp'}>
          {<img alt="" src={require('../assets/logo.svg')}  height={35} width={35}/> }
        </div>
      </div>

      <div className= 'enabledView'  style={{display: 'flex', flexDirection: 'row', height: 45}}>
        <p className={'RMSVis'}>
          {this.props.menubarStore.createRMSShape(0).split("").reverse().join("")}
        </p>
        <div className={"TimerControls"}>  
          {!this.props.pulseStore.isActive && 
            <img src={require('../assets/play@3x.png')} title={'Start Pulse'}
                onClick={() => (this.props.pulseStore.startPulse())} alt="" height={45} width={45}/>}
          {this.props.pulseStore.isActive && 
            <img src={require('../assets/pause@3x.png')} title={'Pause Pulse'}
                onClick={() => (this.props.pulseStore.stopPulse())} alt="" height={45} width={45}/>}
        </div>
        <div className={"TimerControls"}>
          <img src={require('../assets/stop@3x.png')} title={'Stop Pulse'}
              onClick={() => (this.props.pulseStore.stopPulseStop())} alt="" height={45} width={45}/>
        </div>
        <p className={'RMSVis'}>
          {this.props.menubarStore.createRMSShape(1)}
        </p>
      </div>

      <div className= 'OtherControls'>
        <div className={serverStatusClass} title={"Server Status"} ></div>

        {this.props.menubarStore.getActive === 0 && 
          <button className={'Button draggableCancel ' } 
            onClick={startServer} title={"Initalize Server"}> Start Server</button>}  
        {this.props.menubarStore.getActive === 1 && 
          <button className={'Button draggableCancel disabledView' } 
            onClick={startServer} title={"Booting Server"}> Loading </button>}  
        {this.props.menubarStore.getActive === 2 && 
          <button className={'Button draggableCancel ' } 
            onClick={stopServer} title={"Terminate Server"} >Stop Server</button>}
       
        
        <button className={"OtherControls Button"} title={"Refresh Page"} 
          onClick={() => {if(window.confirm('Do you want to refresh page? Unsaved changes will be destroyed.')) {
            window.location.reload(false)}}}>Refresh</button>

        <Popup trigger={<button className={'Button draggableCancel'} title={"Help"} > Help</button>} position={'bottom right'}>
          <div className={'helpContainer'}>
            TODO 
          </div>
        </Popup>
       
      </div>
    </div>)
  }
}