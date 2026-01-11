/**
 * ProcessManager - Manage SuperCollider and TidalCycles processes
 *
 * Handles spawning, stopping, and restarting of audio processes
 * with proper error handling and cleanup.
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const HealthMonitor = require('./healthMonitor');

class ProcessManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.processes = {
      ghci: null,
      sclang: null
    };
    this.healthMonitor = new HealthMonitor();
    this.initialized = false;

    // Forward health monitor events
    this.healthMonitor.on('process-exit', (data) => this.emit('process-exit', data));
    this.healthMonitor.on('process-error', (data) => this.emit('process-error', data));
    this.healthMonitor.on('restart-requested', (data) => this.handleRestartRequest(data));
    this.healthMonitor.on('health-check', (status) => this.emit('health-status', status));
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start all processes
   */
  async startAll() {
    console.log('[ProcessManager] Starting all processes...');

    try {
      // Start SuperCollider first
      await this.startSuperCollider();

      // Wait a bit for SC to initialize
      await this.delay(2000);

      // Start TidalCycles
      await this.startTidal();

      this.initialized = true;
      this.healthMonitor.startMonitoring();

      this.emit('all-started');
      return { success: true };
    } catch (error) {
      console.error('[ProcessManager] Failed to start processes:', error);
      this.emit('start-error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start SuperCollider (sclang)
   */
  async startSuperCollider() {
    const { sclang, scsynth, sclang_conf, scd_start } = this.config;

    if (!sclang || !fs.existsSync(sclang)) {
      throw new Error(`sclang not found at: ${sclang}`);
    }

    console.log('[ProcessManager] Starting SuperCollider...');

    return new Promise((resolve, reject) => {
      const args = [];

      // Add config file if specified
      if (sclang_conf && fs.existsSync(sclang_conf)) {
        args.push('-l', sclang_conf);
      }

      this.processes.sclang = spawn(sclang, args, {
        env: {
          ...process.env,
          SC_JACK_DEFAULT_OUTPUTS: 'system:playback_1,system:playback_2'
        }
      });

      this.healthMonitor.registerProcess('sclang', this.processes.sclang, {
        autoRestart: true
      });

      let startupComplete = false;

      this.processes.sclang.stdout.on('data', (data) => {
        const output = data.toString();
        this.emit('sclang-output', output);

        // Detect successful startup
        if (output.includes('Welcome to SuperCollider') || output.includes('sclang: ')) {
          if (!startupComplete) {
            startupComplete = true;
            console.log('[ProcessManager] SuperCollider started successfully');

            // Load startup file if provided
            if (scd_start && fs.existsSync(scd_start)) {
              this.loadScdFile(scd_start);
            }

            resolve();
          }
        }
      });

      this.processes.sclang.stderr.on('data', (data) => {
        const output = data.toString();
        this.emit('sclang-error', output);
        console.error('[ProcessManager] sclang stderr:', output);
      });

      this.processes.sclang.on('error', (err) => {
        console.error('[ProcessManager] sclang spawn error:', err);
        if (!startupComplete) {
          reject(err);
        }
      });

      // Timeout for startup
      setTimeout(() => {
        if (!startupComplete) {
          startupComplete = true;
          console.log('[ProcessManager] SuperCollider startup timeout, continuing...');
          resolve();
        }
      }, 10000);
    });
  }

  /**
   * Load a SuperCollider file
   */
  loadScdFile(filePath) {
    if (this.processes.sclang && !this.processes.sclang.killed) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        this.sendToSclang(content);
        console.log('[ProcessManager] Loaded SC file:', filePath);
      } catch (err) {
        console.error('[ProcessManager] Failed to load SC file:', err);
      }
    }
  }

  /**
   * Send code to sclang
   */
  sendToSclang(code) {
    if (this.processes.sclang && !this.processes.sclang.killed) {
      // SuperCollider interprets code when it receives newlines followed by special commands
      // We wrap in parentheses and use Ctrl+D equivalent
      this.processes.sclang.stdin.write(code + '\n');
      this.processes.sclang.stdin.write('\x0c'); // Form feed to execute
    }
  }

  /**
   * Start TidalCycles (GHCi)
   */
  async startTidal() {
    const { ghcipath, tidal_boot } = this.config;

    if (!ghcipath || !fs.existsSync(ghcipath)) {
      throw new Error(`GHCi not found at: ${ghcipath}`);
    }

    console.log('[ProcessManager] Starting TidalCycles...');

    return new Promise((resolve, reject) => {
      this.processes.ghci = spawn(ghcipath, ['-XOverloadedStrings'], {
        env: process.env
      });

      this.healthMonitor.registerProcess('ghci', this.processes.ghci, {
        autoRestart: true
      });

      let startupComplete = false;

      this.processes.ghci.stdout.on('data', (data) => {
        const output = data.toString();
        this.emit('ghci-output', output);

        // Detect GHCi prompt
        if (output.includes('Prelude>') || output.includes('GHCi,')) {
          if (!startupComplete) {
            startupComplete = true;
            console.log('[ProcessManager] GHCi started, loading Tidal boot file...');

            // Load Tidal boot file
            if (tidal_boot && fs.existsSync(tidal_boot)) {
              this.loadTidalBoot(tidal_boot);
            }

            resolve();
          }
        }
      });

      this.processes.ghci.stderr.on('data', (data) => {
        const output = data.toString();
        this.emit('ghci-error', output);
        // GHCi uses stderr for various output, not just errors
        console.log('[ProcessManager] ghci stderr:', output);
      });

      this.processes.ghci.on('error', (err) => {
        console.error('[ProcessManager] ghci spawn error:', err);
        if (!startupComplete) {
          reject(err);
        }
      });

      // Timeout for startup
      setTimeout(() => {
        if (!startupComplete) {
          startupComplete = true;
          console.log('[ProcessManager] GHCi startup timeout, continuing...');
          resolve();
        }
      }, 15000);
    });
  }

  /**
   * Load Tidal boot file
   */
  loadTidalBoot(filePath) {
    if (this.processes.ghci && !this.processes.ghci.killed) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Send each line to GHCi
        for (const line of lines) {
          if (line.trim()) {
            this.sendToGhci(line);
          }
        }

        console.log('[ProcessManager] Loaded Tidal boot file:', filePath);
      } catch (err) {
        console.error('[ProcessManager] Failed to load Tidal boot file:', err);
      }
    }
  }

  /**
   * Send expression to GHCi
   */
  sendToGhci(expression) {
    if (this.processes.ghci && !this.processes.ghci.killed) {
      this.processes.ghci.stdin.write(expression + '\n');
    }
  }

  /**
   * Send Tidal expression (wrapped in :{ :})
   */
  sendTidalExpression(expression) {
    this.sendToGhci(':{\n' + expression + '\n:}');
  }

  /**
   * Hush all sounds
   */
  hush() {
    this.sendTidalExpression('hush');
  }

  /**
   * Handle restart request from health monitor
   */
  async handleRestartRequest({ name }) {
    console.log(`[ProcessManager] Handling restart request for ${name}`);

    try {
      if (name === 'sclang') {
        await this.restartSuperCollider();
      } else if (name === 'ghci') {
        await this.restartTidal();
      }

      this.healthMonitor.resetRestartAttempts(name);
      this.emit('process-restarted', { name });
    } catch (err) {
      console.error(`[ProcessManager] Failed to restart ${name}:`, err);
      this.emit('restart-failed', { name, error: err.message });
    }
  }

  /**
   * Restart SuperCollider
   */
  async restartSuperCollider() {
    console.log('[ProcessManager] Restarting SuperCollider...');
    this.stopSuperCollider();
    await this.delay(1000);
    await this.startSuperCollider();
  }

  /**
   * Restart TidalCycles
   */
  async restartTidal() {
    console.log('[ProcessManager] Restarting TidalCycles...');
    this.stopTidal();
    await this.delay(1000);
    await this.startTidal();
  }

  /**
   * Stop SuperCollider
   */
  stopSuperCollider() {
    if (this.processes.sclang) {
      console.log('[ProcessManager] Stopping SuperCollider...');
      this.sendToSclang('0.exit;');
      setTimeout(() => {
        if (this.processes.sclang && !this.processes.sclang.killed) {
          this.processes.sclang.kill();
        }
      }, 1000);
      this.healthMonitor.unregisterProcess('sclang');
      this.processes.sclang = null;
    }
  }

  /**
   * Stop TidalCycles
   */
  stopTidal() {
    if (this.processes.ghci) {
      console.log('[ProcessManager] Stopping TidalCycles...');
      this.sendToGhci(':q');
      setTimeout(() => {
        if (this.processes.ghci && !this.processes.ghci.killed) {
          this.processes.ghci.kill();
        }
      }, 1000);
      this.healthMonitor.unregisterProcess('ghci');
      this.processes.ghci = null;
    }
  }

  /**
   * Stop all processes
   */
  stopAll() {
    console.log('[ProcessManager] Stopping all processes...');
    this.healthMonitor.stopMonitoring();
    this.stopTidal();
    this.stopSuperCollider();
    this.initialized = false;
    this.emit('all-stopped');
  }

  /**
   * Get current status
   */
  getStatus() {
    return this.healthMonitor.getStatus();
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up
   */
  destroy() {
    this.stopAll();
    this.healthMonitor.destroy();
    this.removeAllListeners();
  }
}

module.exports = ProcessManager;
