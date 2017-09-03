import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbcreatepatterninscene, fbupdatepatterninscene, fbdeletepatterninscene } from '../actions';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
var CodeMirrorStyle = require('../assets/_style.css');
import '../assets/_rule.js';

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
      var re = /`(\w+)`/g, match, matches = [];
      while (match = re.exec(value)) {
        if(_.indexOf(matches, match[1]) === -1)
          matches.push(match[1]);
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

      if(confirm("This pattern will be deleted from " + ctx.props.active + "scene "))
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

    function getStyleSheet(unique_title) {
      for(var i=0; i<document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if(sheet.title == unique_title) {
          return sheet;
        }
      }
    }
    //
    // var sheet = getStyleSheet('_style');
    // console.log(sheet);
    // sheet.insertRule(".cm-s-_style.CodeMirror { background: #f5f5f5; color: #202020; height: "+100+"px; }", 0);

    // if Item is legit by key, it will be shown
    // parameters can be added
    return item.key && (
      <div key={item.key} className="PatternItem draggableCancel" >
        <div key={name} >
          <div key={name} >
            <div key={name} >
              <input className={'Input draggableCancel'} type="String" placeholder={"pattern title"} name={"name"} value={item["name"]} onChange={handleChange.bind(ctx)} />
              <input className={'Input draggableCancel'} type="String" placeholder={"params (auto-generated)"} name={"params"} value={item["params"]} onChange={handleChange.bind(ctx)} />
            </div>
            <div>
              <button className={'Button'} onClick={handleDelete}>{'Delete'} </button>
            </div>
          </div>
          <CodeMirror className={'PatternItemCodeMirror'} name={"pattern"} value={item["pattern"]} onChange={handleChange.bind(ctx)} options={options}/>
        </div>
      </div>
    )
  }

  renderItems(items) {
    const ctx = this;
    return _.map(items, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this
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

    const changeName = ctx.changeName.bind(ctx);
    const renderItems = ctx.renderItems.bind(ctx);

    return (
      <div>
        <div>
          <input className={'Input draggableCancel'} type="text" placeholder={'New Pattern Name'} value={name} onChange={changeName}/>
          <button className={'Button'} onClick={ctx.addPattern.bind(ctx)}>Add</button>
        </div>
        <div>
          {renderItems(items)}
        </div>
      </div>
    );
  }
}

export default connect(state => state)(Patterns);
