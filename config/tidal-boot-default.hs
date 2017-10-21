:set prompt ""
:module Sound.Tidal.Context

import Sound.Tidal.Utils
import Sound.Tidal.Scales
import Sound.Tidal.Chords
import Data.Maybe
import Sound.OSC.FD

import Sound.Tidal.MIDI.Machinedrum
import Sound.Tidal.MIDI.Context
import Sound.Tidal.MIDI.Output

(cps, getNow) <- bpsUtils

dx1 <- dxStream
dx2 <- dxStream
dx3 <- dxStream

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

m1 <- midiStream devices "USB MIDI Device Port 1" 1 machinedrumController
m2 <- midiStream devices "USB MIDI Device Port 1" 2 machinedrumController
m3 <- midiStream devices "USB MIDI Device Port 1" 3 machinedrumController
m4 <- midiStream devices "USB MIDI Device Port 1" 4 machinedrumController
m5 <- midiStream devices "USB MIDI Device Port 2" 1 synthController
m6 <- midiStream devices "USB MIDI Device Port 2" 2 synthController
m7 <- midiStream devices "USB MIDI Device Port 2" 3 synthController
m8 <- midiStream devices "USB MIDI Device Port 2" 4 synthController

let bps x = cps (x/2)
    hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,m1,m2,m3,m4,m5,m6,m7,m8,m9,dx1,dx2,dx3]
    mjou = mapM_ ($ silence) [m1,m2,m3,m4,m5,m6,m7,m8,m9]
    jou = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9]
    solo = (>>) hush


-- custom Tidal transform/effect functions
-- chordP p = unwrap $ fmap (\name -> stack $ (pure <$>) $ fromMaybe [] $ lookup name chordTable) p


let cap a b p = within (0.25, 0.75) (slow 2 . rev . stut 8 a b) p
    capj a b p = within (0.5, 0.75) (jux(rev) . stut 8 a b) p
    capf a b p = within (0.75, 0.95) (fast 2 . stut 4 a b) p
    cap' a b c d e p = within (a, b) (slow 2 . rev . stut c d e) p
    capz a b p = within (0.5, 0.85) (trunc 0.5 . iter 3 . stut 4 a b) p
    layer fs p = stack $ map ($ p) fs
    ddelayfeedback = mf "ddelayfeedback"
    ddelay = mf "ddelay"
    ddelaytime = mf "ddelaytime"
    hpdub = mf "hpdub"
    lpdub = mf "lpdub"
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
    binscr = mf "binscr"
    binshf = mf "binshf"
    binfrz = mf "binfrz"
    conv = mf "conv"
    lcutoff = mf "lcutoff"
    lresonance = mf "lresonance"
    sfcutoff = mf "sfcutoff"
    sfresonance = mf "sfresonance"
    sfdecay = mf "sfdecay"
    sfsustain = mf "sfsustain"
    sfrelease = mf "sfrelease"
    ff = mf "ff"
    bsize = mf "freeze"
    soffset = mf "soffset"
    sfwidth = mf "sfwidth"
    sfmode = mf "sfmode"
    vifx = mf "vifx"
    vic = mf "vic"
    sscale = mf "sscale"
    soffset = mf "soffset"
    stimescale = mf "stimescale"
    swidthmod = mf "swidthmod"
    svowel = mf "svowel"
    slag = mf "slag"
    sdepth = mf "sdepth"
    swidth = mf "swidth"
    swidth2 = mf "swidth2"
    svib = mf "svib"
    srate = mf "srate"
    sfreq = mf "sfreq"
    sres = mf "sres"
    sparkle = mf "sparkle"
    sparklef = mf "sparklef"
    amdist = mf "amdist"
    amdistf = mf "amdistf"
    fmdist = mf "fmdist"
    fmdistf = mf "fmdistf"
    (fattack, fattack_p) = pF "fattack" (Just 0)
    (fhold, fhold_p) = pF "fhold" (Just 1)
    (frelease, frelease_p) = pF "frelease" (Just 0)
    (fenv, fenv_p) = pF "fenv" (Just 0)
    fmod = grp [fenv_p, fattack_p, fhold_p, frelease_p]
    flfo = mf "flfo"
    flfof = mf "flfof"
    allpass = mf "allpass"
    (sfcutoff, sfcutoff_p) = pF "sfcutoff" (Just 1000)
    (sfresonance, sfresonance_p) = pF "sfresonance" (Just 0)
    (sfattack, sfattack_p) = pF "sfattack" (Just 0)
    (sfrelease, sfrelease_p) = pF "sfrelease" (Just 0)
    (sfenv, sfenv_p) = pF "sfenv" (Just 0)
    sfmod = grp [sfcutoff_p, sfresonance_p, sfenv_p, sfattack_p, sfrelease_p]
    (ddelayfeedback, ddelayfeedback_p) = pF "ddelayfeedback" (Just 0)
    (ddelay, ddelay_p) = pF "ddelay" (Just 0)
    (ddelaytime, ddelaytime_p) = pF "ddelaytime" (Just 0)
    (hpdub, hpdub_p) = pF "hpdub" (Just 0)
    (lpdub, lpdub_p) = pF "lpdub" (Just 0)
    (vifx, vifx_p) = pF "vifx" (Just 0)
    (vic, vic_p) = pF "vic" (Just 1)
    (freeze, freeze_p) = pF "freeze" (Just 1)
    (ff, ff_p) = pF "ff" (Just 440)
    (bsize, bsize_p) = pF "bsize" (Just 2048)
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
    (sfdecay, sfdecay_p) = pF "sfdecay" (Just 0)
    (sfsustain, sfsustain_p) = pF "sfsustain" (Just 0)
    (sfwidth, sfwidth_p) = pF "sfwidth" (Just 0)
    (sfdepth, sfdepth_p) = pF "sfdepth" (Just 0)
    (sfenv, sfenv_p) = pF "sfenv" (Just 0)
    (sfmode, sfmode_p) = pF "sfmode" (Just 0)
    (pbend, pbend_p) = pF "pbend" (Just 1)
    sfmod = grp [sfcutoff_p, sfresonance_p, sfenv_p, sfattack_p, sfrelease_p]
    (cpcutoff, cpcutoff_p) = pF "cpcutoff" (Just 500)
    (note3, note3_p) = pF "note3" (Just 44)
    (note2, note2_p) = pF "note2" (Just 48)
    (note, note_p) = pF "note" (Just 0)
    (octer, octer_p) = pF "octer" (Just 1)
    (octersub, octersub_p) = pF "octer" (Just 1)
    (octersubsub, octersubsub_p) = pF "octersubsub" (Just 01)
    (kcutoff, kcutoff_p) = pF "kcutoff" (Just 5000)
    (krush, krush_p) = pF "krush" (Just 1)
    (wshap, wshap_p) = pF "wshap" (Just 1)
    (maxdel, maxdel_p) = pF "maxdel" (Just 10)
    (edel, edel_p) = pF "edel" (Just 1)
    (thold, thold_p) = pF "thold" (Just 0)
    (tlen, tlen_p) = pF "tlen" (Just 1)
    (trate, trate_p) = pF "trate" (Just 12)
    (binscr, binscr_p) = pF "binscr" (Just 0)
    (binshf, binshf_p) = pF "binshf" (Just 0)
    (binfrz, binfrz_p) = pF "binfrz" (Just 0)
    (conv, conv_p) = pF "conv" (Just 0)
    (decayCurve, decayCurve_p) = pF "decayCurve" (Just 0)
    (noiseDecay, noiseDecay_p) = pF "noiseDecay" (Just 0)
    (filterType, filterType_p) = pF "filterType" (Just 0)
    (filterFreq, filterFreq_p) = pF "filterFreq" (Just 0)
    (filterRQ, filterRQ_p) = pF "filterRQ" (Just 0)
    (impactDecay, impactDecay_p) = pF "impactDecay" (Just 0)
    (impactFreq, impactFreq_p) = pF "impactFreq" (Just 0)
    (impactWidth, impactWidth_p) = pF "impactWidth" (Just 0)
    (impactSweep, impactSweep_p) = pF "impactSweep" (Just 0)
    (shellDecay, shellDecay_p) = pF "shellDecay" (Just 0)
    (shellFreq, shellFreq_p) = pF "shellFreq" (Just 0)
    (shellSweep, shellSweep_p) = pF "shellSweep" (Just 0)
    (shellNoiseModSource, shellNoiseModSource_p) = pF "shellNoiseModSource" (Just 0)
    (shellNoiseModDepth, shellNoiseModDepth_p) = pF "shellNoiseModDepth" (Just 0)
    (shellModFreq, shellModFreq_p) = pF "shellModFreq" (Just 0)
    (trigRate, trigRate_p) = pF "trigRate" (Just 0)
    (distance, distance_p) = pF "distance" (Just 0)
    (bodyMix, bodyMix_p) = pF "bodyMix" (Just 0)
    (szarate, szarate_p) = pF "szarate" (Just 0)
    (szadepth, szadepth_p) = pF "szadepth" (Just 0)
    (szaphase, szaphase_p) = pF "szaphase" (Just 0)
    (szadelay, szadelay_p) = pF "szadelay" (Just 0)
    (rateVariation, rateVariation_p) = pF "rateVariation" (Just 0)
    (depthVariation, depthVariation_p) = pF "depthVariation" (Just 0)
    (pwidth, pwidth_p) = pF "pwidth" (Just 0)
    (iphase, iphase_p) = pF "iphase" (Just 0)
    (flfo, flfo_p) = pF "flfo" (Just 0)
    (flfof, flfof_p) = pF "flfof" (Just 0)
    (lfowdt, lfowdt_p) = pF "lfowdt" (Just 0)
    (lfort, lfort_p) = pF "lfort" (Just 0)
    (endSpeed, endSpeed_p) = pF "endSpeed" (Just 0)
    (tres, tres_p) = pF "tres" (Just 0)
    (fragmentlength, fragmentlength_p) = pF "fragmentlength" (Just 0)
    (lresonance, l_resonance_p) = pF "lresonance" (Just 0)
    (lcutoff, lcutoff_p) = pF "lcutoff" (Just 0)
    (srate, srate_p) = pF "srate" (Just 0)
    (sscale, sscale_p) = pF "sscale" (Just 0)
    (soffset, soffset_p) = pF "soffset" (Just 0)
    (stimescale, stimescale_p) = pF "stimescale" (Just 0)
    (swidthmod, swidthmod_p) = pF "swidthmod" (Just 0)
    (swidthmod2, swidthmod2_p) = pF "swidthmod2" (Just 0)
    (svowel, svowel_p) = pF "svowel" (Just 0)
    (slag, slag_p) = pF "slag" (Just 0)
    (swidth, swidth_p) = pF "swidth" (Just 0)
    (swidth2, swidth2_p) = pF "swidth2" (Just 0)
    (svib, svib_p) = pF "svib" (Just 0)
    (sdepth, sdepth_p) = pF "sdepth" (Just 0)
    (svib2, svib2_p) = pF "svib2" (Just 0)
    (sdepth2, sdepth2_p) = pF "sdepth2" (Just 0)
    (srate, srate_p) = pF "srate" (Just 0)
    (sfreq, sfreq_p) = pF "sfreq" (Just 0)
    (sres, sres_p) = pF "sres" (Just 0)
    (xsdelay, xsdelay_p) = pF "xsdelay" (Just 0)
    (tsdelay, tsdelay_p) = pF "tsdelay" (Just 0)
    (comb, comb_p) = pF "comb" (Just 0)
    (smear, smear_p) = pF "smear" (Just 0)
    (scram, scram_p) = pF "scram" (Just 0)
    (binshift, binshift_p) = pF "binshift" (Just 0)
    adsr = grp [attack_p, decay_p, sustain_p, release_p]
    del = grp [delay_p, delaytime_p, delayfeedback_p]
    lc = grp [cutoff_p, resonance_p]
    hc = grp [hcutoff_p, hresonance_p]
    bp = grp [bandf_p, bandq_p]
    io = grp [begin_p, end_p]




:set prompt "tidal> "



