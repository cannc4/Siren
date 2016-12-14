import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { consoleSubmit, fetchModel, fbcreate, fbupdate, fbdelete } from '../actions';
// import { renderFormElement } from '../lib/forms';
import FormElement from './FormElement.react';
import store from '../store';
class Live extends Component {
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
  // const handleChange = ({ target: { value, name }}) => {
  //   const payload = { key: dbKey };
  //   payload[name] = value;
  //   fbupdate(ctx.state.modelName, payload);
  // }
  // // handle function to delete the object
  // const handleDelete = ({ target: { value }}) => {
  //   const payload = { key: dbKey };
  //   fbdelete(ctx.state.modelName, payload);
  // }


  handleConsoleSubmit = event => {
    const value = event.target.value;
    const ctx = this;
    const {tidalServerLink} = ctx.state;

    if(event.keyCode === 13 && event.ctrlKey && value){
      ctx.consoleSubmit(tidalServerLink, value);
    }
  }

  consoleSubmit(tidalServerLink, value){
    store.dispatch(consoleSubmit(tidalServerLink, value));
  }
  render() {
    const ctx = this
    const { modelName, name } = ctx.state;


    const viewPortWidth = '100%'

    return (
      <div id="Execution"  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', padding: "2px", paddingBottom: "25px"}}>
        <textarea className="easter" style={{minHeight: "100px"}} onKeyUp={ctx.handleConsoleSubmit.bind(ctx)} placeholder=""/>
      </div>
    );
  }
}

export default connect(state => state)(Live);
