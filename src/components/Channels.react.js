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
      cid:'',
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

  renderStep(c, i) {
    console.log("RenderStep i :" , i, " c :" , c );
    const ctx=this;
    const {step} = ctx.state;
    const { click, active } = ctx.props;
    const channels_state = ctx.props.channel;
    var playerClass="Player Player--" + (step) + "rows";
    var colCount=0;


    console.log('RenderStep props: ', ctx.props);

    var indents = [];

    //
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

    const cellHeight = 75/step;
    //Timer Check
    var _index = _.indexOf(channels_state,c);
    const currentStep = click.current% step;

    return <div key={i} className={playerClass}>
    <div className={playerClass}  key={i}>
      <textarea type="text" style={{fontSize: '1vw'}}value={5} onChange={setText} id = {i}/>
    </div>
    </div>
  }

  renderItem(item, dbKey) {
    const ctx = this;
    const {step} = ctx.state;
    console.log(item);
    const playerClass="Player"
    var count = 1;
    const transitionValue = function(c){
        return item.transition;
      }

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
      <div className={playerClass}>
          {item.name}
          {_.map(Array.apply(null, Array(step)), ctx.renderStep.bind(ctx))}
          <div className="playbox playbox-cycle" style={{width:"7.5%"}}>T</div>
          <input className = "playbox"
            placeholder={" - "}  value = {transitionValue(item.transition)}
            style = {{margin: 5}} onChange = {ctx.updateT.bind(ctx)}
            onKeyUp={ctx._handleKeyPressT.bind(ctx)}/>
        </div>

    )
  }

  renderItems(items) {
    const ctx = this;
    console.log("Renderitems :" , items);
    return _.map(items, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this
    const { modelName } = ctx.state;
    var items = ctx.props.channel;
    var chn = [];

    // const changeType = ctx.changeType.bind(ctx);
    const renderItems = ctx.renderItems.bind(ctx);
    console.log(items);
    return (
      <div>
      {renderItems(items)}
      </div>
    );
  }
}

export default connect(state => state)(Channels);
