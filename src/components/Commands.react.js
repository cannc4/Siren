import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchModel, fbcreate, fbupdate, fbdelete } from '../actions';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/scheme/scheme';

class Commands extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      params: '',
      modelName: this.constructor.name // React Class Name set above
    }
  }

  addItem() {
    const ctx = this
    const { name } = ctx.state
    if (name.length >= 3) {
      fbcreate(ctx.state.modelName, { name })
    }
  }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ name: value });
  }

  renderItem(item, dbKey) {
    const ctx = this;
    const model = fetchModel(ctx.state.modelName);

    const { params } = ctx.state;
    // Item Action Handlers
    // handle function when any field of the object is modified
    const handleChange = (obj) => {
      console.log('---HANDLECHANGE BEGIN---');
      var value, name;

      if(obj.target !== undefined){
        value = obj.target.value;
        name = obj.target.name;
      } else {
        value = obj;
      }

      console.log(name);
      console.log(value);
      var re = /&(\w+)&/g, match, matches = [];
      while (match = re.exec(value)) {
        if(_.indexOf(matches, match[1]) === -1)
          matches.push(match[1]);
      }
      console.log(matches);
      ctx.setState({ params: matches.toString() });


      const payload = { key: dbKey };
      payload[name === undefined ? 'command' : name] = value;
      payload['params'] = this.state.params;
      console.log(payload['params']);
      fbupdate(ctx.state.modelName, payload);

      console.log(value);
      console.log('---HANDLECHANGE END---');
    }
    // handle function to delete the object
    // gets the dbkey of to-be-deleted item and removes it from db
    const handleDelete = (/*{ target: obj}*/) => {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);
    }

    var options = {
        lineNumbers: false,
        mode: 'scheme',
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
            <CodeMirror className={'commandDiv'} name={"command"} value={item["command"]} onChange={handleChange.bind(ctx)} options={options}/>
          </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '2px'}}>
          <button onClick={handleDelete}>{'Delete'} </button>
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
    const { modelName, name } = ctx.state;
    const items = ctx.props[modelName.toLowerCase()];
    const changeName = ctx.changeName.bind(ctx);
    const addItem = ctx.addItem.bind(ctx);
    const renderItems = ctx.renderItems.bind(ctx);

    const viewPortWidth = '100%'

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: '10px', paddingBottom: '10px'}}>
          <input className={'newCommandInput'} type="text" placeholder={'New Command Name'} value={name} onChange={changeName}/>
          <button className={'newCommandButton'} onClick={addItem}>Add</button>
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

export default connect(state => state)(Commands);
