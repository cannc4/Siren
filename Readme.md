## Siren
Initial words....

### Download 

In order to download a copy of the repository, either download repository `as a ZIP file` at [https://github.com/cannc4/sq](github.com/cannc4/sq), or use command line to `clone` repository.

```
git clone https://github.com/cannc4/Siren.git
```

### Build and Run

#### Dependencies:
Make sure the latest versions of following software are installed in your system

- [SuperCollider](http://supercollider.github.io/download.html)
- [TidalCycles](https://tidalcycles.org/getting_started.html)
- [NodeJS](https://nodejs.org/en/download/)

Then follow these lines to install package dependencies:

```
cd path/to/siren
npm i
```

In order to bind software dependencies, edit the full paths in `config/config.json` and save the file. Now you can start the interface
```
npm start
```

and initialize the backend
```
npm run siren
```


Tested on Windows 10 and MacOSX El Capitan.

### Usage

- Login using Github authentication to the system.
- Initialize `Tidal` 




"To see the world in a grain of sand, and to see heaven in a wild flower, hold infinity in the palm of your hands, and eternity in an hour."  -William Blake

-----

Start the server (to communicate with ghci)
$ npm run tidal

Run the Frontend
$ npm start

Last working on Mac OS X 10.12.1 Beta 16B2548a
