import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbcreatepatterninscene, fbupdatepatterninscene, fbdeletepatterninscene } from '../actions';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import '../assets/_style.css'
import '../assets/_rule.js';

// Grid Layout
var ReactGridLayout = require('react-grid-layout');
var WidthProvider = ReactGridLayout.WidthProvider;
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

class Patterns extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      params: '',

      modelName: this.constructor.name,
      sceneKey: '',
      uid: ''
    }
  }
  //Pattern Dictionary
  addPattern() {
    var flag = false;
    const ctx = this
    _.each(Object.values(ctx.props["matrices"]), function(d){
      if(d.matName === ctx.props.active){
        const { name } = ctx.state
        ctx.setState({sceneKey: d.key});
        if (name.length >= 1) {
          fbcreatepatterninscene('Matrices', {name}, d.key)
        }
        else {
          alert("Pattern title should contain at least 1 character.");
        }
        flag = true;
      }
    })
    if(!flag) {
      const size = Object.keys(ctx.props["matrices"]).length;
      if(size > 0)
        alert("A scene needs to be active to add pattern.");
      else
        alert("You should add a scene first (Tip: on the left)");
    }
  }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ name: value });
  }

  renderItem(item, dbKey) {
    const ctx = this;
    const handleChange = (obj) => {
      var value, name;
      if(obj.target !== undefined){
        value = obj.target.value;
        name = obj.target.name;
      } else {
        value = obj;
      }
      var re = /`(\w+)`/g, match = re.exec(value), matches = [];
      while (match) {
        if(_.indexOf(matches, match[1]) === -1)
          matches.push(match[1]);
        match = re.exec(value);
      }
      _.remove(matches, function(n) {
        return n === 't';
      });
      ctx.setState({ params: matches.toString()});
      const payload = { key: dbKey };
      payload[name === undefined ? 'pattern' : name] = value;
      payload['params'] = this.state.params;

      _.each(Object.values(ctx.props["matrices"]), function(d){
        if(d.matName === ctx.props.active){
          ctx.setState({sceneKey: d.key});
            fbupdatepatterninscene('Matrices', payload, d.key)
        }
      })
    }
    // handle function to delete the object
    // gets the dbkey of to-be-deleted item and removes it from db
    const handleDelete = () => {
      const payload = { key: item.key };

      if(confirm("This pattern will be deleted from the scene '" + ctx.props.active + "'"))
        _.each(Object.values(ctx.props["matrices"]), function(d){
          if(d.matName === ctx.props.active){
            ctx.setState({sceneKey: d.key});
            fbdeletepatterninscene('Matrices', payload, d.key)
          }
        })
    }

    var options = {
        mode: '_rule',
        theme: '_style',
        fixedGutter: true,
        scroll: true,
        styleSelectedText:true,
        showToken:true,
        lineWrapping: true,
        showCursorWhenSelecting: true
    };
    // if Item is legit by key, it will be shown
    // parameters can be added
    return item.key && (
      <div key={item.key} className={"PatternItem draggableCancel"} data-grid={{i: item.key, x:0, y: item.index*2, w: Infinity, h: 4, minH: 3}} >
        <div key={name} >
          <div key={name} className={'PatternItemInputs'}>
            <div className={"PatternPanelHeader draggableCancel"}> ■ </div>
            <input className={'Input draggableCancelNested'} type="String" placeholder={"pattern title"} name={"name"} value={item["name"]} onChange={handleChange.bind(ctx)} />
            <input className={'Input draggableCancelNested'} type="String" placeholder={"parameters"} name={"params"} value={item["params"]} onChange={handleChange.bind(ctx)} />
            <button className={'Button draggableCancelNested'} onClick={handleDelete}>{'Delete'} </button>
          </div>
          <CodeMirror className={'PatternItemCodeMirror draggableCancelNested'} name={"pattern"} value={item["pattern"]} onChange={handleChange.bind(ctx)} options={options}/>
        </div>
      </div>
    )
  }

  renderItems(items) {
    const ctx = this;
    return _.map(items, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this;
    const { modelName, name } = ctx.state;
    var items = ctx.props[modelName.toLowerCase()];
    const scenes = Object.values(ctx.props["matrices"]);
    _.each(scenes, function(d){
      if(d.matName === ctx.props.active){
        const scenePatterns = d.patterns;
        if(scenePatterns !== undefined){
            items = d.patterns;
        }
      }
    })
    var iterator = 0;
    _.each(items, function(d){
      d.index = iterator++;
    })

    const changeName = ctx.changeName.bind(ctx);
    const renderItems = ctx.renderItems.bind(ctx);

    return (
      <div>
        <div className={'PatternItem PatternItemInputs'}>
          <input className={'Input draggableCancel'} type="text" placeholder={'New Pattern Name'} value={name} onChange={changeName}/>
          <button className={'Button draggableCancel'} onClick={ctx.addPattern.bind(ctx)}>Add</button>
        </div>

        <ResponsiveReactGridLayout
            className={"layout_patterns"}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 360}}
            cols={{lg: 24, md: 20, sm: 12, xs: 8}}
            rowHeight={30}
            margin={[2,10]}
            draggableCancel={'.draggableCancelNested'}
          >
          {renderItems(items)}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default connect(state => state)(Patterns);
