:set prompt ""
:module Sound.Tidal.Context
import qualified Sound.Tidal.Scales as Scales
import Sound.OSC.FD
import Sound.Tidal.MIDI.Context
import Sound.Tidal.MIDI.Output
import Sound.Tidal.MIDI.Machinedrum
import Data.Maybe

import DxSevenOSC
z1 <- dxStream

procF_t <- openUDP "127.0.0.1" 12000
procF_v <- openUDP "127.0.0.1" 12000
procS1 <- openUDP "127.0.0.1" 12000
procS2 <- openUDP "127.0.0.1" 12000
procS3 <- openUDP "127.0.0.1" 12000
procS4 <- openUDP "127.0.0.1" 12000
scdx <- openUDP "127.0.0.1" 57120

(cps, getNow) <- bpsUtils
devices <- midiDevices

m1 <- midiStream devices "USB MIDI Device Port 1" 1 machinedrumController
m2 <- midiStream devices "USB MIDI Device Port 1" 2 machinedrumController
m3 <- midiStream devices "USB MIDI Device Port 1" 3 machinedrumController
m4 <- midiStream devices "USB MIDI Device Port 1" 4 machinedrumController
m5 <- midiStream devices "USB MIDI Device Port 1" 5 machinedrumController


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



-- custom Tidal transform/effect functions

let rip a b p = within (0.25, 0.75) (slow 2 . rev . stut 8 a b) p
    rip' a b c d e p = within (a, b) (slow 2 . rev . stut c d e) p
    spike p = ((|+| delaytime (scale 0.001 0.3 $ slow 7.1 sine1)) . (|+| delayfeedback (scale 0.7 0.99 $ slow 6.71 sine1))) $ p
    spike' p = (|+| delay "0.3") $ spike $ p
    gtfo p = (const $ sound "~") p
    shift p = (1024 <~)  p
    shift' x p = (x <~) p
    choose xs = (xs !!) <$> (irand $ fromIntegral $ length xs)
    one p = stut' 1 (0.125/2) (|*| gain "1") $ p
    one' p = rarely (stut' 1 (0.125/2) (|*| gain "1")) $ shift' 1024 $ p
    one'' p = sometimes (stut' 1 (0.125/2) (|*| gain "1")) $ shift' 1024 $ p
    rep n p = stut' (n-1) (0.125*3) (|*| gain "1") $ p
    rep' n p = stut' (n-1) (0.125/2*3) (|*| gain "1") $ p
    rep'' n p = stut' (n-1) (0.125/4*3) (|*| gain "1") $ p
    prog = (|+| note "{0 0 0 2 2}%1")
    timemod p = whenmod 28 18 (foldEvery [2,3,4] (0.25 <~)) $ p
    progwav = (|+| up "{0 0 0 2 2}%1")



let (degree, degree_p) = pF "degree" (Nothing)
   (ctranspose, ctranspose_p) = pF "ctranspose" (Nothing)
   (mtranspose, mtranspose_p) = pF "mtranspose" (Nothing)
   (gtranspose, gtranspose_p) = pF "gtranspose" (Nothing)
   (harmonic, harmonic_p) = pF "harmonic" (Nothing)
   (detune, detune_p) = pF "detune" (Nothing)
   (scale, scale_p) = pS "scaleName" (Nothing)
   (tuning, tuning_p) = pS "tuningName" (Nothing)
   (stepsPerOctave, stepsPerOctave_p) = pI "stepsPerOctave" (Nothing)
   (octaveRatio, octaveRatio_p) = pF "octaveRatio" (Nothing)


-- params

(hpdub, hpdub_p) = pF "hpdub" (Just 0)
(lpdub, lpdub_p) = pF "lpdub" (Just 0)
mf x = fst $ pF x (Just 0)
mi x = fst $ pI x (Just 0)
fm = mf "fm"
fmf = mf "fmf"
modamp = mf "modamp"
modfreq = mf "modfreq"
feedback = mf "feedback"
wub = mf "wub"
wubn = mf "wubn"
wubf = mf "wubf"
wubw = mf "wubw"
wubd = mf "wubd"
wubt = mf "wubt"
wubp = mf "wubp"
wubv = mf "wubv"
wrap = mf "wrap"
wrapoff = mf "wrapoff"
rect = mf "rect"
rectoff = mf "rectoff"
envsaw = mf "envsaw"
envsawf = mf "envsawf"
envtri = mf "envtri"
envtrif = mf "envtrif"
amt = mf "amt"
ampdtf = mf "ampdtf"
dtfq = mf "dtfq"
dtfnoise = mf "dtfnoise"
dtftype = mf "dtftype"
rate = mf "rate"
threshdtf = mf "threshdtf"
onsetdtf = mf "onsetdtf"
dtfreq = mf "dtfreq"
octer = mf "octer"
octersub = mf "octersub"
octersubsub = mf "octersubsub"
ring = mf "ring"
ringf = mf "ringf"
comp = mf "comp"
compa = mf "compa"
compr = mf "compr"
distort = mf "distort"
boom = mf "boom"
gboom = mf "gboom"
tape = mf "tape"
taped = mf "taped"
tapefb = mf "tapefb"
tapec = mf "tapec"
vibrato = mf "vibrato"
vrate = mf "vrate"
leslie = mf "leslie"
lrate = mf "lrate"
lsize = mf "lsize"
maxdel = mf "maxdel"
edel = mf "edel"
krushf = mf "krushf"
krush = mf "krush"
wshap = mf "wshap"
perc = mf "perc"
percf = mf "percf"
freeze = mf "freeze"
thold = mf "thold"
tlen = mf "tlen"
trate = mf "trate"

(ts, ts_p) = pF "ts" (Just 1)
(cone, cone_p) = pF "cone" (Just 1)
(ctwo, ctwo_p) = pF "ctwo" (Just 0)
(cfhzmin, cfhzmin_p) = pF "cfhzmin" (Just 0)
(cfhzmax, cfhzmax_p) = pF "cfhzmax" (Just 1)
(cfhmin, cfhmin_p) = pF "cfhmin" (Just 500)
(cfmax, cfmax_p) = pF "cfmax" (Just 2000)
(cfmin, cfmin_p) = pF "cfmin" (Just 0)
(rqmin, rqmin_p) = pF "rqmin" (Just 0)
(rqmax, rqmax_p) = pF "rqmax" (Just 1)
(lsf, lsf_p) = pF "lsf" (Just 200)
(ldb, ldb_p) = pF "ldb" (Just 1)
(ffreq,ffreq_p) = pF "ffreq"(Just 1000)
(preamp, preamp_p) = pF "preamp" (Just 4)
(dist, dist_p) = pF "dist" (Just 0)
(smooth, smooth_p) = pF "smooth" (Just 0)
(click, click_p) = pF "click" (Just 0)
(hfeedback, hfeedback_p) = pF "hfeedback" (Just 0)
(hena,hena_p)= pF "hena"(Just 1)
(henb,henb_p)= pF "henb"(Just 0)
(phfirst, phfirst_p) = pF "phfirst" (Just 0)
(phlast, phlast_p) = pF "phlast" (Just 5)
(fattack, fattack_p) = pF "fattack" (Just 0)
(fhold, fhold_p) = pF "fhold" (Just 1)
(frelease, frelease_p) = pF "frelease" (Just 0)
(fenv, fenv_p) = pF "fenv" (Just 0)
fmod = grp [fenv_p, fattack_p, fhold_p, frelease_p]
(sfcutoff, sfcutoff_p) = pF "sfcutoff" (Just 1000)
(sfresonance, sfresonance_p) = pF "sfresonance" (Just 0)
(sfattack, sfattack_p) = pF "sfattack" (Just 0)
(sfrelease, sfrelease_p) = pF "sfrelease" (Just 0)
(sfenv, sfenv_p) = pF "sfenv" (Just 0)
(pbend, pbend_p) = pF "pbend" (Just 1)
sfmod = grp [sfcutoff_p, sfresonance_p, sfenv_p, sfattack_p, sfrelease_p]
(cpcutoff, cpcutoff_p) = pF "cpcutoff" (Just 500)
(note3, note3_p) = pF "note3" (Just 44)
(note2, note2_p) = pF "note2" (Just 48)
(note, note_p) = pF "note" (Just 0)
(octer, octer_p) = pF "octer" (Just 1)
(octersub, octersub_p) = pF "octer" (Just 1)
(octersubsub, octersubsub_p) = pF "octersubsub" (Just 01)
(freeze, freeze_p) = pF "freeze" (Just 1)
(ff, ff_p) = pF "ff" (Just 440)
(bsize, bsize_p) = pF "bsize" (Just 2048)
(kcutoff, kcutoff_p) = pF "kcutoff" (Just 5000)
(krush, krush_p) = pF "krush" (Just 1)
(wshap, wshap_p) = pF "wshap" (Just 1)
(maxdel, maxdel_p) = pF "maxdel" (Just 10)
(edel, edel_p) = pF "edel" (Just 1)
(thold, thold_p) = pF "thold" (Just 0)
(tlen, tlen_p) = pF "tlen" (Just 1)
(trate, trate_p) = pF "trate" (Just 12)


:set prompt "tidal> "
