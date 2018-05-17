import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2'
import { inject, observer } from 'mobx-react';

import { save } from '../keyFunctions.js';

import 'codemirror/lib/codemirror.css';
import '../utils/lexers/haskell.js';
import '../utils/lexers/haskell.css';

@inject('consoleStore')
@observer
export default class ConsoleTidal extends React.Component {
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
    console.log("RENDER CONSOLETIDAL.JS");
     
    const options = {
      mode: '_rule_haskell',
      theme: '_style',
      fixedGutter: true,
      scroll: false,
      styleSelectedText: true,
      styleActiveLine: true,
      showToken: true,
      lineWrapping: true,
      lineNumbers: true,
      showCursorWhenSelecting: true
    };
    return (<div className={'ConsoleTextBox'}>
      <p>select -> ctrl+enter</p>
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
      </div>);
  }
}
