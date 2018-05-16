import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';

// Component imports
import Grid from './Channel';
import Scene from './Scene';
import Paths from './Paths';
import Canvas from './Canvas';
import ConsoleSC from './ConsoleSC';
import ConsoleTidal from './ConsoleTidal';
import Pattern from './Pattern';
import Globals from './Globals';
import Graphics from './Graphics';
import DebugConsole from './DebugConsole'
import PatternHistory from './PatternHistory';

// CSS Imports
import '../styles/App.css';
import '../styles/Layout.css';
import '../styles/Home.css';
import '../styles/ContextMenu.css';

import { SubMenu, ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {
  save, timer,
  loadCustomLayout_0, loadCustomLayout_1, loadCustomLayout_2, loadCustomLayout_3,
  resetLayout, fullscreenLayout
} from '../keyFunctions'

// Grid Layout Initialization
let ReactGridLayout = require('react-grid-layout');
let WidthProvider = ReactGridLayout.WidthProvider;
WidthProvider.measureBeforeMount = true;
let ResponsiveReactGridLayout = WidthProvider(ReactGridLayout.Responsive);

let keymaster = require('keymaster');

@inject('layoutStore', 'sceneStore', 'channelStore')
@observer
export default class Home extends React.Component {  
  componentDidMount() {
    keymaster('⌘+s, ctrl+s', save); 
    keymaster('ctrl+enter', timer);

    keymaster('shift+r', resetLayout);
    keymaster('shift+f', fullscreenLayout);
    keymaster('shift+1', loadCustomLayout_0);
    keymaster('shift+2', loadCustomLayout_1);
    keymaster('shift+3', loadCustomLayout_2);
    keymaster('shift+4', loadCustomLayout_3);
  }
  componentWillUnmount() {
    keymaster.unbind('ctrl+s', save);
    keymaster.unbind('ctrl+enter', timer); 

    keymaster.unbind('shift+r', resetLayout);
    keymaster.unbind('shift+f', fullscreenLayout);
    keymaster.unbind('shift+1', loadCustomLayout_0);
    keymaster.unbind('shift+2', loadCustomLayout_1);
    keymaster.unbind('shift+3', loadCustomLayout_2);
    keymaster.unbind('shift+4', loadCustomLayout_3);
  }

  handleChangeLayout = (layout, layouts) => {
    this.props.layoutStore.onLayoutChange(layout, layouts);
  };
 
  renderLayouts(layoutItem) {
    console.log("RENDER LAYOUTS @ HOME.JS");

    let { layoutStore } = this.props;

    /// ----- GLOBAL LAYOUTS ------
    if (layoutItem.i === 'tracker') {
      return layoutItem.isVisible && (<div key={layoutItem.i} >
        <div className={"PanelHeader"}> ● "{this.props.sceneStore.activeScene}"
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'PanelAdjuster'}>
          <Grid className={"draggableCancel"}/>
        </div>
      </div>);
    }
    else if (layoutItem.i === 'scenes') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
          <div className={"PanelHeader"}> ● Scenes
            <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
          </div>
          <Scene />
      </div>);
    }
    else if (layoutItem.i === 'patterns') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
        <div className={"PanelHeader"}> ● Patterns 
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'AllPatterns PanelAdjuster'}>
          <Pattern/> 
        </div>
      </div>);
    }
    else if (layoutItem.i === 'paths') {
      return layoutItem.isVisible && (<div key={layoutItem.i} >
        <div className={"PanelHeader"}> ● Config Paths
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <Paths/>
      </div>);
    }
    else if (layoutItem.i === 'graphics') {
      return layoutItem.isVisible && (<div key={layoutItem.i} id={'graphicsLayout'} >
        <div className={"PanelHeader"}> ● Graphics
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'Graphics PanelAdjuster'}>
          <Graphics />
        </div>
      </div>);
    }  
      
    /// ----- TIDAL LAYOUTS ------  
    else if (layoutItem.i === 'globals') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
        <div className={"PanelHeader Tidal"}> ● Tidal Global Controls
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'PanelAdjuster'}>
          <Globals/>
        </div>
      </div>);
    }
    else if (layoutItem.i === 'pattern_history') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
        <div className={"PanelHeader Tidal"}> ● Pattern History
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <PatternHistory />
      </div>);
    }  
    else if (layoutItem.i === 'tidal_console') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
        <div className={"PanelHeader Tidal"}> ● Tidal Console
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'Console PanelAdjuster'}>
          <ConsoleTidal />
        </div>
      </div>);
    }
    else if (layoutItem.i === 'debug_console') {
      return layoutItem.isVisible && (<div key={layoutItem.i} >
        <div className={"PanelHeader Tidal"}> ● Tidal Logs
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <DebugConsole/>
      </div>);
    }  
    else if (layoutItem.i === 'canvas') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  id={'canvasLayout'} >
        <div className={"PanelHeader Tidal"}> ● Pattern Roll
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'Canvas'}>
          <Canvas/>
        </div>
      </div>);
    }  
    /// ----- SUPERCOLLIDER LAYOUTS ------  
    else if (layoutItem.i === 'sc_console') {
      return layoutItem.isVisible && (<div key={layoutItem.i}  >
        <div className={"PanelHeader SuperCollider"}> ● SuperCollider Console
          <span className={"PanelClose draggableCancel"} onClick={() => layoutStore.hideLayout(layoutItem.i)}>✖</span>
        </div>
        <div className={'Console PanelAdjuster'}>
          <ConsoleSC />
        </div>
      </div>);
    }  
    else {
      return layoutItem.isVisible && (<div key={"unknown_layout"} >
        unknown_layout
        </div>)
    }
  }
  handleRightClick = (param, event) => {
    if (param.type === 'channelAddTidal') this.props.channelStore.addChannel('', 'Tidal', 8, '');
    else if (param.type === 'channelAddSC') this.props.channelStore.addChannel('s', 'SuperCollider', 8, '');  
    else if (param.type === 'channelAddCPS') this.props.channelStore.addChannel('cps', 'CPS', 8, '');  
    else if (param.type === 'modulesRemove') this.props.layoutStore.hideLayout(param.val);
    else if (param.type === 'modulesAdd') this.props.layoutStore.showLayout(param.val);
    else if (param.type === 'layoutSave') this.props.layoutStore.save();
    else if (param.type === 'layoutReset') this.props.layoutStore.reset();
    else if (param.type === 'matrixFull') this.props.layoutStore.matrixFullscreen();
    else if (param.type === 'layoutSaveCustom') this.props.layoutStore.saveCustom(param.val);
    else if (param.type === 'layoutLoadCustom') { 
      if (event.altKey) this.props.layoutStore.deleteCustom(param.val);
      else              this.props.layoutStore.loadCustom(param.val);
    }
  };

  render() {
    const ctx = this;
    console.log("RENDER HOME.JS");

    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 58, // Total Height
        n = 20,               // Number of rows
        m = 3,                // Margin
        h_ = (h-(n+1)*m)/n;   // Item height
    
    return (
      <div>
        <ContextMenuTrigger id="global_context" holdToDisplay={-1}>
          <div className={'Home cont'}>
            <ResponsiveReactGridLayout
              className={"layout"}
              layouts={{lg: this.props.layoutStore.visibleLayouts }}
              breakpoints={{lg: 1200, md: 1000, sm: 600, xs: 400}}
              cols={{lg: 24, md: 20, sm: 12, xs: 8}}
              margin={[m, m]}
              rowHeight={h_}
              draggableCancel={'.draggableCancel'}
              onLayoutChange={this.handleChangeLayout.bind(this)}
              useCSSTransforms={true}
            >
            {this.props.layoutStore.visibleLayouts.map(this.renderLayouts.bind(this))}
            </ResponsiveReactGridLayout> 
          </div>          
        </ContextMenuTrigger>
      
        <ContextMenu id="global_context" className={"draggableCancel"}>
          <MenuItem data={{ value: 1 }} onClick={ctx.handleRightClick.bind(ctx, { type: 'channelAddTidal', val: true })}>Add Tidal Channel</MenuItem>
          <MenuItem data={{ value: 1 }} onClick={ctx.handleRightClick.bind(ctx, { type: 'channelAddCPS', val: true })}>Add CPS Channel</MenuItem>
          <MenuItem data={{ value: 1 }} onClick={ctx.handleRightClick.bind(ctx, { type: 'channelAddSC', val: true })}>Add SuperCollider Channel</MenuItem>
          <MenuItem divider />
          <MenuItem onClick={save} data={{ item: 'reset' }}>Save Scene</MenuItem>
          <MenuItem onClick={ctx.handleRightClick.bind(ctx,{type:'layoutSave'})} data={{ item: 'reset' }}>Save Layout</MenuItem>
          <MenuItem divider />
          <SubMenu title={'Modules'} onClick={(event) => { event.preventDefault();}}>
            {_.map(ctx.props.layoutStore.allLayouts, (layoutItem, key) => {
              if(_.find(ctx.props.layoutStore.allLayouts, { 'i': layoutItem.i, 'isVisible': true }) )
                return <MenuItem key={key} onClick={ctx.handleRightClick.bind(ctx,{type:'modulesRemove', val:layoutItem.i})} data={{ item: layoutItem.i }}>{_.startCase(layoutItem.i)}<span style={{float: 'right'}}>⏺</span></MenuItem>;
              else
                return <MenuItem key={key} onClick={ctx.handleRightClick.bind(ctx,{type:'modulesAdd', val:layoutItem.i})} data={{ item: layoutItem.i }}>{_.startCase(layoutItem.i)}</MenuItem>;
            })}
          </SubMenu>
          <SubMenu title={'Layouts'} onClick={(event) => { event.preventDefault();}}>
            <MenuItem onClick={ctx.handleRightClick.bind(ctx,{type:'layoutReset'})} data={{ item: 'reset' }}>Reset Layout<span style={{float: 'right'}}>⇧ + R</span></MenuItem>
            <MenuItem onClick={ctx.handleRightClick.bind(ctx,{type:'matrixFull'})} data={{ item: 'reset' }}>Max. Grid<span style={{float: 'right'}}>⇧ + F</span></MenuItem>
            <MenuItem divider />
            <MenuItem disabled> Alt-Click to remove </MenuItem>
            {_.map({a:0, b:1, c:2, d:3}, (i, key) => {
              if(!ctx.props.layoutStore.isSlotEmpty(i))
                return <MenuItem key={key}
                  onClick={ctx.handleRightClick.bind(ctx, { type: 'layoutLoadCustom', val: i })}
                  data={{ item: 'c_' + i }}>Cust. {i}<span style={{ float: 'right' }}>⇧ + {i}</span>
                </MenuItem>
              else
                return <MenuItem key={key}
                  onClick={ctx.handleRightClick.bind(ctx, { type: 'layoutSaveCustom', val: i })}
                  data={{ item: 'c_' + i }}>click to save here
                </MenuItem>
            })}
          </SubMenu>
        </ContextMenu>     
      
      </div>
      
    );
  }
}