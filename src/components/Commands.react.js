import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchModel, fbcreate, fbupdate, fbdelete } from '../actions';
// import { renderFormElement } from '../lib/forms';
import FormElement from './FormElement.react';
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
    const handleChange = ({ target: { value, name }}) => {
      var re = /&(\w+)&/g, match, matches = [];
      while (match = re.exec(value)) {
        if(_.indexOf(matches, match[1]) === -1)
          matches.push(match[1]);
      }
      console.log(matches);
      ctx.setState({ params: matches.toString() });

      const payload = { key: dbKey };
      payload[name] = value;
      payload['params'] = this.state.params;
      console.log(payload['params']);
      fbupdate(ctx.state.modelName, payload);
    }
    // handle function to delete the object
    const handleDelete = ({ target: { value }}) => {
      const payload = { key: dbKey };
      fbdelete(ctx.state.modelName, payload);
    }

    // if Item is legit by key, it will be shown
    // parameters can be added
    return item.key && (
      <li key={item.key} className="easter" >
        {_.map(model, (field, name) => {
          const formProps = {
            key: name,
            name: name,
            value: item[name],
            type: field,
            onChange: handleChange.bind(ctx)
          }

          return <FormElement key={name} model={ctx.state.modelName} item={item} formProps={formProps} />

          // return renderFormElement.bind(ctx)(ctx.state.modelName, dbKey, formProps)
        })}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: '2px'}}>
          <button
            onClick={handleDelete}>{'Delete'}
          </button>
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
        <div style={{ width: 'calc(' + viewPortWidth + ' - 50px)', display: 'flex', flexDirection: 'column', padding: '10px'}}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <input type="text" placeholder={modelName } value={name} onChange={changeName}/>
              <button onClick={addItem}>Add</button>
            </div>
          </div>
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
