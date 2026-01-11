# Vendor Dependencies

This directory contains bundled dependencies for Siren distribution builds.

## Structure

```
vendor/
├── darwin/
│   ├── x64/
│   │   ├── supercollider/
│   │   └── haskell/
│   └── arm64/
│       ├── supercollider/
│       └── haskell/
├── win32/
│   └── x64/
│       ├── supercollider/
│       └── haskell/
└── linux/
    └── x64/
        ├── supercollider/
        └── haskell/
```

## Downloading Dependencies

Run the following command to download dependencies for your platform:

```bash
npm run download:deps
```

This will download:
- SuperCollider (sclang, scsynth, plugins)
- GHCup (for installing GHC and Cabal)

## Notes

- These binaries are NOT included in the git repository
- They are downloaded on demand before creating distribution builds
- Each platform/architecture combination has its own directory
- The electron-builder configuration automatically includes the correct vendor directory

## Manual Setup

If automatic download fails, you can manually place the binaries:

### SuperCollider
Download from: https://supercollider.github.io/downloads

### GHC/Haskell
Install GHCup from: https://www.haskell.org/ghcup/

Then install TidalCycles:
```bash
cabal update
cabal install tidal
```

### SuperDirt
In SuperCollider, run:
```supercollider
Quarks.install("SuperDirt");
Quarks.install("Dirt-Samples");
```
