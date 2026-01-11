# Siren Packaging Plan: Standalone Desktop Application

## Executive Summary

Transform Siren from a developer-focused project requiring manual setup into a **one-click installable application** that bundles TidalCycles, SuperCollider, and all dependencies.

---

## Current State Analysis

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        ELECTRON SHELL                           │
│  ┌───────────────────────┐    ┌───────────────────────────────┐ │
│  │   React Frontend      │    │     Node.js Backend           │ │
│  │   (localhost:3000)    │◄──►│     (localhost:3001)          │ │
│  │                       │    │                               │ │
│  │  - Grid Sequencer     │    │  - Express API                │ │
│  │  - Pattern Editor     │    │  - Socket.io (4001-4003)      │ │
│  │  - Consoles           │    │  - Pattern Queue              │ │
│  └───────────────────────┘    └───────────┬───────────────────┘ │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
          │  GHCi Process   │       │  sclang Process │       │  Ableton Link   │
          │  (TidalCycles)  │       │  (SuperCollider)│       │  (Tempo Sync)   │
          │                 │       │                 │       │                 │
          │  - REPL stdin   │       │  - supercolliderjs      │  - Port 4001    │
          │  - Tidal boot   │       │  - OSC messages │       │                 │
          └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Current Pain Points
1. **7 manual configuration paths** required in `paths.json`
2. **External dependencies**: SuperCollider, GHC/Stack, TidalCycles must be pre-installed
3. **Platform-specific paths**: Different locations on macOS/Windows/Linux
4. **No validation**: App crashes silently if paths are wrong
5. **Outdated Electron** (1.8.6 - 6 years old, security vulnerabilities)

### Configuration Requirements
| Path | Purpose | Can Bundle? | Can Auto-Detect? |
|------|---------|-------------|------------------|
| `ghcipath` | GHC interpreter | Yes (portable) | Yes |
| `sclang` | SC language | Yes | Yes |
| `scsynth` | SC synth server | Yes | Yes |
| `sclang_conf` | SC config YAML | Generate | Generate |
| `tidal_boot` | Tidal init script | Bundle (static) | N/A |
| `scd_start` | SC init script | Bundle (static) | N/A |
| `userpath` | User home | Auto-detect | Yes |

---

## Implementation Phases

### Phase 1: Foundation Modernization (Week 1-2)
**Goal**: Update core infrastructure without changing functionality

#### 1.1 Upgrade Electron
```json
// package.json changes
{
  "dependencies": {
    "electron": "^28.0.0",  // From 1.8.6
    "electron-builder": "^24.0.0"  // Replace electron-packager
  }
}
```

**Tasks**:
- [ ] Upgrade Electron 1.8.6 → 28.x (latest stable)
- [ ] Migrate from `electron-packager` to `electron-builder`
- [ ] Update `main.js` for new Electron APIs
- [ ] Add context isolation and security best practices
- [ ] Test existing functionality still works

#### 1.2 Consolidate Build Process
```
// New unified entry point
electron-builder.yml:
  appId: "com.siren.livecoding"
  productName: "Siren"
  directories:
    output: "dist"
    buildResources: "build-resources"
  files:
    - "build/**/*"
    - "server/**/*"
    - "config/**/*"
    - "main.js"
    - "package.json"
```

**Tasks**:
- [ ] Create `electron-builder.yml` configuration
- [ ] Modify build to output static React build (not dev server)
- [ ] Embed Node.js server in Electron main process
- [ ] Remove dependency on `concurrently` and `wait-on`
- [ ] Single `npm run build` produces distributable

---

### Phase 2: Auto-Configuration System (Week 2-3)
**Goal**: Detect and configure dependencies automatically

#### 2.1 Path Detection Module
Create `server/lib/pathDetector.js`:

```javascript
const PLATFORM_PATHS = {
  darwin: {
    supercollider: [
      '/Applications/SuperCollider.app/Contents/MacOS/sclang',
      '/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang',
      '~/Applications/SuperCollider.app/Contents/MacOS/sclang'
    ],
    ghci: [
      '/usr/local/bin/ghci',
      '~/.ghcup/bin/ghci',
      '/opt/homebrew/bin/ghci',
      '/Library/Frameworks/GHC.framework/Versions/*/usr/bin/ghci*'
    ],
    scsynth: [
      '/Applications/SuperCollider.app/Contents/Resources/scsynth'
    ]
  },
  win32: {
    supercollider: [
      'C:\\Program Files\\SuperCollider*\\sclang.exe',
      'C:\\Program Files (x86)\\SuperCollider*\\sclang.exe',
      '%LOCALAPPDATA%\\Programs\\SuperCollider*\\sclang.exe'
    ],
    ghci: [
      'C:\\ghcup\\bin\\ghci.exe',
      '%APPDATA%\\ghcup\\bin\\ghci.exe',
      'C:\\Program Files\\Haskell Platform*\\bin\\ghci.exe'
    ]
  },
  linux: {
    supercollider: [
      '/usr/bin/sclang',
      '/usr/local/bin/sclang',
      '~/.local/bin/sclang'
    ],
    ghci: [
      '/usr/bin/ghci',
      '~/.ghcup/bin/ghci',
      '/usr/local/bin/ghci'
    ]
  }
};

class PathDetector {
  async detectAll() { /* ... */ }
  async validatePath(path, type) { /* ... */ }
  async testGhci(path) { /* ... */ }
  async testSclang(path) { /* ... */ }
}
```

#### 2.2 Configuration Wizard Component
Create `src/components/SetupWizard.js`:

```
┌────────────────────────────────────────────────────────────┐
│                    Welcome to Siren                        │
│                                                            │
│  Let's configure your audio environment                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SuperCollider    [✓ Found]  /Applications/SC.app   │  │
│  │  TidalCycles      [✓ Found]  ~/.ghcup/bin/ghci      │  │
│  │  SuperDirt        [? Check]  [Install Guide]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [Auto-Detect]  [Manual Setup]  [Use Bundled] [Continue]   │
└────────────────────────────────────────────────────────────┘
```

**Tasks**:
- [ ] Create `PathDetector` class with platform-specific search
- [ ] Add path validation (actually spawn process, check version)
- [ ] Create `SetupWizard` React component
- [ ] Add first-run detection (check if `paths.json` is valid)
- [ ] Store validated paths and skip wizard on subsequent runs
- [ ] Add "Re-run Setup" option in menu

#### 2.3 Self-Configuring Boot Files
Modify server to use relative paths for bundled configs:

```javascript
// server/app.js modification
const getConfigPath = (configName) => {
  const bundledPath = path.join(__dirname, '..', 'config', configName);
  const userPath = paths[configName];

  // Prefer user path if valid, fall back to bundled
  if (userPath && fs.existsSync(userPath)) {
    return userPath;
  }
  return bundledPath;
};
```

---

### Phase 3: Dependency Bundling (Week 3-5)
**Goal**: Include portable SuperCollider and TidalCycles

#### 3.1 SuperCollider Bundling Strategy

**Option A: Bundle Full SC (Recommended for reliability)**
- Size: ~200MB per platform
- Include: sclang, scsynth, plugins, SuperDirt

```yaml
# electron-builder.yml
extraResources:
  - from: "vendor/supercollider/${os}"
    to: "supercollider"
    filter:
      - "**/*"
```

**Option B: Download on First Run**
- Size: ~5MB app, 200MB download
- Show progress during setup wizard

**SuperDirt Installation**:
```javascript
// Automated SuperDirt install
async function installSuperDirt(sclang) {
  const installScript = `
    Quarks.install("SuperDirt");
    Quarks.install("Dirt-Samples");
    0.exit;
  `;
  await execSclang(sclang, installScript);
}
```

#### 3.2 GHC/Tidal Bundling Strategy

**Option A: Portable Stack + Tidal (Recommended)**
```
vendor/
├── stack/
│   ├── darwin-x64/
│   │   └── stack (portable binary)
│   ├── win32-x64/
│   │   └── stack.exe
│   └── linux-x64/
│       └── stack
└── tidal-project/
    ├── stack.yaml
    ├── package.yaml
    └── src/
        └── Boot.hs
```

Size: ~100MB portable GHC + ~50MB Tidal

**Option B: System GHC + Auto-install Tidal**
```javascript
async function ensureTidal(ghciPath) {
  const result = await exec(`${ghciPath} -e ":m Sound.Tidal.Context"`);
  if (result.error) {
    // Tidal not installed, guide user
    return { installed: false, instructions: INSTALL_GUIDE };
  }
  return { installed: true };
}
```

#### 3.3 Platform-Specific Bundling

**macOS (.dmg)**
```
Siren.app/
├── Contents/
│   ├── MacOS/
│   │   └── Siren (electron)
│   ├── Resources/
│   │   ├── app.asar
│   │   ├── supercollider/
│   │   │   ├── sclang
│   │   │   ├── scsynth
│   │   │   └── plugins/
│   │   └── tidal/
│   │       ├── ghc/
│   │       └── packages/
│   └── Info.plist
```

**Windows (.exe installer / portable)**
```
Siren/
├── Siren.exe
├── resources/
│   ├── app.asar
│   ├── supercollider/
│   └── tidal/
```

**Linux (.AppImage / .deb)**
```
siren.AppImage (self-contained)
OR
/opt/siren/
├── siren
├── resources/
```

---

### Phase 4: Enhanced User Experience (Week 5-6)
**Goal**: Polish the setup and runtime experience

#### 4.1 Startup Sequence
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      S I R E N                              │
│                   Live Coding Interface                     │
│                                                             │
│     ████████████████████████████░░░░░░░░  75%              │
│                                                             │
│     [✓] Loading configuration                               │
│     [✓] Starting audio server                               │
│     [►] Booting SuperCollider...                            │
│     [ ] Initializing TidalCycles                            │
│     [ ] Ready                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Health Monitoring
Add real-time status indicators:
```javascript
// server/lib/healthMonitor.js
class HealthMonitor {
  checkScsynth() { /* Check scsynth is running */ }
  checkGhci() { /* Check REPL is responsive */ }
  checkAudio() { /* Check audio device available */ }

  getStatus() {
    return {
      scsynth: { status: 'running', cpu: 12.5 },
      ghci: { status: 'running', memory: '45MB' },
      audio: { status: 'ok', device: 'Built-in Output', sampleRate: 44100 }
    };
  }
}
```

#### 4.3 Error Recovery
```javascript
// Automatic restart on crash
sclang.on('exit', (code) => {
  if (code !== 0 && !intentionalShutdown) {
    showNotification('SuperCollider crashed. Restarting...');
    setTimeout(() => bootSuperCollider(), 2000);
  }
});
```

#### 4.4 Audio Device Selection
Add UI for selecting audio output:
```
┌─ Audio Settings ─────────────────────────┐
│                                          │
│  Output Device: [Built-in Output    ▼]   │
│  Sample Rate:   [44100 Hz           ▼]   │
│  Buffer Size:   [512 samples        ▼]   │
│                                          │
│  [Test Audio]                [Apply]     │
└──────────────────────────────────────────┘
```

---

### Phase 5: Distribution Pipeline (Week 6-7)
**Goal**: Automated builds and releases

#### 5.1 GitHub Actions CI/CD
```yaml
# .github/workflows/build.yml
name: Build & Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Download SuperCollider
        run: ./scripts/download-sc.sh ${{ matrix.os }}

      - name: Download Portable GHC
        run: ./scripts/download-ghc.sh ${{ matrix.os }}

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package
        run: npm run dist

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: siren-${{ matrix.os }}
          path: dist/*
```

#### 5.2 Release Structure
```
GitHub Releases:
├── Siren-1.0.0-mac-arm64.dmg      (~400MB) - Apple Silicon
├── Siren-1.0.0-mac-x64.dmg        (~400MB) - Intel Mac
├── Siren-1.0.0-win-x64.exe        (~450MB) - Windows Installer
├── Siren-1.0.0-win-portable.zip   (~450MB) - Windows Portable
├── Siren-1.0.0-linux-x64.AppImage (~400MB) - Linux Universal
└── Siren-1.0.0-linux-x64.deb      (~400MB) - Debian/Ubuntu
```

#### 5.3 Auto-Update System
```javascript
// main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    message: 'A new version is available. Download now?',
    buttons: ['Yes', 'Later']
  });
});
```

---

## File Structure After Implementation

```
Siren/
├── .github/
│   └── workflows/
│       ├── build.yml
│       └── test.yml
├── build-resources/
│   ├── icon.icns
│   ├── icon.ico
│   └── icon.png
├── config/
│   ├── tidal-boot-default.hs
│   ├── scd-start-default.scd
│   └── sclang_conf.yaml.template
├── scripts/
│   ├── download-sc.sh
│   ├── download-ghc.sh
│   └── postinstall.js
├── server/
│   ├── app.js
│   ├── start.js
│   └── lib/
│       ├── pathDetector.js
│       ├── healthMonitor.js
│       ├── autoInstaller.js
│       └── processManager.js
├── src/
│   ├── components/
│   │   ├── SetupWizard.js      [NEW]
│   │   ├── StatusBar.js        [NEW]
│   │   ├── AudioSettings.js    [NEW]
│   │   └── ... (existing)
│   └── stores/
│       ├── pathStore.js        [MODIFIED]
│       ├── setupStore.js       [NEW]
│       └── ... (existing)
├── vendor/                      [NEW - bundled deps]
│   ├── supercollider/
│   │   ├── darwin-x64/
│   │   ├── darwin-arm64/
│   │   ├── win32-x64/
│   │   └── linux-x64/
│   └── ghc/
│       ├── darwin-x64/
│       ├── darwin-arm64/
│       ├── win32-x64/
│       └── linux-x64/
├── electron-builder.yml         [NEW]
├── main.js                      [MODIFIED]
├── package.json                 [MODIFIED]
└── PACKAGING_PLAN.md           [THIS FILE]
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SC version incompatibility | High | Medium | Pin SC version, test thoroughly |
| GHC/Tidal version mismatch | High | Medium | Bundle known-good versions |
| Platform-specific audio issues | Medium | High | Extensive testing, fallback options |
| Large download size (~400MB) | Medium | Low | Offer "lite" version without bundles |
| Native module compilation | High | Medium | Pre-build binaries, use prebuild-install |
| Code signing requirements | Medium | High | Set up Apple/Windows certificates |

---

## Success Metrics

1. **First-Run Success Rate**: >90% of users complete setup without manual intervention
2. **Download-to-Sound Time**: <5 minutes from download to first sound
3. **Crash Rate**: <1% of sessions
4. **Bundle Size**: <500MB per platform
5. **Startup Time**: <10 seconds to ready state

---

## Immediate Next Steps

1. **Create feature branch**: `git checkout -b feature/packaging`
2. **Upgrade Electron**: Update to v28, fix breaking changes
3. **Implement PathDetector**: Auto-detect SC and GHC
4. **Create SetupWizard**: First-run configuration UI
5. **Test on all platforms**: macOS, Windows, Linux
6. **Set up CI/CD**: GitHub Actions for automated builds

---

## Appendix A: Dependency Versions

| Dependency | Current | Target | Notes |
|------------|---------|--------|-------|
| Electron | 1.8.6 | 28.x | Major upgrade, API changes |
| React | 16.3.2 | 16.3.2 | Keep stable |
| SuperCollider | Any | 3.13.0 | Bundle this version |
| GHC | Any | 9.4.x | Via ghcup/stack |
| TidalCycles | Any | 1.9.x | Latest stable |
| Node.js | Any | 20.x LTS | For building |

## Appendix B: Platform Download URLs

**SuperCollider**:
- macOS: https://github.com/supercollider/supercollider/releases
- Windows: https://github.com/supercollider/supercollider/releases
- Linux: System package or AppImage

**GHC (via ghcup)**:
- All platforms: https://www.haskell.org/ghcup/

**Portable Stack**:
- https://docs.haskellstack.org/en/stable/install_and_upgrade/
