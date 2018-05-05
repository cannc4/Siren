<<<<<<< HEAD
import React from 'react';
import { inject, observer } from 'mobx-react';
import Draggable from 'react-draggable';
import Cell from './Cell'
import _ from 'lodash';

@inject('channelStore')
@observer
class ChannelHeader extends React.Component {

// <input ref={(input_type) => { this.nameInputType = input_type; }}
//     title={"Type ("+item.type+")"}
//     className={"ChannelItemHeader-Text draggableCancel"}
//     placeholder={" type "}  
//     value={item.type}
//     onChange={() => 
//         (this.props.channelStore.changeChannelType(item.name, this.nameInputType.value))}
//     onClick={() => 
//             this.nameInputType.focus()} />
    
executionCss = (event, duration = 500) => {
    event.persist();
    event.target.className += ' Executed';
    _.delay( () => (_.replace(event.target.className, ' Executed', '') ),
            duration);
}

handleControlEnter = (event) => {
    if(event.ctrlKey && event.keyCode === 13){
        this.executionCss(event);
        this.props.sceneStore.addScene(document.getElementById('new_scene_input').value)
    }
}
    
render() {
    console.log('RENDER CHANNEL HEADER');
    const item = this.props.value;

      return (<div>
            <div className={"ChannelItemHeader " + item.type }>
                <input ref={(input_name) => { this.nameInputName = input_name; }}
                    title={"Channel Name (" + item.name + ")"}
                    className={"ChannelItemHeader-Text draggableCancel"}
                    placeholder={"name"}   
                    style={{ width: '30%' }}  
                    value={item.name}
                    onChange={() => {
                        this.props.channelStore.changeChannelName(item.name, this.nameInputName.value);
                        this.nameInputName.focus();
                    }}
                    onKeyUp={this.handleControlEnter.bind(this)}
                    onClick={() => 
                        this.nameInputName.focus()} />
                {this.props.channelStore.getChannelType(item.name) === "Tidal" && 
                <input ref={(input_transition) => { this.nameInputTrans = input_transition; }}
                    title={"Tidal Transition " + (item.transition === '' ? "NONE": "("+item.transition+")")}
                    className={"ChannelItemHeader-Transition draggableCancel"}
                    placeholder={"  ___"}  
                    value={item.transition}
                    onChange={() => 
                        (this.props.channelStore.changeChannelTransition(item.name, this.nameInputTrans.value))}
                    onClick={() => 
                        this.nameInputTrans.focus()}/>}
                <div className={"ChannelItemHeaderButtons"}>
                    <button className={"Button "+ item.loop} title={'Loop'} onClick={() => 
                        this.props.channelStore.toggleLoop(item.name)}>⭯</button>
                    <button className={"Button "+ item.solo} title={'Solo'} onClick={() => 
                        this.props.channelStore.toggleSolo(item.name)}>S</button>
                    <button className={"Button "+ item.mute} title={'Mute'}
                        onClick={() => 
                          this.props.channelStore.toggleMute(item.name)}>M</button>
                  <button className={"Button"} title={'Delete'} onClick={() => 
                        this.props.channelStore.deleteChannel(item.name)}>X</button>
                </div>
                
            </div>
            <div className={"ChannelItemHeader"}>
                <div className={"ChannelItemHeader-time"}>
                    <input ref={(input_rate) => { this.nameInputRate = input_rate; }}
                        title={"Rate"}
                        className={"ChannelItemHeader-Text draggableCancel"}
                        placeholder={"rate"}    
                        value={item.rate}
                        onChange={() => (this.props.channelStore.changeChannelRate(item.name, this.nameInputRate.value))}
                        onClick={() => this.nameInputRate.focus()}/>
                    
                    <button className={"Button "+ item.gate} title={item.gate ? 'Pause': 'Play'}
                        onClick={() => (this.props.channelStore.toggleGate(item.name))}>{item.gate ? '●': '○'}</button>
                    <button className={"Button"} title={'Reset Timer'}
                      onClick={() => (this.props.channelStore.resetTime(item.name))}>🡅</button>
                </div>
          </div>
        </div>
    );
  }
}

@inject('channelStore')
@observer
class Channel extends React.Component {
  
  render() {
    const { item, index } = this.props;
    console.log('RENDER CHANNEL', item);

    let channelClass = "ChannelItem";
    if ((!item.loop) || ( item.mute) || (this.props.channelStore.soloEnabled && !item.solo)) {
      channelClass += " disabled";
    }
    return (<div className={channelClass}>
        <ChannelHeader key={index} value={item}/>
        {item.cells.map((c, i) => {
           return <Cell key={i} item={item} channel_index={index} index={i} value={c}/>
        })}
        <div className={'ChannelItemSteps'}>
            <button className={"Button"}
                    title={"Add Step"}
                    onClick={() => (this.props.channelStore.addStep(item.name))}> + </button>
            <button className={"Button"}
                    title={"Remove Step"}
                    onClick={() => (this.props.channelStore.removeStep(item.name))}> - </button>
        </div>
    </div>);
  }
}

@inject('channelStore')
@observer
export default class Grid extends React.Component {
    
    onDragStop = (event, position) => {
        let stepIndex = _.toInteger((position.lastY-60)/40);
        this.props.channelStore.seekTimer(stepIndex);
    }
    
    render() {
        console.log('RENDER GRID');
        return (<div className={'AllChannels draggableCancel PanelAdjuster'}>    
            <Draggable position={null}
                defaultPosition={{x: 0, y: 60}}    
                bounds={{
                    left: 0,
                    top: 60,
                    right: 0,
                    bottom: (this.props.channelStore.getMaxStep-1)*40+60
                }}
                axis={"y"}
                grid={[6, 40]}
                onStop={this.onDragStop}>
                <div className="Timeline"></div>
            </Draggable>
                    
            {this.props.channelStore.getActiveChannels
                .map((t, i) => {
                    return <Channel key={t.scene+"_"+t.name} item={t} index={i}/>;
                })}
            
        </div>
        );
    }
=======
import React from 'react';
import { inject, observer } from 'mobx-react';
import Draggable from 'react-draggable';
import Cell from './Cell'
import _ from 'lodash';

@inject('channelStore')
@observer
class ChannelHeader extends React.Component {

// <input ref={(input_type) => { this.nameInputType = input_type; }}
//     title={"Type ("+item.type+")"}
//     className={"ChannelItemHeader-Text draggableCancel"}
//     placeholder={" type "}  
//     value={item.type}
//     onChange={() => 
//         (this.props.channelStore.changeChannelType(item.name, this.nameInputType.value))}
//     onClick={() => 
//             this.nameInputType.focus()} />
    
executionCss = (event, duration = 500) => {
    event.persist();
    event.target.className += ' Executed';
    _.delay( () => (_.replace(event.target.className, ' Executed', '') ),
            duration);
}

handleControlEnter = (event) => {
    if(event.ctrlKey && event.keyCode === 13){
        this.executionCss(event);
        this.props.sceneStore.addScene(document.getElementById('new_scene_input').value)
    }
}
    
render() {
    console.log('RENDER CHANNEL HEADER');
    const item = this.props.value;

      return (<div>
            <div className={"ChannelItemHeader " + item.type }>
                <input ref={(input_name) => { this.nameInputName = input_name; }}
                    title={"Channel Name (" + item.name + ")"}
                    className={"ChannelItemHeader-Text draggableCancel"}
                    placeholder={"name"}   
                    style={{ width: '30%' }}  
                    value={item.name}
                    onChange={() => {
                        this.props.channelStore.changeChannelName(item.name, this.nameInputName.value);
                        this.nameInputName.focus();
                    }}
                    onKeyUp={this.handleControlEnter.bind(this)}
                    onClick={() => 
                        this.nameInputName.focus()} />
                {this.props.channelStore.getChannelType(item.name) === "Tidal" && 
                <input ref={(input_transition) => { this.nameInputTrans = input_transition; }}
                    title={"Tidal Transition " + (item.transition === '' ? "NONE": "("+item.transition+")")}
                    className={"ChannelItemHeader-Transition draggableCancel"}
                    placeholder={"  ___"}  
                    value={item.transition}
                    onChange={() => 
                        (this.props.channelStore.changeChannelTransition(item.name, this.nameInputTrans.value))}
                    onClick={() => 
                        this.nameInputTrans.focus()}/>}
                <div className={"ChannelItemHeaderButtons"}>
                    <button className={"Button "+ item.loop} title={'Loop'} onClick={() => 
                        this.props.channelStore.toggleLoop(item.name)}>⭯</button>
                    <button className={"Button "+ item.solo} title={'Solo'} onClick={() => 
                        this.props.channelStore.toggleSolo(item.name)}>S</button>
                    <button className={"Button "+ item.mute} title={'Mute'}
                        onClick={() => 
                          this.props.channelStore.toggleMute(item.name)}>M</button>
                  <button className={"Button"} title={'Delete'} onClick={() => 
                        this.props.channelStore.deleteChannel(item.name)}>X</button>
                </div>
                
            </div>
            <div className={"ChannelItemHeader"}>
                <div className={"ChannelItemHeader-time"}>
                    <input ref={(input_rate) => { this.nameInputRate = input_rate; }}
                        title={"Rate"}
                        className={"ChannelItemHeader-Text draggableCancel"}
                        placeholder={"rate"}    
                        value={item.rate}
                        onChange={() => (this.props.channelStore.changeChannelRate(item.name, this.nameInputRate.value))}
                        onClick={() => this.nameInputRate.focus()}/>
                    
                    <button className={"Button "+ item.gate} title={item.gate ? 'Pause': 'Play'}
                        onClick={() => (this.props.channelStore.toggleGate(item.name))}>{item.gate ? '●': '○'}</button>
                    <button className={"Button"} title={'Reset Timer'}
                      onClick={() => (this.props.channelStore.resetTime(item.name))}>🡅</button>
                </div>
          </div>
        </div>
    );
  }
}

@inject('channelStore')
@observer
class Channel extends React.Component {
  
  render() {
    const { item, index } = this.props;
    console.log('RENDER CHANNEL', item);

    let channelClass = "ChannelItem";
    if ((!item.loop) || ( item.mute) || (this.props.channelStore.soloEnabled && !item.solo)) {
      channelClass += " disabled";
    }
    return (<div className={channelClass}>
        <ChannelHeader key={index} value={item}/>
        {item.cells.map((c, i) => {
           return <Cell key={i} item={item} channel_index={index} index={i} value={c}/>
        })}
        <div className={'ChannelItemSteps'}>
            <button className={"Button"}
                    title={"Add Step"}
                    onClick={() => (this.props.channelStore.addStep(item.name))}> + </button>
            <button className={"Button"}
                    title={"Remove Step"}
                    onClick={() => (this.props.channelStore.removeStep(item.name))}> - </button>
        </div>
    </div>);
  }
}

@inject('channelStore')
@observer
export default class Grid extends React.Component {
    
    onDragStop = (event, position) => {
        let stepIndex = _.toInteger((position.lastY-60)/40);
        this.props.channelStore.seekTimer(stepIndex);
    }
    
    render() {
        console.log('RENDER GRID');
        return (<div className={'AllChannels draggableCancel PanelAdjuster'}>    
            <Draggable position={null}
                defaultPosition={{x: 0, y: 60}}    
                bounds={{
                    left: 0,
                    top: 60,
                    right: 0,
                    bottom: (this.props.channelStore.getMaxStep-1)*40+60
                }}
                axis={"y"}
                grid={[6, 40]}
                onStop={this.onDragStop}>
                <div className="Timeline"></div>
            </Draggable>
                    
            {this.props.channelStore.getActiveChannels
                .map((t, i) => {
                    return <Channel key={t.scene+"_"+t.name} item={t} index={i}/>;
                })}
            
        </div>
        );
    }
>>>>>>> c2d69e2fbe3a4638434652e70bff28edf8c5d029
}