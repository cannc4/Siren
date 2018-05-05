# Siren ![](https://travis-ci.org/merttoka/Siren.svg?branch=master)
*Siren*, is a tracker interface that embodies abstractions where programming is realized as the medium for pattern sequencing in a modular fashion. It is based on a hierarchical structure that consists of scenes and channels. Separate channels have independent patterns; a complete song consists of a master list of repeated patterns.

Supported programming languages : 

- SuperCollider
- Haskell/TidalCycles

![](/src/assets/readme_images/main_ss.jpg?raw=true "Title")


**Note:** This is a beta release (*v0.6), and it has not been tested comprehensively. If you come across a bug, please do [submit an issue](https://github.com/cannc4/siren/issues/new), and/or create a `pull request` of you feel like participating in its development.



## Download

You can get *Siren* either by downloading repository `as a ZIP file` at [https://github.com/cannc4/siren](github.com/cannc4/siren), or by using the command line to `clone` the repository.

```shell
git clone https://github.com/cannc4/Siren.git
```



## Build

#### Dependencies:
Make sure the latest versions of following software are installed for your system user
- [SuperCollider](http://supercollider.github.io/download.html)
- [NodeJS](https://nodejs.org/en/download/) (Make sure `npm` is globally installed)
- [TidalCycles](https://tidalcycles.org/getting_started.html)

After setting up Haskell, run following command :
``` shell
cabal install aeson
```

Then follow these lines to install package dependencies:
```shell
cd path/to/downloaded/repo
npm i
```

```shell
npm run siren
```

```shell
npm start
```



## Setup

In order for *Siren* to find the local dependencies, you need to edit full paths in the `Config Paths` modules in the software according to your file system formatting, and save the file (Alternatively, this can be done directly in `./server/save/paths.json`). 


Copy paste your startup code to `./config/scd-start-default.scd` and `./config/tidal-boot-default.hs`, and make sure you don't modify the required code for `Siren`




**Note:** Make sure SuperCollider is either idle or closed before moving on.



Now you can start the server and interface separately:

```shell
npm run siren
npm start
```
This will start the app in browser at `localhost:3000`



You can also run the electron app with:

```shell
npm run sirenc
```

alternatively on MacOS:
```shell
./siren.sh
```

and on Windows, double click on:

```shell
siren.bat
```

*Tested with Chrome on Windows 10 and MacOS High Sierra*



## Modules

You can toggle visibility of every module using the right-click context menu.

### 1. Scenes

Scenes are the core of *Siren* and a scene serves as a framework to the composition. Each scene comprises of unique channels, global modifiers and patterns. 

### 2. Grid  

#### Channels 

Different channel types can be added with right mouse click. Once a channel is added to the sequencer, the parameters and layout can be adjusted dynamically.  Each cell is a textbox allowing any type of text input. Patterns can be looked up from the dictionary with their names and parameters. When a cell is active, it triggers the pattern with appropriate name and applies parameters in an ordered fashion.  See `parameters` for various types.

Please note that Tidal channel names has to be defined appropriately in `tidal-boot-default.hs` or compiled using `console`.

#### Cells
The cells of the channels serve as a canvas for pattern names and pattern parameters. Pressing `Enter` on the cells selects the cell. Once in selection mode, you can navigate the cells with arrow keys. The selected cell can be compiled with `Alt + Enter `. Multiple cells can be selected using the `Shift` + arrow keys which then can be copied and pasted to other parts of the grid.

#### Cell Parameters

Siren allows patterns to be parameterized and can be called with different parameters from different cells in the channel. 

#### Random Parameters
`|x,y|` returns a random value within the `x` and `y` 

### 3. Patterns

**Disclaimer:** Please omit the channel number and dollar sign on Tidal commands (instead of `d1 $ sound "bd"` just write `sound "bd"`)

Tidal patterns are stored in the `dictionary` on the right hand side of the interface. This dictionary is unique for each scene and interacts with the sequencer in terms of parameters and calls.

#### Temporal parameter 
 `t`  represents the temporal parameter for each timer and it can be used in expressions to create complex values, especially with math expressions.

#### Mathematical expressions 
Mathematical expressions can be used in the patterns in the dictionary, parser evaluates the expressions when enclosed with `&` symbol. 


#### Value Parameters
Any character sequence inside *Siren* pattern can be parameterized by surrounding desired spot with \` symbol (like surrounding a phrase for Markdown code block). Using this feature, you can not only pass well-tuned values dynamically, but also pass anything you want.

```haskell
n `x` # s `y` 
```

### 4. Pattern History

This module stores the successfully compiled Tidal patterns to keep track of the running sequences.

### 5. Console

This module serves as a CLI (Command-Line-Interface) to Haskell and SuperCollider. 

### 6. Globals

There are two sections dedicated to appending and prepending to the running code. `ctrl+enter` activates the code and sections can be recalled by creating presets. Pressing `Rec` button saves the active modifiers. `shift+ click` clears the desired slot and `alt+ click` overwrites it. These modifiers are applied to the patterns shown in the pattern history section (i.e. active patterns). Channels that you want to target can also be specified using the `channel` section in the submenu. Writing `1 2` will make the modifiers only affect the first two channels, `0` is a special case and means modifiers will be applied to all channels in the scene. Last row is the global parameter that can be dynamically added to the system.

### 7. Config Paths

In this module, it’s possible to set various settings of *Siren* such as startup config.

### 8. Debug Console

This module serves as a debug console for GHC. 

### 9. Pattern Roll

**(Under Development)** Inspired by the piano-roll in traditional DAWs, operates as the playback visualization tool. It fetches the future trigger values from Tidal and places them on top of the current playback information. To be able to use this tool, pattern names needs to be written with `x` prefix instead of the usual `d` such as `x1` instead of `d1`.

The horizontal axis denotes quantized time bins, and vertical lists the names of unique samples and notes. Default sequence length is 8 seconds and each second is quantized into 12 bins. Both parameters can be edited using the dedicated fields on the interface.

### 10. Graphics

**(Under Development)** This module runs GLSL code which will be used as a visual synthesizer in synch with the current playback. 



