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
#### Duration

  Duration of each channel can be specified using the textarea next to channel number on top of the grid. Duration is the time it takes to reach the last step in seconds.
  `ctrl+ enter` starts the timer
  `ctrl+ shift` stops the timers

#### Dictionary

  Tidal patterns are stored in the `dictionary` on the right hand side of the interface.

#### Pattern Functions

  Patterns can be looked up from the dictionary with their on their names and valid parameters. See `parameters` for various types.

#### Transitions
  Transitions are stored in the bottom row and unique for each scene

#### Song mode

  if toggled, scenes are iterated based on their ordering. It updates the active scene and its values once timers reach to the last step of the scene.
  This mode is currently under development for further functionalities.



### Parameters

#### Mathematical expressions

Mathematical expressions can be used in the patterns in the dictionary, parser evaluates the expressions when enclosed with `&` symbol.

#### Random Parameters

`[x,y]`returns a random value within the `x` and `y` boundaries.

#### Temporal Parameter
`t` represents the temporal parameter for each timer and it can be used in expressions to create complex values





## Notes
- Pause timers for a few seconds if you see too much flood in ghc console. (stack gets full)
- `npm run siren` starts up the server - it's not required if you want to refresh the interface however you need to manually close node and restart it if `scsynth` crashes
- As each cell contains a pattern, having a timer duration like 4 seconds doesn't really makes sense if you have 8 steps (e.g 0.5 sec per step)

## Known Bugs

- TBA
- It's not a bug free software however it's been tested and no critical issue should occur. Please open an issue if you feel something's missing or not working.
