#!/usr/bin/env node

/**
 * Download and Bundle Dependencies
 *
 * Downloads and extracts SuperCollider for bundling with Siren.
 * For TidalCycles, we bundle GHCup and install on first run.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync, spawn } = require('child_process');

const VERSIONS = {
  supercollider: '3.13.0'
};

// Direct download URLs for portable/extractable versions
const DOWNLOADS = {
  darwin: {
    x64: {
      // Use the signed release DMG
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-macOS-x64.dmg`
    },
    arm64: {
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-macOS-arm64.dmg`
    }
  },
  win32: {
    x64: {
      // Windows ZIP for portable extraction
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-Windows-64bit-VS.zip`
    }
  },
  linux: {
    x64: {
      // AppImage for portable Linux
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-linux-jammy-gcc12-x64.AppImage`
    }
  }
};

const VENDOR_DIR = path.join(__dirname, '..', 'vendor');

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    const file = fs.createWriteStream(destPath);
    let redirects = 0;

    const request = (reqUrl) => {
      https.get(reqUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          if (++redirects > 5) return reject(new Error('Too many redirects'));
          return request(response.headers.location);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`HTTP ${response.statusCode}`));
        }

        const total = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;

        response.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total) {
            const pct = Math.floor((downloaded / total) * 100);
            process.stdout.write(`\rProgress: ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)}MB)`);
          }
        });

        response.pipe(file);
        file.on('finish', () => { file.close(); console.log('\nDone.'); resolve(); });
      }).on('error', reject);
    };
    request(url);
  });
}

async function extractDMG(dmgPath, destDir) {
  console.log('Extracting DMG (macOS)...');
  const mountPoint = '/tmp/siren-sc-mount';

  try {
    // Mount DMG
    execSync(`hdiutil attach "${dmgPath}" -mountpoint "${mountPoint}" -nobrowse -quiet`);

    // Find and copy SuperCollider.app
    const scApp = path.join(mountPoint, 'SuperCollider.app');
    if (fs.existsSync(scApp)) {
      execSync(`cp -R "${scApp}" "${destDir}/"`);
      console.log('Copied SuperCollider.app');
    }

    // Unmount
    execSync(`hdiutil detach "${mountPoint}" -quiet`);

    // Remove DMG to save space
    fs.unlinkSync(dmgPath);
    console.log('SuperCollider extracted successfully');
    return true;
  } catch (e) {
    console.error('DMG extraction failed:', e.message);
    try { execSync(`hdiutil detach "${mountPoint}" -quiet 2>/dev/null`); } catch {}
    return false;
  }
}

async function extractZip(zipPath, destDir) {
  console.log('Extracting ZIP...');
  try {
    // Try unzip first, fall back to PowerShell on Windows
    if (process.platform === 'win32') {
      execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'inherit' });
    } else {
      execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'inherit' });
    }
    fs.unlinkSync(zipPath);
    console.log('Extracted successfully');
    return true;
  } catch (e) {
    console.error('ZIP extraction failed:', e.message);
    return false;
  }
}

async function setupLinuxAppImage(appImagePath, destDir) {
  console.log('Setting up AppImage...');
  try {
    fs.chmodSync(appImagePath, 0o755);
    // Move to final location
    const finalPath = path.join(destDir, 'SuperCollider.AppImage');
    fs.renameSync(appImagePath, finalPath);

    // Create wrapper scripts
    const sclangWrapper = `#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/SuperCollider.AppImage" --sclang "$@"
`;
    const scsynthWrapper = `#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/SuperCollider.AppImage" --scsynth "$@"
`;
    fs.writeFileSync(path.join(destDir, 'sclang'), sclangWrapper, { mode: 0o755 });
    fs.writeFileSync(path.join(destDir, 'scsynth'), scsynthWrapper, { mode: 0o755 });
    console.log('AppImage setup complete');
    return true;
  } catch (e) {
    console.error('AppImage setup failed:', e.message);
    return false;
  }
}

async function downloadSuperCollider(platform, arch) {
  const downloads = DOWNLOADS[platform]?.[arch];
  if (!downloads?.supercollider) {
    console.log(`No SuperCollider download for ${platform}-${arch}`);
    return false;
  }

  const vendorPath = path.join(VENDOR_DIR, platform, arch, 'supercollider');
  fs.mkdirSync(vendorPath, { recursive: true });

  // Check if already extracted
  const checkPaths = {
    darwin: path.join(vendorPath, 'SuperCollider.app'),
    win32: path.join(vendorPath, 'sclang.exe'),
    linux: path.join(vendorPath, 'SuperCollider.AppImage')
  };

  if (fs.existsSync(checkPaths[platform])) {
    console.log('SuperCollider already bundled, skipping...');
    return true;
  }

  const url = downloads.supercollider;
  const ext = path.extname(url);
  const tempFile = path.join(vendorPath, `sc-download${ext}`);

  await downloadFile(url, tempFile);

  // Extract based on platform
  if (platform === 'darwin') {
    return extractDMG(tempFile, vendorPath);
  } else if (platform === 'win32') {
    return extractZip(tempFile, vendorPath);
  } else if (platform === 'linux') {
    return setupLinuxAppImage(tempFile, vendorPath);
  }
}

function createTidalInstaller(platform, arch) {
  // Create a first-run installer script for TidalCycles
  const vendorPath = path.join(VENDOR_DIR, platform, arch);
  fs.mkdirSync(vendorPath, { recursive: true });

  const isWindows = platform === 'win32';
  const scriptExt = isWindows ? '.ps1' : '.sh';
  const scriptPath = path.join(vendorPath, `install-tidal${scriptExt}`);

  const unixScript = `#!/bin/bash
set -e

echo "==================================="
echo "TidalCycles Installer for Siren"
echo "==================================="
echo ""

# Check for existing GHCup
if command -v ghcup &> /dev/null; then
    echo "GHCup found, using existing installation..."
else
    echo "Installing GHCup..."
    curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | BOOTSTRAP_HASKELL_NONINTERACTIVE=1 sh
    source ~/.ghcup/env
fi

echo ""
echo "Installing GHC and Cabal..."
ghcup install ghc --set
ghcup install cabal --set

echo ""
echo "Installing TidalCycles..."
cabal update
cabal install tidal --lib

echo ""
echo "==================================="
echo "TidalCycles installed successfully!"
echo "==================================="
echo ""
echo "Next: Install SuperDirt in SuperCollider:"
echo "  1. Open SuperCollider"
echo "  2. Run: Quarks.install(\\"SuperDirt\\")"
echo "  3. Recompile class library (Cmd+Shift+L / Ctrl+Shift+L)"
`;

  const windowsScript = `# TidalCycles Installer for Siren (Windows)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "TidalCycles Installer for Siren" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check for GHCup
$ghcup = Get-Command ghcup -ErrorAction SilentlyContinue
if (-not $ghcup) {
    Write-Host "Installing GHCup..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-WebRequest https://www.haskell.org/ghcup/sh/bootstrap-haskell.ps1 -OutFile bootstrap-haskell.ps1
    ./bootstrap-haskell.ps1 -InstallStack -Minimal
    Remove-Item bootstrap-haskell.ps1

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host ""
Write-Host "Installing GHC and Cabal..." -ForegroundColor Yellow
ghcup install ghc --set
ghcup install cabal --set

Write-Host ""
Write-Host "Installing TidalCycles..." -ForegroundColor Yellow
cabal update
cabal install tidal --lib

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "TidalCycles installed successfully!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Install SuperDirt in SuperCollider:" -ForegroundColor Cyan
Write-Host '  1. Open SuperCollider'
Write-Host '  2. Run: Quarks.install("SuperDirt")'
Write-Host '  3. Recompile class library (Ctrl+Shift+L)'
`;

  fs.writeFileSync(scriptPath, isWindows ? windowsScript : unixScript, { mode: isWindows ? 0o644 : 0o755 });
  console.log(`Created Tidal installer: ${scriptPath}`);
}

async function main() {
  const platform = process.argv[2] || process.platform;
  const arch = process.argv[3] || process.arch;

  console.log('='.repeat(50));
  console.log('Siren Dependency Bundler');
  console.log('='.repeat(50));
  console.log(`Platform: ${platform}-${arch}`);
  console.log('');

  // Download and extract SuperCollider
  console.log('--- SuperCollider ---');
  await downloadSuperCollider(platform, arch);

  // Create TidalCycles installer script
  console.log('');
  console.log('--- TidalCycles ---');
  createTidalInstaller(platform, arch);

  console.log('');
  console.log('='.repeat(50));
  console.log('Bundling complete!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Run: npm run electron:build');
}

main().catch(console.error);
