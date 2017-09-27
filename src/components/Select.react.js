import React from 'react';
import { render } from 'react-dom';
import { SelectableGroup, createSelectable } from 'react-selectable';
import Cell from './cell';

const SelectableComponent = createSelectable(SomeComponent);

class App extends React.Component {

  constructor (props) {
  	super(props);
  	this.state = {
  		selectedKeys: []
  	};
  }

  render () {
    return (
      <SelectableGroup onSelection={this.handleSelection}>
        {this.props.items.map((item, i) => {
          	let selected = this.state.selectedKeys.indexOf(item.id) > -1;
          	return (
          		<SelectableComponent key={i} selected={selected} selectableKey={item.id}>
          			{item.title}
          		</SelectableComponent>
          	);
        })}
      </SelectableGroup>
    );
  },

  handleSelection (selectedKeys) {
  	this.setState({ selectedKeys });
  }

}