:set prompt ""
:module Sound.Tidal.Context
import Sound.Tidal.Utils
import Sound.Tidal.Scales
import Sound.Tidal.Chords
import Data.Maybe
import Control.Applicative
import Data.Char (digitToInt)

import Sound.Tidal.MIDI.CC
import Sound.Tidal.MIDI.Context

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

m1 <- midiStream devices "USB MIDI Device Port 1" 1 ccallController
m2 <- midiStream devices "USB MIDI Device Port 1" 2 ccallController
m3 <- midiStream devices "USB MIDI Device Port 1" 3 ccallController
m4 <- midiStream devices "USB MIDI Device Port 1" 4 ccallController
m5 <- midiStream devices "USB MIDI Device Port 2" 1 ccallController
m6 <- midiStream devices "USB MIDI Device Port 2" 2 ccallController
m7 <- midiStream devices "IAC Bus 1" 1 ccallController
m8 <- midiStream devices "USB MIDI Device Port 2" 4 ccallController

let bps x = cps (x/2)
    hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,m1,m2,m3,m4,m5,m6,m7,m8]
    mjou = mapM_ ($ silence) [m1,m2,m3,m4,m5,m6,m7,m8]
    djou = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8]
    jou = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,m1,m2,m3,m4,m5,m6,m7,m8]
    solo = (>>) hush


-- custom Tidal transforms/params
:script /Users/canince/Documents/GitHub/Siren/config/tidalfuncs.hs
:script /Users/canince/Documents/GitHub/Siren/config/tidalparams.hs
:set prompt "tidal> "



