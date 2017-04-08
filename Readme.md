# Siren

*Siren*, a software environment that fills the gap between live coding performance and algorithmic composition. It is based on a hierarchical structure and a tracker-inspired user interface on top of the [TidalCycles](https://github.com/tidalcycles/Tidal/) language for pattern programming. In addition to pattern composition, *Siren* supports programming variations of and transitions between patterns. 

**Note:** This is an highly experimental release. If you come across a bug, please do submit an `issue` on this page.

## Download 

In order to download a copy of the repository, either download repository `as a ZIP file` at [https://github.com/cannc4/sq](github.com/cannc4/sq), or use command line to `clone` repository.

```
git clone https://github.com/cannc4/Siren.git
```

## Build and Run

### Dependencies:
Make sure the latest versions of following software are installed in your system

- [SuperCollider](http://supercollider.github.io/download.html)
- [NodeJS](https://nodejs.org/en/download/)
- [TidalCycles](https://tidalcycles.org/getting_started.html)

Then follow these lines to install package dependencies:

```
cd path/to/siren
npm i
```

In order to bind software dependencies, edit full paths in `config/config.json` according to your file system formatting and save the file. Now you can start the interface
```
npm start
```

and initialize the backend
```
npm run siren
```


Tested on Windows 10 and MacOSX El Capitan.

## Usage

- Login to the system using Github authentication
- Boot `SuperCollider` by pressing the console button

### Scenes
 - duration
 - pattern functions
 - transitions
 - song mode
 - ordering

### Patterns
 - pattern function


### Parameters

