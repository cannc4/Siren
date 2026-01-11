import { observable, action, makeObservable } from 'mobx';
import request from '../utils/request';

class SetupStore {
  @observable setupCompleted = false;
  @observable showWizard = false;
  @observable isDetecting = false;
  @observable detectedPaths = {
    ghcipath: '',
    sclang: '',
    scsynth: '',
    sclang_conf: '',
    tidal_boot: './config/tidal-boot-default.hs',
    scd_start: './config/scd-start-default.scd'
  };
  @observable status = {
    ghci: 'unknown',
    sclang: 'unknown',
    tidal: 'unknown',
    superDirt: 'unknown'
  };
  @observable healthStatus = {
    sclang: 'stopped',
    ghci: 'stopped',
    connected: false
  };

  constructor() {
    makeObservable(this);
    this.checkSetupStatus();
  }

  @action
  async checkSetupStatus() {
    // Check if running in Electron with stored setup status
    if (window.electronAPI) {
      try {
        const completed = await window.electronAPI.getSetupCompleted();
        this.setupCompleted = completed;
        if (!completed) {
          this.showWizard = true;
        }
      } catch (e) {
        console.log('Not running in Electron or API unavailable');
        this.checkPathsConfigured();
      }
    } else {
      this.checkPathsConfigured();
    }
  }

  @action
  async checkPathsConfigured() {
    try {
      const response = await request.get('http://localhost:3001/paths');
      if (response.data && response.data.paths) {
        const paths = response.data.paths;
        // Check if critical paths are configured
        if (paths.ghcipath && paths.sclang) {
          this.setupCompleted = true;
          this.detectedPaths = paths;
        } else {
          this.showWizard = true;
        }
      } else {
        this.showWizard = true;
      }
    } catch (e) {
      console.log('Could not check paths:', e);
      // Don't show wizard if server is not running yet
    }
  }

  @action
  async detectPaths() {
    this.isDetecting = true;
    try {
      const response = await request.post('http://localhost:3001/detect-paths');
      if (response.data) {
        this.detectedPaths = {
          ...this.detectedPaths,
          ghcipath: response.data.ghcipath || '',
          sclang: response.data.sclang || '',
          scsynth: response.data.scsynth || '',
          sclang_conf: response.data.sclang_conf || ''
        };
        this.status = {
          ghci: response.data.ghcipath ? 'found' : 'missing',
          sclang: response.data.sclang ? 'found' : 'missing',
          tidal: response.data.tidalInstalled ? 'found' : 'missing',
          superDirt: response.data.superDirtInstalled ? 'found' : 'missing'
        };
      }
    } catch (e) {
      console.error('Path detection failed:', e);
    }
    this.isDetecting = false;
  }

  @action
  async savePaths(paths) {
    try {
      await request.post('http://localhost:3001/paths', { paths });
      this.detectedPaths = paths;
      this.setupCompleted = true;
      this.showWizard = false;

      if (window.electronAPI) {
        await window.electronAPI.setSetupCompleted(true);
      }

      return true;
    } catch (e) {
      console.error('Failed to save paths:', e);
      return false;
    }
  }

  @action
  openWizard() {
    this.showWizard = true;
  }

  @action
  closeWizard() {
    this.showWizard = false;
  }

  @action
  skipSetup() {
    this.showWizard = false;
  }

  @action
  async pollHealthStatus() {
    try {
      const response = await request.get('http://localhost:3001/health');
      if (response.data) {
        this.healthStatus = {
          sclang: response.data.sclang || 'stopped',
          ghci: response.data.ghci || 'stopped',
          connected: true
        };
      }
    } catch (e) {
      this.healthStatus.connected = false;
    }
  }

  @action
  updateHealthStatus(status) {
    this.healthStatus = { ...this.healthStatus, ...status };
  }
}

export default new SetupStore();
