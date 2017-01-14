import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchModel, fbcreate, fbupdate, fbdelete } from '../actions';
import FormElement from './FormElement.react';

class Accounts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
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

  renderItem(item, db_key) {
    const ctx = this;
    const model = fetchModel(ctx.state.modelName)
    // Item Action Handlers
    // handle function when any field of the object is modified
    const handleChange = ({ target: { value, name }}) => {
      const payload = { key: db_key };
      payload[name] = value;
      fbupdate(ctx.state.modelName, payload);
    }
    // handle function to delete the object
    const handleDelete = ({ target: { value }}) => {
      const payload = { key: db_key };
      fbdelete(ctx.state.modelName, payload);
    }

    // if Item is legit by key, it will be shown
    // parameters can be added
    return item.key && (
      <li key={item.key} style={{display: 'flex', flexDirection: 'column',
        flexWrap: 'wrap', minWidth: '400px'}}>
        {_.map(model, (field, name) => {

          const formProps = {
            key: name,
            name: name,
            value: item[name],
            type: field,
            onChange: handleChange.bind(ctx)
          }
          return <FormElement key={name} model={ctx.state.modelName} item={item} formProps={formProps} />

        })}

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
          <button>{'Play'}</button>
          <button
            className='btn danger'
            onClick={handleDelete}>{'Delete'}</button>

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

    const viewPortWidth = '400px'

    return (
      <div className="cont">
        <div style={{ width: viewPortWidth, display: 'flex', flexDirection: 'column'}}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <b>{items && (_.size(items) + ' ')} {modelName}</b>
            <div>
              <input type="text" placeholder={modelName + ' Name'} value={name} onChange={changeName}/>
              <button onClick={addItem}>Add to {modelName}</button>
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

export default connect(state => state)(Accounts);
