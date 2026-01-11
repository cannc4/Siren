#!/usr/bin/env node

/**
 * Post-install Script
 *
 * Runs after npm install to set up the Siren development environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

console.log('');
console.log('='.repeat(50));
console.log('Siren Post-Install Setup');
console.log('='.repeat(50));
console.log('');

// Ensure required directories exist
const requiredDirs = [
  'server/save',
  'server/save/recordings',
  'config',
  'build-resources',
  'vendor'
];

for (const dir of requiredDirs) {
  const fullPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Create default paths.json if it doesn't exist
const pathsFile = path.join(ROOT_DIR, 'server', 'save', 'paths.json');
if (!fs.existsSync(pathsFile)) {
  const defaultPaths = {
    ghcipath: '',
    sclang: '',
    scsynth: '',
    sclang_conf: '',
    tidal_boot: './config/tidal-boot-default.hs',
    scd_start: './config/scd-start-default.scd',
    path: ''
  };

  fs.writeFileSync(pathsFile, JSON.stringify(defaultPaths, null, 2));
  console.log('Created default paths.json');
}

// Create default scene.json if it doesn't exist
const sceneFile = path.join(ROOT_DIR, 'server', 'save', 'scene.json');
if (!fs.existsSync(sceneFile)) {
  const defaultScene = {
    scenes: [],
    active_s: 0,
    patterns: [],
    channels: []
  };

  fs.writeFileSync(sceneFile, JSON.stringify(defaultScene, null, 2));
  console.log('Created default scene.json');
}

// Create default layout.json if it doesn't exist
const layoutFile = path.join(ROOT_DIR, 'server', 'save', 'layout.json');
if (!fs.existsSync(layoutFile)) {
  const defaultLayout = {
    layouts: {},
    customs: {}
  };

  fs.writeFileSync(layoutFile, JSON.stringify(defaultLayout, null, 2));
  console.log('Created default layout.json');
}

// Create default console.json if it doesn't exist
const consoleFile = path.join(ROOT_DIR, 'server', 'save', 'console.json');
if (!fs.existsSync(consoleFile)) {
  const defaultConsole = {
    sc: '',
    tidal: ''
  };

  fs.writeFileSync(consoleFile, JSON.stringify(defaultConsole, null, 2));
  console.log('Created default console.json');
}

// Create default globals.json if it doesn't exist
const globalsFile = path.join(ROOT_DIR, 'server', 'save', 'globals.json');
if (!fs.existsSync(globalsFile)) {
  const defaultGlobals = [];
  fs.writeFileSync(globalsFile, JSON.stringify(defaultGlobals, null, 2));
  console.log('Created default globals.json');
}

console.log('');
console.log('Post-install setup complete!');
console.log('');
console.log('Next steps:');
console.log('  1. npm run dev        - Start development server');
console.log('  2. npm run electron:dev - Start with Electron');
console.log('');
console.log('For production build:');
console.log('  1. npm run download:deps - Download bundled dependencies');
console.log('  2. npm run dist          - Build distributable');
console.log('');
