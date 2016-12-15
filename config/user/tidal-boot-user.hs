:set prompt ""
:module Sound.Tidal.Context
import Sound.Tidal.Scales
import Sound.Tidal.MIDI.Context
import Sound.Tidal.MIDI.RMControllerMIDI
import Sound.OSC.FD

procF_t <- openUDP "127.0.0.1" 12000
procF_v <- openUDP "127.0.0.1" 12000
procS1 <- openUDP "127.0.0.1" 12000
procS2 <- openUDP "127.0.0.1" 12000
procS3 <- openUDP "127.0.0.1" 12000
procS4 <- openUDP "127.0.0.1" 12000


displayOutputDevices >>= putStrLn
devices <- midiDevices
m1 <- midiStream devices "Analog Rytm Elektron MIDI" 1 rmController
m2 <- midiStream devices "Analog Rytm Elektron MIDI" 2 rmController
m3 <- midiStream devices "Analog Rytm Elektron MIDI" 3 rmController
m4 <- midiStream devices "Analog Rytm Elektron MIDI" 4 rmController
m5 <- midiStream devices "Analog Rytm Elektron MIDI" 5 rmController
m6 <- midiStream devices "Analog Rytm Elektron MIDI" 6 rmController
m7 <- midiStream devices "Analog Rytm Elektron MIDI" 7 rmController
m8 <- midiStream devices "Analog Rytm Elektron MIDI" 8 rmController
m9 <- midiStream devices "Analog Rytm Elektron MIDI" 9 rmController
m10 <- midiStream devices "Analog Rytm Elektron MIDI" 10 rmController
m11 <- midiStream devices "Analog Rytm Elektron MIDI" 11 rmController
m12 <- midiStream devices "Analog Rytm Elektron MIDI" 12 rmController
m13 <- midiStream devices "Analog Rytm Elektron MIDI" 13 rmController

import Sound.Tidal.MIDI.Context
import Sound.Tidal.Scales


(cps, getNow) <- bpsUtils

(c1,ct1) <- dirtSetters getNow
(c2,ct2) <- dirtSetters getNow
(c3,ct3) <- dirtSetters getNow
(c4,ct4) <- dirtSetters getNow
(c5,ct5) <- dirtSetters getNow
(c6,ct6) <- dirtSetters getNow
(c7,ct7) <- dirtSetters getNow
(c8,ct8) <- dirtSetters getNow
(c9,ct9) <- dirtSetters getNow

(d1,t1) <- superDirtSetters getNow
(d2,t2) <- superDirtSetters getNow
(d3,t3) <- superDirtSetters getNow
(d4,t4) <- superDirtSetters getNow
(d5,t5) <- superDirtSetters getNow
(d6,t6) <- superDirtSetters getNow
(d7,t7) <- superDirtSetters getNow
(d8,t8) <- superDirtSetters getNow
(d9,t9) <- superDirtSetters getNow


let bps x = cps (x/2)
let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,c1,c2,c3,c4,c5,c6,c7,c8,c9]
let solo = (>>) hush

:set prompt "tidal> "
