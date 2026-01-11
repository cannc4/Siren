import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Route } from 'react-router-dom';

import Home from './Home';
import MenuBar from './MenuBar';
import SetupWizard from './SetupWizard';
import StatusBar from './StatusBar';

@inject('setupStore', 'pathStore', 'menubarStore')
@observer
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false
    };
  }

  componentDidMount() {
    // Listen for menu actions from Electron
    if (window.electronAPI) {
      window.electronAPI.onMenuAction(this.handleMenuAction);
    }

    // Start health polling
    this.healthPollInterval = setInterval(() => {
      this.props.setupStore.pollHealthStatus();
    }, 5000);
  }

  componentWillUnmount() {
    if (this.healthPollInterval) {
      clearInterval(this.healthPollInterval);
    }
  }

  handleMenuAction = (action) => {
    const { menubarStore, setupStore } = this.props;

    switch (action) {
      case 'new-scene':
        // Handle new scene
        break;
      case 'open-scene':
        // Handle open scene
        break;
      case 'save-scene':
        // Handle save scene
        break;
      case 'settings':
        setupStore.openWizard();
        break;
      case 'restart-sc':
        this.handleRestartSc();
        break;
      case 'restart-tidal':
        this.handleRestartTidal();
        break;
      case 'hush':
        this.handleHush();
        break;
      default:
        console.log('Unknown menu action:', action);
    }
  };

  handleRestartSc = async () => {
    try {
      const response = await fetch('http://localhost:3001/restart-sc', {
        method: 'POST'
      });
      if (response.ok) {
        console.log('SuperCollider restarted');
      }
    } catch (e) {
      console.error('Failed to restart SC:', e);
    }
  };

  handleRestartTidal = async () => {
    try {
      const response = await fetch('http://localhost:3001/restart-tidal', {
        method: 'POST'
      });
      if (response.ok) {
        console.log('TidalCycles restarted');
      }
    } catch (e) {
      console.error('Failed to restart Tidal:', e);
    }
  };

  handleHush = async () => {
    try {
      await fetch('http://localhost:3001/global_ghc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'hush' })
      });
    } catch (e) {
      console.error('Failed to hush:', e);
    }
  };

  handleSetupComplete = (paths) => {
    const { setupStore, pathStore } = this.props;
    setupStore.closeWizard();
    // Update pathStore with new paths
    Object.keys(paths).forEach(key => {
      pathStore.updateValue(key, paths[key]);
    });
    pathStore.save();
  };

  handleSetupSkip = () => {
    this.props.setupStore.skipSetup();
  };

  render() {
    const { setupStore } = this.props;

    return (
      <div className="siren-app">
        {/* Setup Wizard Modal */}
        {setupStore.showWizard && (
          <SetupWizard
            onComplete={this.handleSetupComplete}
            onSkip={this.handleSetupSkip}
          />
        )}

        {/* Main Application */}
        <Route component={MenuBar} />
        <Route component={Home} />

        {/* Status Bar */}
        <StatusBar
          onRestartSc={this.handleRestartSc}
          onRestartTidal={this.handleRestartTidal}
        />
      </div>
    );
  }
}

export default App;
