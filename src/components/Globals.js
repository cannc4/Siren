import React from 'react';
import { inject, observer } from 'mobx-react';
import {Controlled as CodeMirror} from 'react-codemirror2'

// CSS Imports
import _ from 'lodash';
import '../styles/App.css';
import '../styles/Home.css';
import '../styles/Layout.css';
import { save,executionCssByEvent } from '../keyFunctions';
import 'codemirror/lib/codemirror.css';
import '../utils/lexers/haskell.js';
import '../utils/lexers/haskell.css';

import 'codemirror/addon/edit/matchbrackets.js';

@inject('globalStore')
@observer
export default class Globals extends React.Component {

renderItem(item, i) {
  let options = {
      mode: '_rule_haskell',
      theme: '_style',
      fixedGutter: true,
      scroll: true,
      styleSelectedText:true,
      showToken:true,
      lineWrapping: true,
      showCursorWhenSelecting: true,
      // add-on
      matchBrackets: true,
      maxScanLines: 10
  };

return (
  <div key={'g'+i} className={"Globals draggableCancel"}>
      <div className = {'GlobalsHeader'}>
              <input type="String"
                  className={'GText'} 
                  placeholder={"Name"}
                  value={item.name}
                  onChange={(event) => {
                      this.props.globalStore.changeGlobalName(
                          item.name,
                          event.target.value,
                          document.getElementById('add_global_input').value)
                  }}
                  />
                   <button className={'Button draggableCancelNested'} 
                      onClick={() => {
                          this.props.globalStore.compileGlobal(
                              item.name
                          )
                      }}>{'Compile'} </button>

                  <button className={'Button draggableCancelNested'} 
                      onClick={() => {
                          this.props.globalStore.deleteGlobal(
                              item.name
                          )
                      }}>{'Delete'} </button>  
                </div>
                  <input type="String" id= {'add_global_channels'}
                  onKeyUp={(event) => {
                    if(event.ctrlKey && event.keyCode === 13){
                        executionCssByEvent(event);
                        this.props.globalStore.compileGlobal(
                            item.name);
                        }
                    }}
                  placeholder={"Channels"}
                  value={item.channels}
                  className = {"GText"}
                  onChange={(event) => {
                      this.props.globalStore.updateChannels(
                          item.name,
                          event.target.value)
                  }}
                  />
                  
                  <input type="String" id= {'add_global_transformer'}
                   onKeyUp={(event) => {
                    if(event.ctrlKey && event.keyCode === 13){
                        executionCssByEvent(event);
                        this.props.globalStore.compileGlobal(
                            item.name);
                        }
                    }}
                  placeholder={"Transformer"}
                  value={item.transformer}
                  className = {"GText"}
                  onChange={(event) => {
                      this.props.globalStore.updateTransformer(
                          item.name,
                          event.target.value)
                  }}
                  />
                  
                  <input type="String" id= {'add_global_modifier'}
                   onKeyUp={(event) => {
                    if(event.ctrlKey && event.keyCode === 13){
                        executionCssByEvent(event);
                        this.props.globalStore.compileGlobal(
                            item.name);
                        }
                    }}
                  placeholder={"Modifier"}
                  value={item.modifier}
                  className = {"GText"}
                  onChange={(event) => {
                      
                      this.props.globalStore.updateModifier(
                          item.name,
                          event.target.value)
                  }}
                  />
                  
  </div>)
}


  handleControlEnter = (event) => {
    if(event.ctrlKey && event.keyCode === 13){
        executionCssByEvent(event);
        this.props.globalStore.addGlobal(
            document.getElementById('add_global_input').value)
    }
  }

  handleControlEnterCompile = (event) => {
    if(event.ctrlKey && event.keyCode === 13){
        executionCssByEvent(event);
        console.log(event);
        console.log('here');
    }
  }

  render() {
    console.log("RENDER GLOBALS.JS");
    let ctx = this;
    
  return (<div >
             <div className={'PatternItem PatternItemInputs'}>
              <input type="text" id={'add_global_input'}
                  className={'Input draggableCancel'}
                  placeholder={'New Global Name'}
                  onKeyUp={this.handleControlEnter.bind(this)}
              />
          <button className={'Button draggableCancel'} 
                  onClick={() => (this.props.globalStore.addGlobal(
                      document.getElementById('add_global_input').value)
                  )}>Add
          </button>
          </div> 
          {_.map(this.props.globalStore.getGlobals, 
                 this.renderItem.bind(this))}
        </div>)
  }
}      
