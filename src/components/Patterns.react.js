import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchModel, fbcreate, fbupdate, fbdelete,
         fbcreatepatterninscene, fbupdatepatterninscene, fbdeletepatterninscene } from '../actions';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import '../assets/_style.css';
import '../assets/_rule.js';

class Patterns extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      params: '',
      modelName: this.constructor.name, // React Class Name set above,
      sceneKey: '',
      uid: ''
    }
  }

  addItem() {
    const ctx = this

    _.each(Object.values(ctx.props["matrices"]), function(d){
      if(d.matName === ctx.props.active){
        const { name } = ctx.state
        ctx.setState({sceneKey: d.key});
        if (name.length >= 3) {
          fbcreatepatterninscene('Matrices', {name}, d.key)
        }
      }
    })
  }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ name: value });
  }

  renderItem(item, dbKey) {
    const ctx = this;
    const model = fetchModel(ctx.state.modelName);
    const { params, sceneKey } = ctx.state;
    // Item Action Handlers
    // handle function when any field of the object is modified
    const handleChange = (obj) => {
      // console.log('---HANDLECHANGE BEGIN---');
      var value, name;

      if(obj.target !== undefined){
        value = obj.target.value;
        name = obj.target.name;
      } else {
        value = obj;
      }
       // 2i

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

      // console.log(value);
      // console.log('---HANDLECHANGE END---');
    }
    // handle function to delete the object
    // gets the dbkey of to-be-deleted item and removes it from db
    const handleDelete = (/*{ target: obj}*/) => {
      const payload = { key: item.key };

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
      <li key={item.key} className="easter" >
          <div key={name} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <input type="String" name={"name"} value={item["name"]} onChange={handleChange.bind(ctx)}/>
            <input type="String" name={"params"} value={item["params"]} onChange={handleChange.bind(ctx)}/>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '2px'}}>
              <button onClick={handleDelete}>{'Delete'} </button>
            </div>
            <CodeMirror className={'patternDiv'} name={"pattern"} value={item["pattern"]} onChange={handleChange.bind(ctx)} options={options}/>
          </div>

      </li>
    )
  }

  renderItems(items) {
    const ctx = this;
    return _.map(items, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this
    const { modelName, name, sceneKey } = ctx.state;
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
    const addItem = ctx.addItem.bind(ctx);
    const renderItems = ctx.renderItems.bind(ctx);

    const viewPortWidth = '100%'

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px'}}>
          <input className={'newPatternInput'} type="text" placeholder={'New Pattern Name'} value={name} onChange={changeName}/>
          <button className={'newPatternButton'} onClick={addItem}>Add</button>
        </div>
        <div style={{ width: viewPortWidth }}>
          <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '0', margin: '0'}}>
            {renderItems(items)}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(Patterns);
