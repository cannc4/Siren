import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import '../utils/lexers/haskell.js';
import '../utils/lexers/haskell.css';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';

@inject('historyStore')
@observer
export default class PatternHistory extends React.Component {
    
  render() {
    console.log("RENDER PATTERN HISTORY");
    const options = {
          mode: '_rule_haskell',
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
                           className={'PatternHistoryItem draggableCancel'}
                           value={c[c.length-1].pattern}
                           options={options}
                           onChange={(editor, metadata, value) => {}}
                           />
      })}
     </div>
    );
  }
}
      

