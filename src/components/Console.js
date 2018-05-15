import React from 'react';
import { inject, observer } from 'mobx-react';

import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import '../assets/CodeMirrorRules.js';
import '../styles/_style.css'
import { save } from '../keyFunctions.js';

@inject('consoleStore')
@observer
export default class Console extends React.Component {
  // SC
  handleSCSubmit = (editor, event) => {
    const body = event.target.value
    if(event.keyCode === 13 && event.ctrlKey && body){
        this.props.consoleStore.submitSC(body);
    }
  }
  // GHC
  handleGHCSubmit = (editor, event) => {
    const body = event.target.value;
    
    if(event.keyCode === 13 && event.ctrlKey && body){
        this.props.consoleStore.submitGHC(body); 
    }

    event.preventDefault();
    return false;
  }

  saveStuff = (editor, e) => { 
    if(e.ctrlKey && (e.which === 83)) {
      e.preventDefault();
      save();
      return false;
    }
  }

  render() {
    console.log("RENDER CONSOLE.JS");
     
    const options = {
      mode: '_rule',
      theme: '_style',
      fixedGutter: true,
      scroll: false,
      styleSelectedText: true,
      showToken: true,
      lineWrapping: true,
      lineNumbers: true,
      showCursorWhenSelecting: true
    };
    return (<div style={{height: '100%'}}>
      <div className={'ConsoleTextBox'}>
        <p>Tidal: (select --> ctrl+enter)</p>
        <CodeMirror className={"draggableCancel"}
                    value={this.props.consoleStore.tidal_text}
                    options={options}
                    onBeforeChange={(editor, metadata, value) => {
                      this.props.consoleStore.onChangeTidal(value);
                    }}
                    onChange={() => { }}
                    onKeyDown={this.saveStuff.bind(this)}
                    onKeyUp={this.handleGHCSubmit.bind(this)}
                    />
      </div>
      <div className={'ConsoleTextBox'} style={{paddingTop: 10}}>
        <p>SuperCollider: (select --> ctrl+enter)</p>
        <CodeMirror className={"ConsoleTextBox draggableCancel"}
                    value={this.props.consoleStore.sc_text}
                    options={options}
                    onBeforeChange={(editor, metadata, value) => {
                        this.props.consoleStore.onChangeSC(value);   
                    }}
                    onChange={() => {}}
                    onKeyUp={this.handleSCSubmit.bind(this)}
                    onKeyDown={this.saveStuff.bind(this)}
                    />
     </div>
   </div>
    );
  }
}
