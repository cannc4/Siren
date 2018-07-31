import React from 'react';
import { inject, observer } from 'mobx-react';
import '../styles/App.css';
import '../styles/Home.css';
import '../styles/Layout.css';

@inject('menubarStore')
@observer
export default class Playback extends React.Component {
    handlePlayRecordings = (i, sent) => {
      console.log("here");
      if(sent)
        this.props.menubarStore.togglePlay(i);
      else
        this.props.menubarStore.toggleStop(i);
      }

  render() {

    console.log("RENDER ``Playback.js");
    let findex;
    let ctx = this;
    return (<div className={'GlobalParams PanelAdjuster'}>
        <div className={'StoredGlobalParams'}>
        {this.props.menubarStore.recs.map((recorded, i) => {
          return (<div><div>{recorded} 
            </div>
            <button key={i} className={'Button'} title= {'Start Recording'}
            onClick={ctx.handlePlayRecordings.bind(ctx, i,true)}>
            ▶  
          </button>
          <button key={i} className={'Button'} title= {'Stop Recording'}
          onClick={ctx.handlePlayRecordings.bind(ctx, i,false)}>
            ◼
            </button>
            <button key={i} className={'Button'} title={'Generate Scene'}
              onClick={() => (ctx.props.menubarStore.generateNewScene(i))}>ø</button>
          </div>)  
        })}
      </div>
    </div>)
  }
}      
