import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';


class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    if(nextProps.name === "3_d2")
      return false;
    return true;
  }

  componentDidUpdate(prevProps, prevState){
    if(values[channels[i]] !== undefined){
      const vals = values[channels[i]][runNo[i]];
      const channel = channels[i];
      const obj = {[channel]: vals};
      if (vals !== undefined) {
        var sceneCommands = [];
        const items = this.props[this.state.modelName.toLowerCase()]
        _.each(items, function(d){
          if(d.matName === activeMatrix)
            sceneCommands = d.commands;
        })

        ctx.sendCommands(tidalServerLink, obj , sceneCommands );
        }
      }
    }
  }
    // store.dispatch(sendCommands(tidalServerLink, vals, channelcommands, commands));

  render() {
    console.log("cell");
    return (
      <div className={this.props.className} style={{height: this.props.cellHeight}} key={this.props.name}>
        <textarea type="text" value={this.props.textval} onChange={this.props.setText}/>
      </div>
    );
  }

}

export default connect(state => state)(Cell);
