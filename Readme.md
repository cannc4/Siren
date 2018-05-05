# Siren
*Siren*, is a tracker interface that embodies abstractions where programming is realized as the medium for pattern sequencing in a modular fashion. It is based on a hierarchical structure that consists of scenes and channels. Separate channels have independent patterns; a complete song consists of a master list of repeated patterns. In addition to pattern composition, *Siren* supports programming variations of and transitions between patterns. 


Supported programming languages : 
SuperCollider
Haskell/TidalCycles


**Note:** This is a beta release (*v0.5*), and it has not been tested comprehensively. If you come across a bug, please do [submit an `issue` ](https://github.com/cannc4/siren/issues/new), and/or create a `pull request` of you feel like participating in its development.

## Download
You can get *Siren* either by downloading repository `as a ZIP file` at [https://github.com/cannc4/siren](github.com/cannc4/siren), or by using the command line to `clone` the repository.

```shell
git clone https://github.com/cannc4/Siren.git
```

## Build and Run
#### Dependencies:
Make sure the latest versions of following software are installed for your system user
- [SuperCollider](http://supercollider.github.io/download.html)
- [NodeJS](https://nodejs.org/en/download/) 
+ Make sure `npm` is globally installed with `NodeJS`
- [TidalCycles](https://tidalcycles.org/getting_started.html)

Then follow these lines to install package dependencies:
```shell
cd path/to/downloaded/repo
npm i
```

In order to bind software dependencies, edit full paths in the `Paths` modules in the software according to your file system formatting and save the file (Alternatively, this can be done directly in `./server/save/paths.json`. 
Copy paste your startup code to scd-start-default.scd and tidal-boot-default.hs into config folder, please make sure that you don't overwrite the required code for various modules in `Siren`

Note that it's possible to target required paths using the `Settings` module in the interface


**Note:** Make sure SuperCollider is either idle or closed before moving on.

Now you can start the server and interface seperately
```shell
npm run siren
npm start
```
then go to `http://localhost:3000/` or `http://127.0.0.1:3000/` in your browser

or run the electron app with
```shell
npm run sirenc
```

alternatively on MacOS,
```shell
./siren.sh
```

*Tested with Chrome on Windows 10 and MacOS High Sierra*

## Modules

### Scenes

Scenes are the core of `Siren` and a scene serves as a framework to the composition. Each scene comprises of unique channels, global modifiers and patterns. 

*example in Figure (a)*- Textbox for scene name - `Add` `Duplicate` button- `Clear` button


### Sequencer (aka Grid) 
#### Channels

Channels can be added with navigating to the `Context Menu` by `right-click`. Once a channel is added to the sequencer, the parameters and layout can be adjusted dynamically.  Each cell is a textbox allowing any type of text input. Patterns can be looked up from the dictionary with their names and parameters. When a cell is active, it triggers the pattern with appropriate name and applies parameters in an ordered fashion.  See `parameters` for various types.

Please note that Tidal channel names has to be defined appropriately in `tidal-boot-default.hs` or compiled using `console`.
**Transitions:** Transition functions for TidalCycles
*example in Figure (b)*- Transition function (i.e. `(clutchIn 4)`)
**Type:** Channel type, possible types; Tidal, SuperCollider

#### Cells
Cells of the channels serve as a canvas for pattern names and pattern parameters. Pressing `Enter` on the cells selects the cell. 
Navigation through cells are possible with arrow keys, a cell can be compiled with `Alt + Enter ` once it's selected. 
Multiple cells can be selected using the `Shift` + arrow keys which then can be copied and pasted.

### Pattern Parameters

Siren allows patterns to be parameterized and can be called with different parameters from different cells in the channel. 

### Random Parameters
`|x,y|` returns a random value within the `x` and `y` 

## Patterns
Disclaimer: Please omit the channel number and dollar sign on Tidal commands (instead of `d1 $ sound "bd"` just write `sound "bd"`)

Tidal patterns are stored in the `dictionary` on the right hand side of the interface. This dictionary is unique for each scene and interacts with the sequencer in terms of parameters and calls.

#### Temporal parameter 
 `t`  represents the temporal parameter for each timer and it can be used in expressions to create complex values, especially with math expressions.

#### Mathematical expressions 
Mathematical expressions can be used in the patterns in the dictionary, parser evaluates the expressions when enclosed with `&` symbol.*example in Figure (c)*- Math expression enclosed by `& ... &` (i.e. in the body of `jvv`: ```... [~ f3 &`t`%3 &] ~ ...```)


#### Value Parameters
Any character sequence inside Siren pattern can be parameterized by surrounding desired spot with \` symbol (like surrounding a phrase for Markdown code block). Using this feature, you can not only pass well-tuned values dynamically, but also pass anything you want.

```haskell
n `x` # s `y` 
```
This can be called with any `x`or  `y` value such as (assume it's named as `tidalpat`):
``` tidalpat `"{3*4}%3"` `"bd"` ``` 
or
``` tidalpat `"{3*4 4*2}%3"` `"bd"` ``` 

### Pattern History
This module stores the successfully compiled Tidal patterns to keep track of the running sequences.

### Console
This module serves as a CLI(Command-Line-Interface) to Haskell and SuperCollider 

### Globals

This is an experimental module that can be toggled using right click menu. There are two sections dedicated to appending and prepending to the running code. `ctrl+enter` activates the code and sections can be recalled by creating presets. Pressing `Rec` button saves the active modifiers. `shift+ click` clears the desired slot and `alt+ click` overwrites it. These modifiers are applied to the patterns shown in the pattern history section. (i.e active patterns)Channels that you want to modify can also be specified using the `channel` section in the submenu. Writing `1 2` will make the modifiers only affect the first two channels, `0` is a special case and means that modifiers will be applied to all channels in the scene. Last row is the global parameter that can be dynamically added to the ecosystem.

### Pattern Roll & Future Patterns


Inspired by the piano-roll in traditional DAWs, operates as the playback visualization tool. A series of pre-compiliation are included within the boot function to support the visualisation of the `future` Tidal patterns. 
To be able to use this tool, pattern names needs to be written with `x` prefix instead of the usual `d` such as `x1`.
The horizontal axis denotes quantized time bins, and vertical lists the names of unique samples and notes. The visibility of labeling on the vertical axis can be toggled to reduce clutter. Default sequence length is 8 sec- onds and each second is quantized into 12 bins. Both parameters can be edited using the dedicated fields on the interface.


### Paths
In this module, it’s possible to set various settings of Siren such as startup configs or various paths.

### Debug Console
This module serves as a debug console for GHC. 

## Notes


## TODO

## Known Bugs



