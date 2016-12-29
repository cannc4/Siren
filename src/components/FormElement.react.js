import _ from 'lodash';
import React, { Component, cloneElement } from 'react';
import { connect } from 'react-redux';
import { fbupdate, fetchModels } from '../actions';


class FormElement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      allModels: fetchModels()
    };
  }


  findType(type) {
    const ctx = this;
    const { allModels } = ctx.state
    if (typeof type !== 'object') {
      switch (type) {
        case 'String':
          return { type: 'text' }
        case 'Number':
          return { type: 'number' }
        case 'Date':
          return { type: 'date' }
        default:
          if (_.find(allModels, (x) => x === type)) return { type };
          return false;
      }
    } else {
      // is Array of model
      if (type.length !== undefined && typeof type.length !== undefined) return { type: 'array', model: type[0] }
      // is Subobject
      return { type: 'object' }
    }
  }

  renderArray(otype) {
    const ctx = this;
    const bindings = ctx.props.formProps;

    const cancel = () => { ctx.setState({modal: undefined}); }
    const Items = ctx.props[otype.model];
    var ModalTitle = 'add ' + otype.model + ' to ' + ctx.props.model;
    const addItems = () => {
      ctx.setState({ modal: true })
    }

    return <div key={bindings.key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <b>{bindings.key} - {bindings.value ? bindings.value.length : 0} {otype.model}</b>
      <div>
        <button className='btn action' onClick={addItems}>manage</button>
      </div>
      {ctx.state.modal && <Modal title={ModalTitle} close={cancel}>
        {_.map(Items, item => {
          const shouldRemove = what =>  (bindings.value || []).indexOf(what) > -1


          const updateItem = () => {
            var newValue = bindings.value || [];
            if (shouldRemove(item.key)) {
              _.remove(newValue, x => x === item.key)
            } else {
              newValue.push(item.key)
            }

            const payload = { key: ctx.props.item.key };
            payload[bindings.name] = newValue;
            fbupdate(ctx.props.model, payload);
            cancel();
          }

          return (<div key={item.key} style={{display:'flex', justifyContent:'space-between', padding: '5px'}}>
            <b>{item.name}</b>
            <button onClick={updateItem}>
              {shouldRemove(item.key) ? 'remove' : 'add'}
            </button>
          </div>)
        })}

      </Modal>}
    </div>

  }

  renderObjectRelation(otype) {
    const ctx = this;
    const bindings = ctx.props.formProps;

    const cancel = () => { ctx.setState({modal: undefined}); }
    const Items = ctx.props[otype.model];
    var ModalTitle = 'choose ' + otype.model + ' to ' + ctx.props.model;
    const addItems = () => {
      ctx.setState({ modal: true })
    }
    const findName = (key) => {
      return Items ? (Items[key] ? Items[key].name : <noscript />) : <noscript />
    }
    return <div key={bindings.key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <b>{bindings.key} - {bindings.value ? findName(bindings.value) : 'no '} {otype.model}</b>
      <div>
        <button className='btn action' onClick={addItems}>choose</button>
      </div>
      {ctx.state.modal && <Modal title={ModalTitle} close={cancel}>
        {_.map(Items, item => {
          const updateItem = () => {
            const payload = { key: ctx.props.item.key };
            payload[bindings.name] = item.key;
            fbupdate(ctx.props.model, payload);
            cancel();
          }

          return (<div key={item.key} style={{display:'flex', justifyContent:'space-between', padding: '5px'}}>
            <b>{item.name}</b>
            <button onClick={updateItem}>
              choose
            </button>
          </div>)
        })}
      </Modal>}
    </div>

  }

  renderTextElement() {
    const ctx = this;
    const bindings = ctx.props.formProps;
    return <div key={bindings.key} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>

      {bindings.key !== "command" && cloneElement(<input type="text" />, bindings)}
      {bindings.key === "command" && cloneElement(<textarea style={{minHeight: "30px"}}/>, bindings)}
    </div>
  }

  renderNumberElement() {
    const ctx = this;
    const bindings = ctx.props.formProps;
    bindings.value = bindings.value || 0
    return <div key={bindings.key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <b>{bindings.key}</b>
      {cloneElement(<input type='number' />, bindings)}
    </div>;
  }

  renderDateElement() {
    const ctx = this;
    const bindings = ctx.props.formProps;
    return <div key={bindings.key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <b>{bindings.key}</b>
      {cloneElement(<input type='date' />, bindings)}
    </div>;
  }

  render() {
    const ctx = this;
    const bindings = ctx.props.formProps
    const { type, key } = ctx.props.formProps;
    const otype = ctx.findType(type);
    const ntype = otype.type

    switch (ntype) {
      case 'array':
        return ctx.renderArray(otype)
      case 'text':
        return ctx.renderTextElement()
      case 'number':
        return ctx.renderNumberElement()
      case 'date':
        return ctx.renderDateElement()
      case 'object':
        return <div key={key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <b>{bindings.key}</b><i>{'Subobject'}</i>
        </div>;
      default:
        // type is false
        if (!otype || !ntype) {
          return <div key={key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <b>{bindings.key}</b><i>{'This type is not supported.'}</i>
          </div>
        }

        return ctx.renderObjectRelation({model: ntype})
    }
  }
}

export default connect(state => state)(FormElement);
