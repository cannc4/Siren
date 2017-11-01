import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketches/tempo';
import './style/Layout.css';

class Canvas extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const ctx = this;
    const canvasLayout = _.find(ctx.props.layout.windows, ['i', 'canvas']);

    var vertical_n = 20,
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 62,
        w = Math.max(document.clientWidth, window.innerWidth || 0),
        margin = 7,
        row_height = (h-(vertical_n+1)*margin)/vertical_n,
        column_width = (w-(24+1)*margin)/24;

    const w_ = canvasLayout.w*column_width;
    const h_ = canvasLayout.h*row_height-20;

    return (<div>
      <P5Wrapper sketch={sketch}
                 width={w_}
                 height={h_}
                 cycleInfo={ctx.props.click.response.vals}
                 cycleTime={ctx.props.click.response.time}/>
    </div>);
  }
}
export default connect(state => state)(Canvas);
