import { makeAutoObservable, runInAction } from 'mobx';
import request from '../utils/request';

class SetupStore {
    setupCompleted = false;
    showWizard = false;
    isDetecting = false;
    detectedPaths = {
        ghcipath: '', sclang: '', scsynth: '', sclang_conf: '',
        tidal_boot: './config/tidal-boot-default.hs',
        scd_start: './config/scd-start-default.scd'
    };
    status = { ghci: 'unknown', sclang: 'unknown', tidal: 'unknown', superDirt: 'unknown' };
    healthStatus = { sclang: 'stopped', ghci: 'stopped', connected: false };

    constructor() {
        makeAutoObservable(this);
        this.checkSetupStatus();
    }

    async checkSetupStatus() {
        if (window.electronAPI) {
            try {
                const completed = await window.electronAPI.getSetupCompleted();
                runInAction(() => {
                    this.setupCompleted = completed;
                    if (!completed) this.showWizard = true;
                });
            } catch (e) {
                console.log('Not running in Electron or API unavailable');
                this.checkPathsConfigured();
            }
        } else {
            this.checkPathsConfigured();
        }
    }

    async checkPathsConfigured() {
        try {
            const response = await request.get('http://localhost:3001/paths');
            runInAction(() => {
                if (response.data && response.data.paths) {
                    const paths = response.data.paths;
                    if (paths.ghcipath && paths.sclang) {
                        this.setupCompleted = true;
                        this.detectedPaths = paths;
                    } else this.showWizard = true;
                } else this.showWizard = true;
            });
        } catch (e) {
            console.log('Could not check paths:', e);
        }
    }

    async detectPaths() {
        this.isDetecting = true;
        try {
            const response = await request.post('http://localhost:3001/detect-paths');
            runInAction(() => {
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
                this.isDetecting = false;
            });
        } catch (e) {
            console.error('Path detection failed:', e);
            runInAction(() => { this.isDetecting = false; });
        }
    }

    async savePaths(paths) {
        try {
            await request.post('http://localhost:3001/paths', { paths });
            runInAction(() => {
                this.detectedPaths = paths;
                this.setupCompleted = true;
                this.showWizard = false;
            });
            if (window.electronAPI) await window.electronAPI.setSetupCompleted(true);
            return true;
        } catch (e) {
            console.error('Failed to save paths:', e);
            return false;
        }
    }

    openWizard() { this.showWizard = true; }
    closeWizard() { this.showWizard = false; }
    skipSetup() { this.showWizard = false; }

    async pollHealthStatus() {
        try {
            const response = await request.get('http://localhost:3001/health');
            runInAction(() => {
                if (response.data) {
                    this.healthStatus = {
                        sclang: response.data.sclang || 'stopped',
                        ghci: response.data.ghci || 'stopped',
                        connected: true
                    };
                }
            });
        } catch (e) {
            runInAction(() => { this.healthStatus.connected = false; });
        }
    }

    updateHealthStatus(status) {
        this.healthStatus = { ...this.healthStatus, ...status };
    }
}

export default new SetupStore();
