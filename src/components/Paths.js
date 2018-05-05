import React from 'react';
import { inject, observer } from 'mobx-react';
// CSS Imports
import '../styles/_comp.css';
import '../styles/Layout.css';
import '../styles/App.css';
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
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>User Path:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.userpath} 
                                                          onChange={this.handlePathChange.bind(this,'userpath')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>GHCi Path:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.ghcipath} 
                                                          onChange={this.handlePathChange.bind(this , 'ghcipath')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>SClang:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.sclang} 
                                                          onChange={this.handlePathChange.bind(this, 'sclang')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>SCSynth:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.scsynth} 
                                                          onChange={this.handlePathChange.bind(this, 'scsynth')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>SClang Config:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.sclang_conf} 
                                                          onChange={this.handlePathChange.bind(this, 'sclang_conf')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>Tidal Boot:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.tidal_boot} 
                                                          onChange={this.handlePathChange.bind(this, 'tidal_boot')}/>
    </div>
    <div className={'PathsItem'}>
      <p className={'PathsLabel'}>SC Boot:</p>  <input className={'Input'} 
                                                          value={this.props.pathStore.paths.scd_start} 
                                                          onChange={this.handlePathChange.bind(this, 'scd_start')}/>
    </div>
    <div style={{display: 'inline-flex', justifyContent: 'space-around'}}>
      <button className={'Button'} style={{paddingBottom: "10px"}} onClick={() => (this.props.pathStore.save())}>Save</button>
    </div>
  </div>)
  }
}
      