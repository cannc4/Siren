import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { consoleSubmit, fetchModel, fbcreate, fbupdate, fbdelete,startClick,stopClick } from '../actions';
// import { renderFormElement } from '../lib/forms';
import FormElement from './FormElement.react';
import store from '../store';

class Live extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      modelName: this.constructor.name // React Class Name set above
      // click : {current:null,
      //         isActive:false}
    }
  }
  //
  // componentDidMount(props,state){
  //   const ctx = this;
  //
  //     var socket = io('http://localhost:3003/'); // TIP: io() with no args does auto-discovery
  //     socket.on("osc", data => {
  //
  //       this.startClick();
  //       console.log("onMessage: ");
  //
  //       console.log(data);
  //     })
  //     socket.on("dc", data => {
  //       this.stopClick();
  //     })
  //
  //
  //   }
  //
  // startClick() {
  //     const ctx=this;
  //     store.dispatch(startClick());
  // }
  //
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


    // renderMetro(){
    //   const ctx=this;
    //   const { click }=ctx.props;
    //   const currentStep=click.current;
    //   var metro="metro metro--" ;
    //   if (currentStep % 2 == 0 ) {
    //     metro += " metro-active";
    //   }
    //   else {
    //     metro = "metro metro--"
    //   }
    //   return <div className={metro}>{}
    //     <input type="text" placeholder= "Metro"/>
    // </div>
    //
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
        // {ctx.renderMetro()}
      </div>

    );
  }
}

export default connect(state => state)(Live);
