import React from 'react';
import { inject, observer } from 'mobx-react';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';

@inject('pathStore')
@observer
export default class Paths extends React.Component {

handlePathChange = (params, {target: { value }}) => {
  this.props.pathStore.updateValue(params, value);
}
render() {
  console.log("RENDER PATHS.JS");
  
  return (<div className={'Paths PanelAdjuster draggableCancel'}>
    <div className={'PathItems'}>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'} title={"Absolute path for the user directory."}>
          User Directory:</p>  <input className={'Input'} 
                                      value={this.props.pathStore.paths.userpath} 
                                      onChange={this.handlePathChange.bind(this,'userpath')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'} title={"GHCi executable; usually under the 'bin' folder in default Haskell installation directory."}>
          GHCi:</p>  <input className={'Input'} 
                            value={this.props.pathStore.paths.ghcipath} 
                            onChange={this.handlePathChange.bind(this , 'ghcipath')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'}
          title={"Executable 'sclang'; usually in default SuperCollider installation directory."}>
          SCLang:</p>  <input className={'Input'} 
                              value={this.props.pathStore.paths.sclang} 
                              onChange={this.handlePathChange.bind(this, 'sclang')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'}
          title={"Executable 'scsynth'; usually in default SuperCollider installation directory."}>
          SCSynth:</p>  <input className={'Input'} 
                                value={this.props.pathStore.paths.scsynth} 
                                onChange={this.handlePathChange.bind(this, 'scsynth')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'} title={"SuperCollider config file; 'sclang_conf.yaml'."}>
          SCLang Config:</p>  <input className={'Input'} 
                                      value={this.props.pathStore.paths.sclang_conf} 
                                      onChange={this.handlePathChange.bind(this, 'sclang_conf')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'} title={"Absolute path of 'tidal-boot-default.hs' file in config folder."}>
          Tidal Boot:</p>  <input className={'Input'} 
                                          value={this.props.pathStore.paths.tidal_boot} 
                                          onChange={this.handlePathChange.bind(this, 'tidal_boot')}/>
      </div>
      <div className={'PathsItem'}>
        <p className={'PathsLabel'} title={"Absolute path of 'scd-start-default.scd' file in config folder."}>
          SC Boot:</p>  <input className={'Input'} 
                                        value={this.props.pathStore.paths.scd_start} 
                                        onChange={this.handlePathChange.bind(this, 'scd_start')}/>
      </div>
    </div>
    <div className={'PathsSave'}>
      <button className={'Button'} onClick={() => (this.props.pathStore.save())}>Save</button>
    </div>
  </div>)
  }
}
      