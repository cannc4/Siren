:set prompt ""
:module Sound.Tidal.Context
import Sound.Tidal.Scales
import Sound.OSC.FD

import ProcessingOSC
v1 <- testStream

import UnityOSC
u1 <- unityStream

max <- openUDP "127.0.0.1" 12000
procF_v <- openUDP "127.0.0.1" 12000

procS1 <- openUDP "127.0.0.1" 12000
procS2 <- openUDP "127.0.0.1" 12000
procS3 <- openUDP "127.0.0.1" 12000
procS4 <- openUDP "127.0.0.1" 12000

d_OSC <- openUDP "127.0.0.1" 12000

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


let bps x = cps (x/2)
let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,m1,m2,m3,m4]
let mjou = mapM_ ($ silence) [m1,m2,m3,m4]
let jou = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9]
let solo = (>>) hush

:set prompt "tidal> "
