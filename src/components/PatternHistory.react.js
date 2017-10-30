import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import '../assets/_rule.js';
import './style/_style.css';

class PatternHistory extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const ctx = this;
    const { patterns } = ctx.props;
    const options = {
          mode: '_rule',
          theme: '_style',
          fixedGutter: true,
          scroll: false,
          styleSelectedText:true,
          showToken:true,
          lineWrapping: true,
          showCursorWhenSelecting: true
    };
    return (<div>
      {_.map(patterns, (c, i) => {
        return <CodeMirror key={i}
                           className={'defaultPatternHistoryArea draggableCancel'}
                           value={c}
                           options={options}
                           onChange={(editor, metadata, value) => {
                             console.log('CodeMirror On Change', editor, metadata, value);
                           }}
                           />
      })}
     </div>
    );
  }
}

export default connect(state => state)(PatternHistory);
