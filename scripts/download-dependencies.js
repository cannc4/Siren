#!/usr/bin/env node

/**
 * Download Dependencies Script
 *
 * Downloads SuperCollider and portable GHC/Stack for bundling with Siren.
 * Run this before building the distributable.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');

// Dependency versions
const VERSIONS = {
  supercollider: '3.13.0',
  ghc: '9.4.8',
  stack: '2.13.1',
  cabal: '3.10.2.1'
};

// Download URLs by platform
const DOWNLOADS = {
  darwin: {
    x64: {
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-macOS-x64.dmg`,
      ghcup: 'https://downloads.haskell.org/~ghcup/x86_64-apple-darwin-ghcup'
    },
    arm64: {
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-macOS-arm64.dmg`,
      ghcup: 'https://downloads.haskell.org/~ghcup/aarch64-apple-darwin-ghcup'
    }
  },
  win32: {
    x64: {
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-Windows-64bit.exe`,
      ghcup: 'https://downloads.haskell.org/~ghcup/x86_64-mingw64-ghcup.exe'
    }
  },
  linux: {
    x64: {
      supercollider: `https://github.com/supercollider/supercollider/releases/download/Version-${VERSIONS.supercollider}/SuperCollider-${VERSIONS.supercollider}-Source.tar.bz2`,
      ghcup: 'https://downloads.haskell.org/~ghcup/x86_64-linux-ghcup'
    }
  }
};

const VENDOR_DIR = path.join(__dirname, '..', 'vendor');

class DependencyDownloader {
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;
    this.vendorPath = path.join(VENDOR_DIR, this.platform, this.arch);
  }

  async run() {
    console.log('='.repeat(60));
    console.log('Siren Dependency Downloader');
    console.log('='.repeat(60));
    console.log(`Platform: ${this.platform}`);
    console.log(`Architecture: ${this.arch}`);
    console.log(`Vendor directory: ${this.vendorPath}`);
    console.log('');

    // Create vendor directories
    this.ensureDirectories();

    // Check what we need to download
    const downloads = DOWNLOADS[this.platform]?.[this.arch];

    if (!downloads) {
      console.error(`No downloads available for ${this.platform}-${this.arch}`);
      console.log('');
      console.log('Supported platforms:');
      console.log('  - darwin-x64 (macOS Intel)');
      console.log('  - darwin-arm64 (macOS Apple Silicon)');
      console.log('  - win32-x64 (Windows 64-bit)');
      console.log('  - linux-x64 (Linux 64-bit)');
      process.exit(1);
    }

    console.log('The following components will be downloaded:');
    console.log(`  - SuperCollider ${VERSIONS.supercollider}`);
    console.log(`  - GHCup (for GHC ${VERSIONS.ghc} and Cabal)`);
    console.log('');

    try {
      // Download and extract SuperCollider
      await this.downloadSuperCollider(downloads.supercollider);

      // Download GHCup
      await this.downloadGhcup(downloads.ghcup);

      // Create a README in vendor directory
      this.createVendorReadme();

      console.log('');
      console.log('='.repeat(60));
      console.log('Download complete!');
      console.log('='.repeat(60));
      console.log('');
      console.log('Next steps:');
      console.log('1. Run: npm run electron:build');
      console.log('2. Find your distributable in the dist/ folder');

    } catch (error) {
      console.error('Download failed:', error.message);
      process.exit(1);
    }
  }

  ensureDirectories() {
    const dirs = [
      VENDOR_DIR,
      this.vendorPath,
      path.join(this.vendorPath, 'supercollider'),
      path.join(this.vendorPath, 'haskell')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }

  async downloadSuperCollider(url) {
    console.log('');
    console.log('Downloading SuperCollider...');
    console.log(`URL: ${url}`);

    const scDir = path.join(this.vendorPath, 'supercollider');
    const fileName = path.basename(url);
    const downloadPath = path.join(scDir, fileName);

    // Check if already downloaded
    if (fs.existsSync(downloadPath)) {
      console.log('SuperCollider already downloaded, skipping...');
      return;
    }

    await this.downloadFile(url, downloadPath);

    // Extract based on file type
    if (fileName.endsWith('.dmg')) {
      console.log('Note: DMG file downloaded. Manual extraction required:');
      console.log(`  1. Mount: hdiutil attach "${downloadPath}"`);
      console.log('  2. Copy SuperCollider.app to vendor/darwin/*/supercollider/');
      console.log('  3. Unmount: hdiutil detach /Volumes/SuperCollider*');
    } else if (fileName.endsWith('.exe')) {
      console.log('Note: Installer downloaded. For portable extraction:');
      console.log('  Consider using 7-Zip to extract the installer contents');
    } else if (fileName.endsWith('.tar.bz2') || fileName.endsWith('.tar.gz')) {
      console.log('Extracting archive...');
      try {
        execSync(`tar -xf "${downloadPath}" -C "${scDir}"`, { stdio: 'inherit' });
        console.log('Extraction complete');
      } catch (e) {
        console.log('Note: Manual extraction may be required');
      }
    }
  }

  async downloadGhcup(url) {
    console.log('');
    console.log('Downloading GHCup...');
    console.log(`URL: ${url}`);

    const haskellDir = path.join(this.vendorPath, 'haskell');
    const isWindows = this.platform === 'win32';
    const fileName = isWindows ? 'ghcup.exe' : 'ghcup';
    const downloadPath = path.join(haskellDir, fileName);

    // Check if already downloaded
    if (fs.existsSync(downloadPath)) {
      console.log('GHCup already downloaded, skipping...');
      return;
    }

    await this.downloadFile(url, downloadPath);

    // Make executable on Unix
    if (!isWindows) {
      fs.chmodSync(downloadPath, 0o755);
      console.log('Made ghcup executable');
    }

    console.log('');
    console.log('Note: GHCup is a tool to install GHC and Cabal.');
    console.log('For full Tidal support, users should run:');
    console.log('  ./ghcup install ghc');
    console.log('  ./ghcup install cabal');
    console.log('  cabal install tidal');
  }

  downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      let redirectCount = 0;
      const maxRedirects = 5;

      const doRequest = (reqUrl) => {
        const protocol = reqUrl.startsWith('https') ? https : require('http');

        protocol.get(reqUrl, (response) => {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            redirectCount++;
            if (redirectCount > maxRedirects) {
              reject(new Error('Too many redirects'));
              return;
            }
            console.log(`Redirecting to: ${response.headers.location}`);
            doRequest(response.headers.location);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          const totalSize = parseInt(response.headers['content-length'], 10);
          let downloadedSize = 0;
          let lastProgress = 0;

          response.on('data', (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize) {
              const progress = Math.floor((downloadedSize / totalSize) * 100);
              if (progress >= lastProgress + 10) {
                process.stdout.write(`\rProgress: ${progress}%`);
                lastProgress = progress;
              }
            }
          });

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            console.log('\nDownload complete');
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      };

      doRequest(url);
    });
  }

  createVendorReadme() {
    const readme = `# Siren Vendor Dependencies

This directory contains bundled dependencies for Siren.

## Contents

- \`supercollider/\` - SuperCollider ${VERSIONS.supercollider}
- \`haskell/\` - GHCup and Haskell tools

## Platform: ${this.platform}-${this.arch}

Generated on: ${new Date().toISOString()}

## Notes

For a fully functional installation, users may need to:

1. **SuperCollider**: Install SuperDirt quark
   - Open SuperCollider
   - Run: \`Quarks.install("SuperDirt")\`
   - Recompile class library

2. **TidalCycles**: Install Tidal
   - Run: \`cabal update && cabal install tidal\`

## License

SuperCollider: GPL v3+
GHC/Cabal: BSD-style license
`;

    const readmePath = path.join(this.vendorPath, 'README.md');
    fs.writeFileSync(readmePath, readme);
    console.log('Created vendor README');
  }
}

// Run the downloader
const downloader = new DependencyDownloader();
downloader.run().catch(console.error);
