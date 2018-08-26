:set prompt ""
:module Sound.Tidal.Context

import Sound.Tidal.Chords
import Sound.Tidal.Scales
import Sound.Tidal.Utils
import Data.Maybe (fromMaybe, maybe, isJust, fromJust)
import Control.Applicative

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
(n1,tn1) <- superDirtSetters getNow
(n2,tn2) <- superDirtSetters getNow
(n3,tn3) <- superDirtSetters getNow
(n4,tn4) <- superDirtSetters getNow
(n5,tn5) <- superDirtSetters getNow
(n6,tn6) <- superDirtSetters getNow
(n7,tn7) <- superDirtSetters getNow
(n8,tn8) <- superDirtSetters getNow
(n9,tn9) <- superDirtSetters getNow

(v1,vn1) <- superDirtSetters getNow
(v2,vn2) <- superDirtSetters getNow
(v3,vn3) <- superDirtSetters getNow

(g2,tg2) <- superDirtSetters getNow


let bps x = cps (x/2)
    hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,n1,n2,n3,n4,n5,n6,n7,n8,n9]
    solo = (>>) hush


-- custom Tidal transforms/params
:script /Users/canince/Documents/git/Siren/deps/patterns/tidalfuncs.hs
:script /Users/canince/Documents/git/Siren/deps/patterns/tidalparams.hs
:script /Users/canince/Documents/git/Siren/deps/patterns/tidalnord.hs
:set prompt "tidal> "



