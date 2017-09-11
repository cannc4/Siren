import React, { Component } from 'react';
import { connect } from 'react-redux';
// import store from '../store';

import { fbsaveconfig } from '../actions'

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userpath: "C:\\Users\\Mert",
      debug: true,
      ghcipath: "C:\\Program Files\\Haskell Platform\\8.0.1\\bin\\ghci.exe",
      sclang: "C:\\Program Files\\SuperCollider-3.8.0\\sclang.exe",
      scsynth: "C:\\Program Files\\SuperCollider-3.8.0\\scsynth.exe",
      sclang_conf: "C:\\Users\\Mert\\AppData\\Local\\SuperCollider\\sclang_conf.yaml",
      port: 3001,
      samples_path: "C:\\Users\\Mert\\Dropbox\\Whalehouse\\99s\\*",
      path: "C:\\GitHub\\Siren\\config\\config.json",
      tidal_boot: "C:\\GitHub\\Siren\\config\\tidal-boot-default.hs",
      tidal_sync: "C:\\GitHub\\Siren\\sync\\sync.hs",
      scd_start: "C:\\GitHub\\Siren\\config\\scd-start-default.scd"
    }
  }

  writeConfigDB() {
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
      <button className={'Button'} style={{paddingBottom: "10px"}} onClick={ctx.writeConfigDB.bind(ctx)}>SAVE ONLINE AND LOCAL</button>
    </div>)
  }
}

export default connect(state => state)(Settings);
