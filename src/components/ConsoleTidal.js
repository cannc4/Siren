import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2'
import _ from 'lodash'
import { inject, observer } from 'mobx-react';

import { save } from '../keyFunctions.js';

import 'codemirror/lib/codemirror.css';
import '../utils/lexers/haskell.js';
import '../utils/lexers/haskell.css';

// codemirror addons
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';

@inject('consoleStore')
@observer
export default class ConsoleTidal extends React.Component {

  // GHC
  handleGHCSubmit = (editor, event) => {
    if (event.keyCode === 13 && (event.ctrlKey || event.metaKey)) {
      let expr = "";
      
      if (editor.somethingSelected()) {
        // selected text
        expr = event.target.value;
      }
      else {
        const line = editor.getCursor().line;
  
        if (editor.getLine(line) !== "") {
          let startLine = line;
          let endLine = line;
    
          // determine line numbers of the code block
          while (_.trim(editor.getLine(startLine)) !== '') { startLine -= 1; }
          while (_.trim(editor.getLine(endLine)) !== '') { endLine += 1; }
    
          // the text
          expr = editor.getRange({ line: startLine, ch: 0 }, { line: endLine, ch: 0 });

          // coloring the background
          let handle = editor.markText(
            { line: startLine, ch: 0 },
            { line: endLine, ch: 0 },
            { className: 'CodeMirror-execution' });
          _.delay(() => { handle.clear(); }, 500);
        }
      }

      // execute the line
      if (expr !== "")
        this.props.consoleStore.submitGHC(expr);
    }

    event.preventDefault();
    return false;
  }

  saveConsole = (editor, e) => { 
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
      showToken: true,
      lineWrapping: true,
      lineNumbers: true,
      showCursorWhenSelecting: true,
      // addon options
      styleActiveLine: true,
      matchBrackets: true,
      maxScanLines: 10
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
                  onKeyDown={this.saveConsole.bind(this)}
                  onKeyUp={this.handleGHCSubmit.bind(this)}
                  />
      </div>);
  }
}
