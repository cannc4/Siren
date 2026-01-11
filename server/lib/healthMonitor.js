/**
 * HealthMonitor - Monitor the health of SuperCollider and TidalCycles processes
 *
 * Provides real-time status updates and automatic recovery for crashed processes.
 */

const EventEmitter = require('events');

class HealthMonitor extends EventEmitter {
  constructor() {
    super();
    this.status = {
      scsynth: { status: 'stopped', pid: null, cpu: 0, memory: 0 },
      sclang: { status: 'stopped', pid: null },
      ghci: { status: 'stopped', pid: null, memory: 0 },
      audio: { status: 'unknown', device: null, sampleRate: null }
    };
    this.processes = {};
    this.checkInterval = null;
    this.restartAttempts = {};
    this.maxRestartAttempts = 3;
    this.restartDelay = 2000; // ms
  }

  /**
   * Register a process to monitor
   */
  registerProcess(name, process, options = {}) {
    this.processes[name] = { process, options };
    this.restartAttempts[name] = 0;

    this.status[name] = {
      status: 'running',
      pid: process.pid,
      startTime: Date.now()
    };

    // Monitor process exit
    process.on('exit', (code, signal) => {
      console.log(`[HealthMonitor] ${name} exited with code ${code}, signal ${signal}`);
      this.status[name].status = 'stopped';
      this.status[name].exitCode = code;
      this.status[name].exitSignal = signal;

      this.emit('process-exit', { name, code, signal });

      // Attempt restart if configured and not intentional
      if (options.autoRestart && code !== 0 && !this.intentionalStop) {
        this.attemptRestart(name);
      }
    });

    process.on('error', (err) => {
      console.error(`[HealthMonitor] ${name} error:`, err);
      this.status[name].status = 'error';
      this.status[name].error = err.message;
      this.emit('process-error', { name, error: err });
    });

    this.emit('process-registered', { name, pid: process.pid });
  }

  /**
   * Attempt to restart a crashed process
   */
  async attemptRestart(name) {
    if (this.restartAttempts[name] >= this.maxRestartAttempts) {
      console.error(`[HealthMonitor] ${name} exceeded max restart attempts`);
      this.emit('restart-failed', { name, attempts: this.restartAttempts[name] });
      return false;
    }

    this.restartAttempts[name]++;
    console.log(`[HealthMonitor] Attempting to restart ${name} (attempt ${this.restartAttempts[name]})`);

    this.status[name].status = 'restarting';
    this.emit('process-restarting', { name, attempt: this.restartAttempts[name] });

    // Wait before restart
    await new Promise(resolve => setTimeout(resolve, this.restartDelay));

    // Emit event for the application to handle the actual restart
    this.emit('restart-requested', { name });

    return true;
  }

  /**
   * Reset restart attempts for a process
   */
  resetRestartAttempts(name) {
    this.restartAttempts[name] = 0;
  }

  /**
   * Update audio status
   */
  updateAudioStatus(status) {
    this.status.audio = {
      ...this.status.audio,
      ...status
    };
    this.emit('audio-status-changed', this.status.audio);
  }

  /**
   * Update process metrics
   */
  updateMetrics(name, metrics) {
    if (this.status[name]) {
      this.status[name] = {
        ...this.status[name],
        ...metrics,
        lastUpdate: Date.now()
      };
    }
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(interval = 5000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, interval);

    console.log(`[HealthMonitor] Started monitoring with ${interval}ms interval`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.intentionalStop = true;
    console.log('[HealthMonitor] Stopped monitoring');
  }

  /**
   * Perform health check on all registered processes
   */
  performHealthCheck() {
    const issues = [];

    for (const [name, { process }] of Object.entries(this.processes)) {
      if (!process || process.killed) {
        if (this.status[name].status === 'running') {
          this.status[name].status = 'stopped';
          issues.push({ name, issue: 'Process not running' });
        }
      } else {
        // Check if process is responsive (for processes that support it)
        this.status[name].status = 'running';
        this.status[name].uptime = Date.now() - (this.status[name].startTime || Date.now());
      }
    }

    if (issues.length > 0) {
      this.emit('health-issues', issues);
    }

    this.emit('health-check', this.getStatus());
  }

  /**
   * Get current status of all monitored components
   */
  getStatus() {
    return {
      ...this.status,
      overall: this.getOverallStatus(),
      timestamp: Date.now()
    };
  }

  /**
   * Determine overall system health status
   */
  getOverallStatus() {
    const criticalProcesses = ['sclang', 'ghci'];
    let hasError = false;
    let hasWarning = false;

    for (const name of criticalProcesses) {
      const status = this.status[name]?.status;
      if (status === 'error' || status === 'stopped') {
        hasError = true;
      } else if (status === 'restarting') {
        hasWarning = true;
      }
    }

    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    return 'healthy';
  }

  /**
   * Unregister a process
   */
  unregisterProcess(name) {
    delete this.processes[name];
    delete this.restartAttempts[name];
  }

  /**
   * Clean up all resources
   */
  destroy() {
    this.stopMonitoring();
    this.processes = {};
    this.removeAllListeners();
  }
}

module.exports = HealthMonitor;
