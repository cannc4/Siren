/**
 * PathDetector - Auto-detect SuperCollider and TidalCycles installations
 *
 * This module scans common installation paths on macOS, Windows, and Linux
 * to automatically configure Siren without manual path entry.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

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
      '/opt/homebrew/bin/scsynth',
      '/usr/local/bin/scsynth'
    ],
    sclang_conf: [
      `${os.homedir()}/Library/Application Support/SuperCollider/sclang_conf.yaml`,
      `${os.homedir()}/.config/SuperCollider/sclang_conf.yaml`
    ],
    ghci: [
      `${os.homedir()}/.ghcup/bin/ghci`,
      '/opt/homebrew/bin/ghci',
      '/usr/local/bin/ghci',
      '/usr/bin/ghci',
      `${os.homedir()}/.local/bin/ghci`
    ],
    stack: [
      `${os.homedir()}/.ghcup/bin/stack`,
      `${os.homedir()}/.local/bin/stack`,
      '/opt/homebrew/bin/stack',
      '/usr/local/bin/stack'
    ],
    cabal: [
      `${os.homedir()}/.ghcup/bin/cabal`,
      `${os.homedir()}/.cabal/bin/cabal`,
      '/opt/homebrew/bin/cabal',
      '/usr/local/bin/cabal'
    ]
  },
  win32: {
    supercollider: [
      'C:\\Program Files\\SuperCollider-3.13.0\\sclang.exe',
      'C:\\Program Files\\SuperCollider-3.12.2\\sclang.exe',
      'C:\\Program Files\\SuperCollider-3.12.1\\sclang.exe',
      'C:\\Program Files\\SuperCollider-3.12.0\\sclang.exe',
      'C:\\Program Files\\SuperCollider-3.11.2\\sclang.exe',
      'C:\\Program Files (x86)\\SuperCollider-3.13.0\\sclang.exe',
      'C:\\Program Files (x86)\\SuperCollider-3.12.2\\sclang.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\SuperCollider\\sclang.exe`,
      `${os.homedir()}\\scoop\\apps\\supercollider\\current\\sclang.exe`
    ],
    scsynth: [
      'C:\\Program Files\\SuperCollider-3.13.0\\scsynth.exe',
      'C:\\Program Files\\SuperCollider-3.12.2\\scsynth.exe',
      'C:\\Program Files\\SuperCollider-3.12.1\\scsynth.exe',
      'C:\\Program Files\\SuperCollider-3.12.0\\scsynth.exe',
      'C:\\Program Files (x86)\\SuperCollider-3.13.0\\scsynth.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\SuperCollider\\scsynth.exe`
    ],
    sclang_conf: [
      `${process.env.LOCALAPPDATA}\\SuperCollider\\sclang_conf.yaml`,
      `${os.homedir()}\\AppData\\Local\\SuperCollider\\sclang_conf.yaml`
    ],
    ghci: [
      `${os.homedir()}\\ghcup\\bin\\ghci.exe`,
      `${process.env.APPDATA}\\ghcup\\bin\\ghci.exe`,
      'C:\\ghcup\\bin\\ghci.exe',
      `${os.homedir()}\\AppData\\Local\\Programs\\stack\\x86_64-windows\\ghc-9.4.8\\bin\\ghci.exe`,
      `${os.homedir()}\\AppData\\Local\\Programs\\stack\\x86_64-windows\\ghc-9.2.8\\bin\\ghci.exe`,
      'C:\\Program Files\\Haskell Platform\\8.10.7\\bin\\ghci.exe',
      'C:\\Program Files\\Haskell\\bin\\ghci.exe'
    ],
    stack: [
      `${os.homedir()}\\ghcup\\bin\\stack.exe`,
      `${process.env.APPDATA}\\ghcup\\bin\\stack.exe`,
      `${process.env.LOCALAPPDATA}\\bin\\stack.exe`,
      'C:\\sr\\stack.exe'
    ],
    cabal: [
      `${os.homedir()}\\ghcup\\bin\\cabal.exe`,
      `${process.env.APPDATA}\\ghcup\\bin\\cabal.exe`,
      `${process.env.APPDATA}\\cabal\\bin\\cabal.exe`
    ]
  },
  linux: {
    supercollider: [
      '/usr/bin/sclang',
      '/usr/local/bin/sclang',
      `${os.homedir()}/.local/bin/sclang`,
      '/opt/supercollider/bin/sclang'
    ],
    scsynth: [
      '/usr/bin/scsynth',
      '/usr/local/bin/scsynth',
      `${os.homedir()}/.local/bin/scsynth`,
      '/opt/supercollider/bin/scsynth'
    ],
    sclang_conf: [
      `${os.homedir()}/.config/SuperCollider/sclang_conf.yaml`,
      `${os.homedir()}/.local/share/SuperCollider/sclang_conf.yaml`
    ],
    ghci: [
      `${os.homedir()}/.ghcup/bin/ghci`,
      '/usr/bin/ghci',
      '/usr/local/bin/ghci',
      `${os.homedir()}/.local/bin/ghci`
    ],
    stack: [
      `${os.homedir()}/.ghcup/bin/stack`,
      `${os.homedir()}/.local/bin/stack`,
      '/usr/bin/stack',
      '/usr/local/bin/stack'
    ],
    cabal: [
      `${os.homedir()}/.ghcup/bin/cabal`,
      `${os.homedir()}/.cabal/bin/cabal`,
      '/usr/bin/cabal',
      '/usr/local/bin/cabal'
    ]
  }
};

class PathDetector {
  constructor() {
    this.platform = process.platform;
    this.searchPaths = SEARCH_PATHS[this.platform] || SEARCH_PATHS.linux;
    this.detectedPaths = {};
    this.validationResults = {};
  }

  /**
   * Detect all required paths
   */
  async detectAll() {
    console.log(`[PathDetector] Detecting paths for platform: ${this.platform}`);

    const results = {
      ghcipath: await this.detectGhci(),
      sclang: await this.detectSclang(),
      scsynth: await this.detectScsynth(),
      sclang_conf: await this.detectSclangConf(),
      tidal_boot: this.getDefaultTidalBoot(),
      scd_start: this.getDefaultScdStart(),
      tidalInstalled: false,
      superDirtInstalled: false
    };

    // Check if Tidal is installed
    if (results.ghcipath) {
      results.tidalInstalled = await this.checkTidalInstalled(results.ghcipath);
    }

    // Check if SuperDirt is installed
    if (results.sclang) {
      results.superDirtInstalled = await this.checkSuperDirtInstalled(results.sclang);
    }

    this.detectedPaths = results;
    return results;
  }

  /**
   * Find first existing path from a list
   */
  findExistingPath(pathList) {
    for (const p of pathList) {
      const expandedPath = this.expandPath(p);
      if (fs.existsSync(expandedPath)) {
        console.log(`[PathDetector] Found: ${expandedPath}`);
        return expandedPath;
      }
    }
    return null;
  }

  /**
   * Expand home directory and environment variables in path
   */
  expandPath(p) {
    if (!p) return p;
    let expanded = p.replace(/^~/, os.homedir());
    // Expand environment variables
    expanded = expanded.replace(/%([^%]+)%/g, (_, varName) => process.env[varName] || '');
    expanded = expanded.replace(/\$([A-Z_]+)/g, (_, varName) => process.env[varName] || '');
    return expanded;
  }

  /**
   * Try to find executable using 'which' or 'where' command
   */
  findInPath(executable) {
    try {
      const cmd = this.platform === 'win32' ? 'where' : 'which';
      const result = execSync(`${cmd} ${executable}`, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      // 'where' on Windows can return multiple lines
      return result.split('\n')[0].trim();
    } catch (e) {
      return null;
    }
  }

  /**
   * Detect GHCi path
   */
  async detectGhci() {
    // First try common paths
    let ghci = this.findExistingPath(this.searchPaths.ghci);

    // Then try PATH
    if (!ghci) {
      ghci = this.findInPath('ghci');
    }

    if (ghci) {
      const valid = await this.validateGhci(ghci);
      if (valid) return ghci;
    }

    return null;
  }

  /**
   * Detect sclang path
   */
  async detectSclang() {
    let sclang = this.findExistingPath(this.searchPaths.supercollider);

    if (!sclang) {
      sclang = this.findInPath('sclang');
    }

    if (sclang) {
      const valid = await this.validateSclang(sclang);
      if (valid) return sclang;
    }

    return null;
  }

  /**
   * Detect scsynth path
   */
  async detectScsynth() {
    let scsynth = this.findExistingPath(this.searchPaths.scsynth);

    if (!scsynth) {
      scsynth = this.findInPath('scsynth');
    }

    // If not found, derive from sclang path
    if (!scsynth && this.detectedPaths.sclang) {
      const sclangDir = path.dirname(this.detectedPaths.sclang);
      const possibleScsynth = path.join(sclangDir, this.platform === 'win32' ? 'scsynth.exe' : 'scsynth');
      if (fs.existsSync(possibleScsynth)) {
        scsynth = possibleScsynth;
      }
      // On macOS, scsynth is in Resources folder
      if (!scsynth && this.platform === 'darwin') {
        const resourcesPath = path.join(sclangDir, '..', 'Resources', 'scsynth');
        if (fs.existsSync(resourcesPath)) {
          scsynth = resourcesPath;
        }
      }
    }

    return scsynth;
  }

  /**
   * Detect sclang_conf.yaml path
   */
  async detectSclangConf() {
    const conf = this.findExistingPath(this.searchPaths.sclang_conf);

    // If not found, we can generate one later
    if (!conf) {
      console.log('[PathDetector] sclang_conf.yaml not found, will generate');
    }

    return conf || this.getDefaultSclangConfPath();
  }

  /**
   * Get default path for sclang_conf.yaml (will be generated if needed)
   */
  getDefaultSclangConfPath() {
    switch (this.platform) {
      case 'darwin':
        return path.join(os.homedir(), 'Library', 'Application Support', 'SuperCollider', 'sclang_conf.yaml');
      case 'win32':
        return path.join(process.env.LOCALAPPDATA || os.homedir(), 'SuperCollider', 'sclang_conf.yaml');
      default:
        return path.join(os.homedir(), '.config', 'SuperCollider', 'sclang_conf.yaml');
    }
  }

  /**
   * Get default Tidal boot file path
   */
  getDefaultTidalBoot() {
    // Check for bundled config first
    const bundledPath = path.join(__dirname, '..', '..', 'config', 'tidal-boot-default.hs');
    if (fs.existsSync(bundledPath)) {
      return bundledPath;
    }
    return './config/tidal-boot-default.hs';
  }

  /**
   * Get default SuperCollider start file path
   */
  getDefaultScdStart() {
    // Check for bundled config first
    const bundledPath = path.join(__dirname, '..', '..', 'config', 'scd-start-default.scd');
    if (fs.existsSync(bundledPath)) {
      return bundledPath;
    }
    return './config/scd-start-default.scd';
  }

  /**
   * Validate GHCi installation
   */
  async validateGhci(ghciPath) {
    return new Promise((resolve) => {
      try {
        const proc = spawn(ghciPath, ['--version'], {
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.on('close', (code) => {
          const valid = code === 0 && output.includes('Glasgow Haskell Compiler');
          this.validationResults.ghci = {
            valid,
            version: output.trim(),
            path: ghciPath
          };
          console.log(`[PathDetector] GHCi validation: ${valid ? 'OK' : 'FAILED'} - ${output.trim()}`);
          resolve(valid);
        });

        proc.on('error', () => {
          this.validationResults.ghci = { valid: false, path: ghciPath };
          resolve(false);
        });
      } catch (e) {
        this.validationResults.ghci = { valid: false, error: e.message };
        resolve(false);
      }
    });
  }

  /**
   * Validate sclang installation
   */
  async validateSclang(sclangPath) {
    return new Promise((resolve) => {
      try {
        // On some systems, sclang --version doesn't work, so we just check if it exists and is executable
        if (fs.existsSync(sclangPath)) {
          try {
            fs.accessSync(sclangPath, fs.constants.X_OK);
            this.validationResults.sclang = {
              valid: true,
              path: sclangPath
            };
            console.log(`[PathDetector] sclang validation: OK - ${sclangPath}`);
            resolve(true);
          } catch {
            // On Windows, X_OK might fail, but the file exists
            if (this.platform === 'win32') {
              this.validationResults.sclang = { valid: true, path: sclangPath };
              resolve(true);
            } else {
              resolve(false);
            }
          }
        } else {
          resolve(false);
        }
      } catch (e) {
        this.validationResults.sclang = { valid: false, error: e.message };
        resolve(false);
      }
    });
  }

  /**
   * Check if TidalCycles is installed
   */
  async checkTidalInstalled(ghciPath) {
    return new Promise((resolve) => {
      try {
        const proc = spawn(ghciPath, ['-e', ':m Sound.Tidal.Context', '-e', ':q'], {
          timeout: 30000,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderr = '';
        proc.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        proc.on('close', (code) => {
          // Check if module was found (no "Could not find module" error)
          const notFound = stderr.includes('Could not find module') ||
                          stderr.includes('cannot find module');
          const installed = !notFound;
          console.log(`[PathDetector] TidalCycles installed: ${installed}`);
          resolve(installed);
        });

        proc.on('error', () => {
          resolve(false);
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Check if SuperDirt is installed in SuperCollider
   */
  async checkSuperDirtInstalled(sclangPath) {
    // This is a lightweight check - just look for SuperDirt in the quarks folder
    const quarksPaths = {
      darwin: [
        path.join(os.homedir(), 'Library', 'Application Support', 'SuperCollider', 'downloaded-quarks', 'SuperDirt'),
        path.join(os.homedir(), '.local', 'share', 'SuperCollider', 'downloaded-quarks', 'SuperDirt')
      ],
      win32: [
        path.join(process.env.LOCALAPPDATA || '', 'SuperCollider', 'downloaded-quarks', 'SuperDirt'),
        path.join(os.homedir(), 'AppData', 'Local', 'SuperCollider', 'downloaded-quarks', 'SuperDirt')
      ],
      linux: [
        path.join(os.homedir(), '.local', 'share', 'SuperCollider', 'downloaded-quarks', 'SuperDirt'),
        path.join(os.homedir(), '.config', 'SuperCollider', 'downloaded-quarks', 'SuperDirt')
      ]
    };

    const paths = quarksPaths[this.platform] || quarksPaths.linux;

    for (const p of paths) {
      if (fs.existsSync(p)) {
        console.log(`[PathDetector] SuperDirt found at: ${p}`);
        return true;
      }
    }

    console.log('[PathDetector] SuperDirt not found');
    return false;
  }

  /**
   * Generate sclang_conf.yaml if it doesn't exist
   */
  generateSclangConf(targetPath) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const config = `# SuperCollider sclang configuration
# Generated by Siren

includePaths: []
excludePaths: []
postInlineWarnings: false
`;

    fs.writeFileSync(targetPath, config);
    console.log(`[PathDetector] Generated sclang_conf.yaml at: ${targetPath}`);
    return targetPath;
  }

  /**
   * Get installation instructions for missing dependencies
   */
  getInstallInstructions() {
    const instructions = {
      supercollider: {
        darwin: 'Download from https://supercollider.github.io/downloads or `brew install supercollider`',
        win32: 'Download from https://supercollider.github.io/downloads',
        linux: 'Install via package manager: `sudo apt install supercollider` or download from https://supercollider.github.io/downloads'
      },
      tidal: {
        darwin: 'Install ghcup from https://www.haskell.org/ghcup/ then run: `cabal install tidal`',
        win32: 'Install ghcup from https://www.haskell.org/ghcup/ then run: `cabal install tidal`',
        linux: 'Install ghcup from https://www.haskell.org/ghcup/ then run: `cabal install tidal`'
      },
      superDirt: {
        all: 'In SuperCollider, run: Quarks.install("SuperDirt"); then recompile (Ctrl+Shift+L / Cmd+Shift+L)'
      }
    };

    return {
      supercollider: instructions.supercollider[this.platform] || instructions.supercollider.linux,
      tidal: instructions.tidal[this.platform] || instructions.tidal.linux,
      superDirt: instructions.superDirt.all
    };
  }

  /**
   * Get a summary of detected paths and their status
   */
  getSummary() {
    return {
      platform: this.platform,
      paths: this.detectedPaths,
      validation: this.validationResults,
      instructions: this.getInstallInstructions(),
      ready: Boolean(
        this.detectedPaths.ghcipath &&
        this.detectedPaths.sclang &&
        this.detectedPaths.tidalInstalled &&
        this.detectedPaths.superDirtInstalled
      )
    };
  }
}

module.exports = PathDetector;
