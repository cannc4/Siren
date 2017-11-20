import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {  fbupdateseq, fbdeleteseq } from '../actions';

// Grid Layout
let ReactGridLayout = require('react-grid-layout');
let WidthProvider = ReactGridLayout.WidthProvider;
let ResponsiveReactGridLayout = ReactGridLayout.Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

class Seq extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      index:'',
      params: {},
      bitmap:[[]],
      modelName: this.constructor.name,
      uid: ''
    }
  }
  //Pattern Dictionary
  // addSeq() {
  //   let flag = false;
  //   const ctx = this;


  // }

  changeName({target: { value }}) {
    const ctx = this;
    ctx.setState({ name: value });
  }

  renderItem(sq, dbKey) {
    const ctx = this;
    const {modelName} = ctx.state;
   
    // handle function to delete the object
    // gets the dbkey of to-be-deleted item and removes it from db
    const handleDelete = () => {
      const payload = { key: sq.key };

      if(confirm("This pattern will be deleted from the scene '" + ctx.props.active + "'"))
        _.each(Object.values(ctx.props[modelName]), function(d){
          if(d.uid === ctx.props.uid){
            fbdeleteseq(modelName, payload, d.key);
          }
        })
    }

    // if Item is legit by key, it will be shown
    // parameters can be added
    return sq.key && (
      <div key={sq.key} className={"PatternItem draggableCancel"} data-grid={{i: sq.key, x:0, y: sq.index*2, w: Infinity, h: 3, minH: 2}} >
        <div key={name} >
          <div key={name} className={'PatternItemInputs'}>
            <div className={"PatternPanelHeader draggableCancel"}> ■ </div>
            <input className={'Input draggableCancelNested'} type="String" placeholder={"seq title"} name={"name"} value={sq["name"]} />
            <input className={'Input draggableCancelNested'} type="String" placeholder={"parameters"} name={"params"} value={sq["params"]} />
            <button className={'Button draggableCancelNested'} onClick={handleDelete}>{'Delete'} </button>
          </div>
         
        </div>
      </div>
    )
  }

  renderItems(sequences) {
    const ctx = this;
    return _.map(sequences, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this;
    const { modelName } = ctx.state;
    //let seqs = ctx.props[modelName.toLowerCase()];
    //const scenes = Object.values(ctx.props["matrices"]);
    let sq_prop = Object.values(ctx.props[modelName]);
    _.each(seq_prop, function(d){
      if(d.uid === ctx.props.uid){
          let sequences = d;
      }
    });

    const renderItems = ctx.renderItems.bind(ctx);

    return (
      <div>
        <ResponsiveReactGridLayout
            className={"layout_patterns"}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 360}}
            cols={{lg: 24, md: 20, sm: 12, xs: 8}}
            rowHeight={30}
            margin={[2,10]}
            draggableCancel={'.draggableCancelNested'}
          >
          {renderItems(sequences)}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

// import debugRender from 'react-render-debugger';
// export default connect(state => state)(debugRender(Patterns));
export default connect(state => state)(Seq);
