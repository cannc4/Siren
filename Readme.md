What is this?

It’s a tactile event sequencer and tracker

Why do we use this?

To overcome the limitations


Which platforms?

Currently it’s a Supercollider based sampler and a MIDI sequencer but in theory it’s capable of sending messages to any OSC listener.


How does this work?

TBA


"To see the world in a grain of sand, and to see heaven in a wild flower, hold infinity in the palm of your hands, and eternity in an hour."  -William Blake



-----

How to install on Mac:

Install NodeJS 7+

Clone the repository

Download and move SuperCollider.app to ./deps

run bash at project folder

Install Dependencies
$ npm i

Start the server (to communicate with ghci)
$ npm run tidal

Run the Frontend
$ npm start

If you add samples, to replace ' 's (spaces) and '-'s (dashes)
$ npm run rename-samples


Last working on Mac OS X 10.12.1 Beta 16B2548a
