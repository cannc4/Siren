import React, { Component } from 'react';
import { connect } from 'react-redux';
// import _ from 'lodash';

import { fbsaveconfig } from '../actions'

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userpath: props.user.user.config.userpath,
      ghcipath: props.user.user.config.ghcipath,
      sclang: props.user.user.config.sclang,
      scsynth: props.user.user.config.scsynth,
      sclang_conf: props.user.user.config.sclang_conf,
      port: props.user.user.config.port,
      samples_path: props.user.user.config.samples_path,
      path: props.user.user.config.path,
      tidal_boot: props.user.user.config.tidal_boot,
      tidal_sync: props.user.user.config.tidal_sync,
      scd_start: props.user.user.config.scd_start
    }
  }

  writeConfigLocal() {
    const ctx = this;

    // local save
    function download(text, name, type) {
      var a = document.createElement("a");
      var file = new Blob([text], {type: type});
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }
    download(JSON.stringify(ctx.state), 'config.json', 'text/plain');
  }

  writeConfigDB() {
    const ctx = this;

    // online database save
    if(ctx.props.uid !== undefined)
      fbsaveconfig('Accounts', ctx.props.uid, ctx.state);
  }

  updateValue(params, {target: { value }}) {
    const ctx = this;
    ctx.setState({ [params]: value });
  }

  render() {
    const ctx = this;
    return (<div className={'Settings PanelAdjuster draggableCancel'}>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>User Path:</p>  <input className={'Input'} value={this.state.userpath} onChange={ctx.updateValue.bind(ctx, 'userpath')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>GHCi Path:</p>  <input className={'Input'} value={this.state.ghcipath} onChange={ctx.updateValue.bind(ctx, 'ghcipath')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>SClang:</p>  <input className={'Input'} value={this.state.sclang} onChange={ctx.updateValue.bind(ctx, 'sclang')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>SCSynth:</p>  <input className={'Input'} value={this.state.scsynth} onChange={ctx.updateValue.bind(ctx, 'scsynth')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>SClang Config:</p>  <input className={'Input'} value={this.state.sclang_conf} onChange={ctx.updateValue.bind(ctx, 'sclang_conf')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>Port:</p>  <input className={'Input'} value={this.state.port} onChange={ctx.updateValue.bind(ctx, 'port')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>Sample Path:</p>  <input className={'Input'} value={this.state.samples_path} onChange={ctx.updateValue.bind(ctx, 'samples_path')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>Config Path:</p>  <input className={'Input'} value={this.state.path} onChange={ctx.updateValue.bind(ctx, 'path')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>Tidal Boot:</p>  <input className={'Input'} value={this.state.tidal_boot} onChange={ctx.updateValue.bind(ctx, 'tidal_boot')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>Tidal Sync:</p>  <input className={'Input'} value={this.state.tidal_sync} onChange={ctx.updateValue.bind(ctx, 'tidal_sync')}/>
      </div>
      <div className={'SettingsItem'}>
        <p className={'SettingsLabel'}>scd Start:</p>  <input className={'Input'} value={this.state.scd_start} onChange={ctx.updateValue.bind(ctx, 'scd_start')}/>
      </div>
      <div style={{display: 'inline-flex', justifyContent: 'space-around'}}>
        <button className={'Button'} style={{paddingBottom: "10px"}} onClick={ctx.writeConfigLocal.bind(ctx)}>Save Locally</button>
        <button className={'Button'} style={{paddingBottom: "10px"}} onClick={ctx.writeConfigDB.bind(ctx)}>Save Database</button>
      </div>
    </div>)
  }
}

export default connect(state => state)(Settings);
