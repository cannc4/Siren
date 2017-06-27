import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fbdeletechannelinscene, fbupdatechannelinscene } from '../actions';

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
      modelName : 'Matrices',
      channels_state: [],
      name: '',
      type: '',
      values: [],
      step: 8
    }
  }

  updateT = ({target : {value, id}}) => {
    const ctx = this;
    const {transition, channels} = ctx.state;
    var _index = _.indexOf(channels, id);
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
    const {transition, channels} = ctx.state;
    const _key = event.target.id;
    var value = event.target.value;
    var _index = _.indexOf(channels, _key);

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
    const { channels_state, step, values}=ctx.state;

    const transitionValue = function(c){
      if(ctx.state.transition){
        return ctx.state.transition[_.indexOf(channels_state, c)];
      }
      else {
        return '(clutchIn 2)'
      }
    };

    const handleChange = (obj) => {
      var value, name;
      if(obj.target !== undefined){
        value = obj.target.value;
        name = obj.target.name;
      } else {
        value = obj;
      }

      _.each(Object.values(ctx.props["matrices"]), function(d){
        if(d.matName === ctx.props.active){
          _.each(Object.values(d.channels), function(e){
            if(e.matName === ctx.props.active){

              fbupdatechannelinscene('Matrices',
                {type:'d', name:'d1', values:[], transitions: '', steps: 8 },
                d.key)
            }
          })
        }
      })
    }


    console.log('RenderStep props: ', ctx.props);

    const { click, active } = ctx.props;
    var playerClass="Player Player--" + (channels_state.length + 1.0) + "cols";

    var colCount=0;

    return <div key={i} className={playerClass}>
      <div className="playbox playbox-cycle" style={{width:"15%"}}>{i+1}</div>
      {_.map(channels_state, c => {
        const setText=({ target: { value }}) => {
          if (values[i+1] === undefined)
            values[i+1]={}
          values[i+1] = value;
          ctx.setState({values : values});
        }

        const getValue=() => {
          if (values[i+1] === undefined)
            return ''
          return values[i+1];
        }

        const textval = getValue();

        const cellHeight = 75/step;
        //Timer Check
        var _index = _.indexOf(channels_state,c);
        const currentStep = click.current% step;
        var individualClass = "playbox";
        var translateAmount = 0;
        var ctrans = 'translate(0px, '+translateAmount+'px)';
        var durstr =click.current % step+ 's ease-in-out';
        var css = {
            height: cellHeight+'vh',
            webkittransition: durstr,
            moztransition: durstr,
            otransition: durstr,
            transform: ctrans
        }
        if (i === currentStep) {
          individualClass += " playbox-active";
          translateAmount = cellHeight;
        }
        if (click.isActive === true) {
          individualClass += " playbox-highlight";
        }
        // dynamic text size
        // const textSize = textval.length > 10 ? Math.max( 1, mapNumbers(textval.length, 10, 30, 1, 0.65)) : 1;
        return <div className={individualClass} style={css} key={i}>
          <textarea type="text" style={{fontSize: '1vw'}}value={textval} onChange={setText} id = {i}/>
        </div>
      })}
      <p>" T "</p>
      <input className = "playbox" id = {c} key = {c}
        placeholder={" - "}  value = {''}
        style = {{margin: 5}} onChange = {ctx.updateT.bind(ctx)}
        onKeyUp={ctx._handleKeyPressT.bind(ctx)}/>
    </div>
  }

  renderItem(item, dbKey) {
    const ctx = this;
    const {steps,channels_state} = ctx.state;
    const playerClass="Player Player--" + (channels_state.length + 1.0) + "cols";
    var count = 1;
    const transitionValue = function(c){
      if(ctx.state.transition){
        return ctx.state.transition[_.indexOf(channels_state, c)];
      }
      else {
        return '(clutchIn 2)'
      }
    };

    const handleChange = (obj) => {
      var value, name;
      if(obj.target !== undefined){
        value = obj.target.value;
        name = obj.target.name;
      } else {
        value = obj;
      }

      _.each(Object.values(ctx.props["matrices"]), function(d){
        if(d.matName === ctx.props.active){
          ctx.setState({sceneKey: d.key});
          //  fbupdatechannelinscene('Matrices', payload, d.key)
        }
      })
    }
    // handle function to delete the object
    // gets the dbkey of to-be-deleted item and removes it from db
    const handleDelete = () => {
      const payload = { key: item.key };

      if(confirm("This channel will be deleted from " + ctx.props.active + "scene "))
        _.each(Object.values(ctx.props["matrices"]), function(d){
          if(d.matName === ctx.props.active){
            ctx.setState({sceneKey: d.key});
              fbdeletechannelinscene('Matrices', payload, d.key)
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
      <div className={playerClass}>
        <div className="playbox playbox-cycle" style={{width:"15%"}}></div>
          {item.name}
        {_.map(Array.apply(null, Array(steps)), ctx.renderStep.bind(ctx))}
        <div className={playerClass}>
          <div className="playbox playbox-cycle" style={{width:"7.5%"}}>T</div>
        </div>

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
    const { modelName, type } = ctx.state;
    var items = ctx.props[modelName.toLowerCase()];
    var chn = []

    _.each(items, function(d){
      if(d.matName === ctx.props.active){
        _.map(Object.values(ctx.props["matrices"]), function(obj, i) {
          chn.push(Object.values(obj.channels));
        });
      }
    })

    console.log('Channels Render : ', chn);

    // const changeType = ctx.changeType.bind(ctx);
    // const renderItems = ctx.renderItems.bind(ctx);

    return (
      <div>
      {ctx.renderItems.bind(ctx, chn)}
      </div>
    );
  }
}

export default connect(state => state)(Channels);
