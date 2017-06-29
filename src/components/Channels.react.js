import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbdeletechannelinscene, fbupdatechannelinscene,updateChannel } from '../actions';

// var Button = require('react-button')
// var themeButton = {
//     style : {borderWidth: 0.8, borderColor: 'rgba(255,255,102,0.15)'} ,
//     disabledStyle: { background: 'gray'},
//     overStyle: { background: 'rgba(255,255,102,0.15)' },
//     activeStyle: { background: 'rgba(255,255,102,0.15)' },
//     pressedStyle: {background: 'green', fontWeight: 'bold'},
//     overPressedStyle: {background: 'rgba(255,255,102,1)', fontWeight: 'bold'}
// }
class Channels extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modelName : 'Channels',
      cid: '',
      scene_name: '',
      name: '',
      type: '',
      vals: [],
      step: 8,
      transition: ''
    }
  }

  updateT = ({target : {value, id}}) => {
    const ctx = this;
    const channels_state = ctx.props.channel;
    const {transition} = ctx.state;
    var _index = _.indexOf(channels_state, id);
    var temp = transition;
    if(temp){
      temp[_index] = value;
    }
    else {
      temp = [];
    }
    ctx.setState({transition: temp});
  }

  _handleKeyPressT = event => {
    const ctx=this;
    const channels_state = ctx.props.channel;
    const {transition} = ctx.state;
    const _key = event.target.id;
    var value = event.target.value;
    var _index = _.indexOf(channels_state, _key);

    if(event.keyCode === 13 && event.ctrlKey){
      var temp = transition;
      temp[_index] = value;
     ctx.setState({transition:temp});
    }
  }

  changeType({target: { value }}) {
    const ctx = this;
    ctx.setState({ type: value });
  }

  renderStep(item, _, i) {
    const ctx = this;

    console.log("RenderStep ("+i+") :" , ctx.props);

    const { step } = ctx.state;
    const { click, active } = ctx.props;
    const channels = Object.values(ctx.props.channel)

    // console.log("item", item);

    const setText=({ target: { value }}) => {
      if (vals[i+1] === undefined)
        vals[i+1]={}
      vals[i+1] = value;
      ctx.setState({vals : vals});
    }
    //
    // const getValue=() => {
    //   if (vals[i+1] === undefined)
    //     return ''
    //   return vals[i+1];
    // }
    //
    // const textval = getValue();

    const currentStep = click.current % step;
    const cell_width = 100 / channels.length + '%'

    const playerClass="Player Player--" + (step) + "rows";
    return <div key={(item['scene']+item['name']+i).toString()} className={playerClass}>
      <textarea type="text" style={{width: cell_width}} value={i} onChange={setText}/>
    </div>
  }

  renderItem(item) {
    const ctx = this;

    if (item.scene !== ctx.props.active)
      return;

    console.log("renderItem: ", item);

    const { step } = ctx.state;
    const playerClass = "Player"

    // const handleChange = (obj) => {
    //   var value, name;
    //   if(obj.target !== undefined){
    //     value = obj.target.value;
    //     name = obj.target.name;
    //   } else {
    //     value = obj;
    //   }
    //
    //   _.each(Object.values(ctx.props["matrices"]), function(d){
    //     if(d.matName === ctx.props.active){
    //       _.each(Object.values(d.channels), function(e){
    //         if(e.matName === ctx.props.active){
    //           fbupdatechannelinscene('Matrices',
    //             {type:'d', name:'d1', values:[], transitions: '', steps: 8 },
    //             d.key)
    //         }
    //       })
    //     }
    //   })
    // }

  //  ctx.setState({name:item.name, type:item.type, step: item.step, transition:item.transition, vals:[]})
    //store.dispatch(updateChannel(item));
    // if Item is legit by key, it will be shown
    // parameters can be added
    return item && (
      <div key={(item['scene']+item['name']).toString()} className={playerClass}>
        <p>{item.name}</p>
        {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx, item))}
        <p>Trans.</p>
        <input className = "playbox"
          placeholder={" - "}  value = {item.transition}
          style = {{margin: 5}} onChange = {ctx.updateT.bind(ctx)}
          onKeyUp={ctx._handleKeyPressT.bind(ctx)}/>
      </div>
    )
  }

  render() {
    const ctx = this
    var items = ctx.props.channel;

    console.log('channel items: ',items);
    return (
      <div>
        {_.map(items, ctx.renderItem.bind(ctx))}
      </div>
    );
  }
}

export default connect(state => state)(Channels);
