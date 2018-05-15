import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import '../assets/CodeMirrorRules.js';
import '../styles/_style.css'

// CSS Imports
import '../styles/_comp.css';
import '../styles/Layout.css';
import '../styles/App.css';
import '../styles/Home.css';

@inject('historyStore')
@observer
export default class PatternHistory extends React.Component {
    
  render() {
    console.log("RENDER PATTERN HISTORY");
    const options = {
          mode: '_rule',
          theme: '_style',
          fixedGutter: true,
          scroll: false,
          styleSelectedText:true,
          showToken:true,
          lineWrapping: true,
          showCursorWhenSelecting: true, 
          readOnly: true
    };
    return (<div className={'defaultPatternHistoryArea PanelAdjuster'}>
      {_.map(this.props.historyStore.latestPatterns, (c, i) => {
        return <CodeMirror key={i}
                           className={'draggableCancel'}
                           value={c[c.length-1].pattern}
                           options={options}
                           onChange={(editor, metadata, value) => {}}
                           />
      })}
     </div>
    );
  }
}
      

