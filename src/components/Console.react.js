import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store';
import _ from 'lodash';

import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import '../assets/_rule.js';
import './style/_style.css';

import {sendScPattern,
        consoleSubmit,
        consoleSubmitHistory,

        } from '../actions';

class Console extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scPattern: '',
      ghcPattern: ''
    }
  }

  // Console
  handleSCSubmit = (editor, event) => {
    const body=event.target.value
    const ctx=this;
    const {scPattern, tidalServerLink }=ctx.state;
    if(event.keyCode === 13 && event.ctrlKey && body){
      ctx.sendScPattern(tidalServerLink, scPattern);
    }
  }
  // GHC
  handleGHCSubmit = (editor, event) => {
    const body = event.target.value;
    const ctx = this;
    const { tidalServerLink } = ctx.props;
    const storedPatterns = ctx.props.globalparams.storedPatterns;
    const channels = ctx.props.channel;
    if(event.keyCode === 13 && event.ctrlKey && body){
      ctx.consoleSubmitHistory(tidalServerLink, body, storedPatterns, channels);
    }
    else if(event.keyCode === 13 && event.shiftKey && body){
      ctx.consoleSubmitHistory(tidalServerLink, body, storedPatterns, channels);
    }
  }

  consoleSubmit(tidalServerLink, value){
    store.dispatch(consoleSubmit(tidalServerLink, value));
  }
  consoleSubmitHistory(tidalServerLink, value, storedPatterns, channels){
    store.dispatch(consoleSubmitHistory(tidalServerLink, value, storedPatterns,channels));
  }

  sendScPattern(tidalServerLink, pattern) {
    store.dispatch(sendScPattern(tidalServerLink, pattern));
  }

  render() {
    const ctx = this;
    const { ghcPattern, scPattern } = ctx.state;

    const options = {
          mode: '_rule',
          theme: '_style',
          fixedGutter: true,
          scroll: false,
          styleSelectedText:true,
          showToken:true,
          lineWrapping: true,
          lineNumbers:true,
          showCursorWhenSelecting: true
    };
    return (<div>
      <div>
        <p>Tidal: (select --> ctrl+enter)</p>
        <CodeMirror className={"ConsoleTextBox draggableCancel"}
                    value={ghcPattern}
                    options={options}
                    onBeforeChange={(editor, metadata, value) => {
                      ctx.setState({ghcPattern: value});
                    }}
                    onChange={(editor, metadata, value) => {}}
                    onKeyUp={ctx.handleGHCSubmit.bind(ctx)}
                    />
      </div>
      <div style={{paddingTop: 10}}>
        <p>SuperCollider: (select --> ctrl+enter)</p>
        <CodeMirror className={"ConsoleTextBox draggableCancel"}
                    value={scPattern}
                    options={options}
                    onBeforeChange={(editor, metadata, value) => {
                      ctx.setState({scPattern: value});
                    }}
                    onChange={(editor, metadata, value) => {}}
                    onKeyUp={ctx.handleSCSubmit.bind(ctx)}
                    />
     </div>
   </div>
    );
  }
}

export default connect(state => state)(Console);
