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


(cps, getNow) <- bpsUtils
devices <- midiDevices
displayOutputDevices >>= putStrLn

m1 <- midiStream devices "QUAD-CAPTURE" 1 synthController
m2 <- midiStream devices "QUAD-CAPTURE" 2 synthController
m3 <- midiStream devices "QUAD-CAPTURE" 3 synthController
m4 <- midiStream devices "QUAD-CAPTURE" 4 synthController

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

let (fltdec, fltdec_p) = pF "fltdec" (Just 0)
let (depth, depth_p) = pF "depth" (Just 0)
let (keymod, keymod_p) = pF "keymod" (Just 0)
let (fltrz, fltrz_p) = pF "fltrz" (Just 0)
let (amp, amp_p) = pF "amp" (Just 0)

let bps x = cps (x/2)
let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,c1,c2,c3,c4,c5,c6,c7,c8,c9]
let solo = (>>) hush

:set prompt "tidal> "
