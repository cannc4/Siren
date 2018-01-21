import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {updateSeq} from '../actions';
import store from '../store';
import io from 'socket.io-client';

// Grid Layout
let ReactGridLayout = require('react-grid-layout');
let WidthProvider = ReactGridLayout.WidthProvider;
let ResponsiveReactGridLayout = ReactGridLayout.Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

class PatternRoll extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket_tick: io('http://localhost:4004/'),
      modelName: this.constructor.name,
      uid: '',
      rolls:''
    }
  }
  componentDidMount(){
    const ctx = this;
    const {uid, rolls,socket_tick} = ctx.state;
    let pysockett = io('http://localhost:4004/'); // TIP: io() with no args does auto-discovery
    pysockett.on('connect', (reason) => {
      console.log("Port 4004 Connected: ", reason);
      
    });
    pysockett.on('disconnect', (reason) => {
      console.log("Port 4004 Disconnected: ", reason);
    });


    pysockett.on("dseqo", data => {
      ctx.setState({rolls: data.fileseq});
      console.log("pysock");
      console.log(data.fileseq);
      store.dispatch(updateSeq(data.fileseq));
    })

    ctx.setState({uid: this.props.uid});

  }

  renderItem(item) {
    const ctx = this;
    const nameChange = event => {

    }
    const handleDelete = () => {
    }
    // console.log(item);
    // if Item is legit by key, it will be shown
    // parameters can be added
    return (
        <div> {item.toString()} </div>
    )
  }

  renderItems(rolls) {
    const ctx = this;
    return _.map(rolls, ctx.renderItem.bind(ctx));
  }

  render() {
    const ctx = this;
    const { rolls } = ctx.state;
    const renderItems = ctx.renderItems.bind(ctx);
    const renderItem = ctx.renderItem.bind(ctx);
    
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
          {renderItem(rolls)}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default connect(state => state)(PatternRoll);
