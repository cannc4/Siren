import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import store from '../store';
import './Modal.css';

class Modal extends Component {
  componentDidMount() {
    this.modalTarget = document.createElement('div');
    this.modalTarget.className = 'modal';
    document.body.appendChild(this.modalTarget);
    this._render();
  }

  componentWillUpdate() {
    this._render();
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.modalTarget);
    document.body.removeChild(this.modalTarget);
  }

  _render() {
    ReactDOM.render(
      <Provider store={store}>
        <div className="Modal">
          <div className="Modal-header">
            {this.props.title}
          </div>
          <div className="Modal-body">
            {this.props.children}
          </div>
          <div className="Modal-foo">
            {this.props.close && <button onClick={this.props.close}>close</button>}
            {this.props.success && <button onClick={this.props.success}>success</button>}
          </div>
        </div>
      </Provider>,
      this.modalTarget
    );
  }

  render() {
    return <noscript />;
  }
}

export default connect(state => state)(Modal);
