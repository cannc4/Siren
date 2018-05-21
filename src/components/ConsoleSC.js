import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2'
import { inject, observer } from 'mobx-react';

import { save } from '../keyFunctions.js';

import 'codemirror/lib/codemirror.css';
import '../utils/lexers/sc.js';
import '../utils/lexers/sc.css';

@inject('consoleStore')
@observer
export default class ConsoleSC extends React.Component {
  // SC
  handleSCSubmit = (editor, event) => {
    const body = event.target.value
    if(event.keyCode === 13 && event.ctrlKey && body){
        this.props.consoleStore.submitSC(body);
    }
  }

  saveStuff = (editor, e) => { 
    if(e.ctrlKey && (e.which === 83)) {
      e.preventDefault();
      save();
      return false;
    }
  }

  render() {
    console.log("RENDER CONSOLESC.JS");
     
    const options = {
      mode: 'smalltalk',
      theme: '_style_sc',
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
        <p>select --> ctrl+enter</p>
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
     </div>);
  }
}
