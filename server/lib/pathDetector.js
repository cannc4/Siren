/**
 * PathDetector - Auto-detect SuperCollider and TidalCycles installations
 * Checks bundled versions first, then system installations
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Get the app root directory (handles both dev and packaged)
function getAppRoot() {
  // In packaged app, resources are in process.resourcesPath
  if (process.resourcesPath) {
    return process.resourcesPath;
  }
  // In development, use the project root
  return path.join(__dirname, '..', '..');
}

// Get bundled vendor path
function getBundledPath() {
  const appRoot = getAppRoot();
  const platform = process.platform;
  const arch = process.arch;

  // Check packaged location first
  const packagedVendor = path.join(appRoot, 'vendor');
  if (fs.existsSync(packagedVendor)) {
    return packagedVendor;
  }

  // Development location
  return path.join(appRoot, 'vendor', platform, arch);
}

// Platform-specific search paths
const SEARCH_PATHS = {
  darwin: {
    supercollider: [
      '/Applications/SuperCollider.app/Contents/MacOS/sclang',
      '/Applications/SuperCollider.app/Contents/Resources/sclang',
      `${os.homedir()}/Applications/SuperCollider.app/Contents/MacOS/sclang`,
      '/opt/homebrew/bin/sclang',
      '/usr/local/bin/sclang'
    ],
    scsynth: [
      '/Applications/SuperCollider.app/Contents/Resources/scsynth',
      `${os.homedir()}/Applications/SuperCollider.app/Contents/Resources/scsynth`,
      '/opt/homebrew/bin/scsynth'
    ],
    sclang_conf: [
      `${os.homedir()}/Library/Application Support/SuperCollider/sclang_conf.yaml`
    ],
    ghci: [
      `${os.homedir()}/.ghcup/bin/ghci`,
      '/opt/homebrew/bin/ghci',
      '/usr/local/bin/ghci'
    ]
  },
  win32: {
    supercollider: [
      'C:\\Program Files\\SuperCollider-3.13.0\\sclang.exe',
      'C:\\Program Files\\SuperCollider-3.12.2\\sclang.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\SuperCollider\\sclang.exe`
    ],
    scsynth: [
      'C:\\Program Files\\SuperCollider-3.13.0\\scsynth.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\SuperCollider\\scsynth.exe`
    ],
    sclang_conf: [
      `${process.env.LOCALAPPDATA}\\SuperCollider\\sclang_conf.yaml`
    ],
    ghci: [
      `${os.homedir()}\\ghcup\\bin\\ghci.exe`,
      `${process.env.APPDATA}\\ghcup\\bin\\ghci.exe`,
      'C:\\ghcup\\bin\\ghci.exe'
    ]
  },
  linux: {
    supercollider: ['/usr/bin/sclang', '/usr/local/bin/sclang'],
    scsynth: ['/usr/bin/scsynth', '/usr/local/bin/scsynth'],
    sclang_conf: [`${os.homedir()}/.config/SuperCollider/sclang_conf.yaml`],
    ghci: [`${os.homedir()}/.ghcup/bin/ghci`, '/usr/bin/ghci']
  }
};

class PathDetector {
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;
    this.searchPaths = SEARCH_PATHS[this.platform] || SEARCH_PATHS.linux;
    this.detectedPaths = {};
    this.bundledPath = getBundledPath();
  }

  /**
   * Check for bundled SuperCollider
   */
  getBundledSuperCollider() {
    const scDir = path.join(this.bundledPath, 'supercollider');

    if (this.platform === 'darwin') {
      const appPath = path.join(scDir, 'SuperCollider.app', 'Contents', 'MacOS', 'sclang');
      if (fs.existsSync(appPath)) return appPath;
    } else if (this.platform === 'win32') {
      // Windows ZIP extracts to a subdirectory
      const patterns = [
        path.join(scDir, 'sclang.exe'),
        path.join(scDir, 'SuperCollider-*', 'sclang.exe')
      ];
      for (const p of patterns) {
        if (p.includes('*')) {
          const dir = path.dirname(p);
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              const full = path.join(dir, f, 'sclang.exe');
              if (fs.existsSync(full)) return full;
            }
          }
        } else if (fs.existsSync(p)) return p;
      }
    } else if (this.platform === 'linux') {
      // Linux uses AppImage wrapper
      const wrapper = path.join(scDir, 'sclang');
      if (fs.existsSync(wrapper)) return wrapper;
    }
    return null;
  }

  /**
   * Check for bundled scsynth
   */
  getBundledScsynth() {
    const scDir = path.join(this.bundledPath, 'supercollider');

    if (this.platform === 'darwin') {
      const appPath = path.join(scDir, 'SuperCollider.app', 'Contents', 'Resources', 'scsynth');
      if (fs.existsSync(appPath)) return appPath;
    } else if (this.platform === 'win32') {
      const patterns = [
        path.join(scDir, 'scsynth.exe'),
        path.join(scDir, 'SuperCollider-*', 'scsynth.exe')
      ];
      for (const p of patterns) {
        if (p.includes('*')) {
          const dir = path.dirname(p);
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              const full = path.join(dir, f, 'scsynth.exe');
              if (fs.existsSync(full)) return full;
            }
          }
        } else if (fs.existsSync(p)) return p;
      }
    } else if (this.platform === 'linux') {
      const wrapper = path.join(scDir, 'scsynth');
      if (fs.existsSync(wrapper)) return wrapper;
    }
    return null;
  }

  /**
   * Detect all required paths - bundled first, then system
   */
  async detectAll() {
    console.log(`[PathDetector] Platform: ${this.platform}-${this.arch}`);
    console.log(`[PathDetector] Bundled path: ${this.bundledPath}`);

    // Check bundled SC first
    let sclang = this.getBundledSuperCollider();
    let scsynth = this.getBundledScsynth();

    if (sclang) {
      console.log(`[PathDetector] Using bundled SuperCollider: ${sclang}`);
    } else {
      // Fall back to system installation
      sclang = this.findExisting(this.searchPaths.supercollider) || this.findInPath('sclang');
      scsynth = this.findExisting(this.searchPaths.scsynth) || this.findInPath('scsynth');
    }

    // Check for GHCi (system only - TidalCycles can't really be bundled)
    let ghci = this.findExisting(this.searchPaths.ghci) || this.findInPath('ghci');

    const results = {
      ghcipath: ghci,
      sclang: sclang,
      scsynth: scsynth || this.deriveScsynth(sclang),
      sclang_conf: this.findExisting(this.searchPaths.sclang_conf) || this.getDefaultSclangConfPath(),
      tidal_boot: this.getConfigPath('tidal-boot-default.hs'),
      scd_start: this.getConfigPath('scd-start-default.scd'),
      tidalInstalled: false,
      superDirtInstalled: false,
      bundledSC: !!this.getBundledSuperCollider(),
      tidalInstallerPath: this.getTidalInstallerPath()
    };

    // Check installations
    if (ghci) results.tidalInstalled = await this.checkTidalInstalled(ghci);
    if (sclang) results.superDirtInstalled = await this.checkSuperDirtInstalled();

    this.detectedPaths = results;
    return results;
  }

  findExisting(pathList) {
    for (const p of pathList || []) {
      const expanded = p.replace(/^~/, os.homedir());
      if (fs.existsSync(expanded)) {
        console.log(`[PathDetector] Found: ${expanded}`);
        return expanded;
      }
    }
    return null;
  }

  findInPath(exe) {
    try {
      const cmd = this.platform === 'win32' ? 'where' : 'which';
      return execSync(`${cmd} ${exe}`, { encoding: 'utf8', timeout: 5000 }).trim().split('\n')[0];
    } catch { return null; }
  }

  deriveScsynth(sclangPath) {
    if (!sclangPath) return null;
    const dir = path.dirname(sclangPath);
    const exe = this.platform === 'win32' ? 'scsynth.exe' : 'scsynth';

    // Same directory
    let p = path.join(dir, exe);
    if (fs.existsSync(p)) return p;

    // macOS Resources folder
    if (this.platform === 'darwin') {
      p = path.join(dir, '..', 'Resources', 'scsynth');
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  getDefaultSclangConfPath() {
    const paths = {
      darwin: path.join(os.homedir(), 'Library', 'Application Support', 'SuperCollider', 'sclang_conf.yaml'),
      win32: path.join(process.env.LOCALAPPDATA || os.homedir(), 'SuperCollider', 'sclang_conf.yaml'),
      linux: path.join(os.homedir(), '.config', 'SuperCollider', 'sclang_conf.yaml')
    };
    return paths[this.platform] || paths.linux;
  }

  getConfigPath(filename) {
    // Check packaged resources first
    const appRoot = getAppRoot();
    const resourceConfig = path.join(appRoot, 'config', filename);
    if (fs.existsSync(resourceConfig)) return resourceConfig;

    // Development path
    const devConfig = path.join(__dirname, '..', '..', 'config', filename);
    if (fs.existsSync(devConfig)) return devConfig;

    return `./config/${filename}`;
  }

  getTidalInstallerPath() {
    const ext = this.platform === 'win32' ? '.ps1' : '.sh';
    const installerPath = path.join(this.bundledPath, `install-tidal${ext}`);
    return fs.existsSync(installerPath) ? installerPath : null;
  }

  async checkTidalInstalled(ghciPath) {
    return new Promise((resolve) => {
      try {
        const proc = spawn(ghciPath, ['-e', ':m Sound.Tidal.Context', '-e', ':q'], {
          timeout: 30000, stdio: ['pipe', 'pipe', 'pipe']
        });
        let stderr = '';
        proc.stderr.on('data', (d) => { stderr += d.toString(); });
        proc.on('close', () => {
          const installed = !stderr.includes('Could not find module') && !stderr.includes('cannot find module');
          console.log(`[PathDetector] TidalCycles: ${installed ? 'installed' : 'not found'}`);
          resolve(installed);
        });
        proc.on('error', () => resolve(false));
      } catch { resolve(false); }
    });
  }

  async checkSuperDirtInstalled() {
    const quarksPaths = {
      darwin: path.join(os.homedir(), 'Library', 'Application Support', 'SuperCollider', 'downloaded-quarks', 'SuperDirt'),
      win32: path.join(process.env.LOCALAPPDATA || '', 'SuperCollider', 'downloaded-quarks', 'SuperDirt'),
      linux: path.join(os.homedir(), '.local', 'share', 'SuperCollider', 'downloaded-quarks', 'SuperDirt')
    };
    const p = quarksPaths[this.platform];
    const installed = p && fs.existsSync(p);
    console.log(`[PathDetector] SuperDirt: ${installed ? 'installed' : 'not found'}`);
    return installed;
  }

  getSummary() {
    return {
      platform: this.platform,
      arch: this.arch,
      paths: this.detectedPaths,
      ready: Boolean(
        this.detectedPaths.ghcipath &&
        this.detectedPaths.sclang &&
        this.detectedPaths.tidalInstalled
      )
    };
  }
}

module.exports = PathDetector;
