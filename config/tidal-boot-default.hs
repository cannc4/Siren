:set prompt ""
:module Sound.Tidal.Context

import Sound.Tidal.Utils
import Data.Maybe
import Sound.Tidal.MIDI.Context
import Sound.Tidal.MIDI.Output

(cps, getNow) <- bpsUtils

(d1,t1) <- superDirtSetters getNow
(d2,t2) <- superDirtSetters getNow
(d3,t3) <- superDirtSetters getNow
(d4,t4) <- superDirtSetters getNow
(d5,t5) <- superDirtSetters getNow
(d6,t6) <- superDirtSetters getNow
(d7,t7) <- superDirtSetters getNow
(d8,t8) <- superDirtSetters getNow
(d9,t9) <- superDirtSetters getNow

devices <- midiDevices
m1 <- midiStream devices "USB MIDI Device Port 1" 1 synthController
m2 <- midiStream devices "USB MIDI Device Port 1" 2 synthController
m3 <- midiStream devices "USB MIDI Device Port 1" 3 synthController
m4 <- midiStream devices "USB MIDI Device Port 1" 4 synthController

let bps x = cps (x/2)
    hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,m1,m2,m3,m4,m5,m6,m7,m8,m9]
    solo = (>>) hush

:set prompt "tidal> "



