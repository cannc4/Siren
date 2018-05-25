import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('sceneStore')
@observer
export default class Scene extends React.Component {
    
    handleControlEnter = (event) => {
        if(event.ctrlKey && event.keyCode === 13){
            this.props.sceneStore.executionCss(event);
            this.props.sceneStore.addScene(document.getElementById('new_scene_input').value)
        }
    }
    
    
    renderScene(item, i) {
        const class_name = this.props.sceneStore.isActive(item) ? "SceneItem-active" : "SceneItem";
        return (
            <div key={"s_"+i} className={ class_name+ " draggableCancel"}>
                {<button className={'SceneName'}
                    onClick={() => (this.props.sceneStore.changeActiveScene(item))}>{item}</button>}
                {item !== 'default' && <button onClick={() => (this.props.sceneStore.deleteScene(item))}>{'X'}</button>}
            </div>
        )
    }

    render() {
        console.log("RENDER SCENE.JS");
        
        return (<div className={'Scenes PanelAdjuster'}>
            <input className={'Input draggableCancel'} id={"new_scene_input"}
                placeholder={'New Scene Name'}
                onKeyUp={this.handleControlEnter.bind(this)}/>
            <div className={'ScenesButtons'}>
                <button className={'Button draggableCancel'} 
                        onClick={() => (this.props.sceneStore.addScene(document.getElementById('new_scene_input').value))}>Add </button>
                <button className={'Button draggableCancel'} 
                        onClick={() => (this.props.sceneStore.duplicateScene(document.getElementById('new_scene_input').value))}>Dup.</button>
                <button className={'Button draggableCancel'} 
                        onClick={() => (this.props.sceneStore.clearActiveGrid())}>Clear</button>
            </div>
            <div className={'AllScenes'}>
                <div>
                    {_.map(this.props.sceneStore.scenesReversedOrder, this.renderScene.bind(this))}
                </div>
            </div>
        </div>
        );
  }
}
