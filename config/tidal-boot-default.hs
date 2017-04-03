:set prompt ""
:module Sound.Tidal.Context
:module Sound.Tidal.Context.Time
import Sound.Tidal.Scales
import Sound.OSC.FD
import Sound.Tidal.MIDI.Context
import qualified Sound.Tidal.Scales as Scales
import Data.Maybe


procF_t <- openUDP "127.0.0.1" 12000
procF_v <- openUDP "127.0.0.1" 12000
procS1 <- openUDP "127.0.0.1" 12000
procS2 <- openUDP "127.0.0.1" 12000
procS3 <- openUDP "127.0.0.1" 12000
procS4 <- openUDP "127.0.0.1" 12000
d_OSC <- openUDP "127.0.0.1" 12000

(cps, getNow) <- bpsUtils
devices <- midiDevices

m1 <- midiStream devices "USB MIDI Device Port 2" 3 rmController

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

--- helper operators

let (***) = foldl (|*|)
    (+++) = foldl (|+|)
    (###) = foldl (#)
    outside n f p = slow n $ f (density n p)
    every' n o f = when ((== o) . (`mod` n)) f
    withArc (s,e) f p = stack [sliceArc (0,s) p, f $ sliceArc (s,e) p, sliceArc (e,1) p]
    shiftArc (s,e) t = withArc (s,e) (t ~>)
    beginend bpat durpat = (begin bpat) # (end $ (+) <$> bpat <*> durpat)
    flange n t p = stack [ (toRational i*t) ~> p # begin (pure $ i/n) # end (pure $ (i+1)/n) | i <- [0..n-1] ]
    sometimesBy' x f p = (1024 ~>) $ sometimesBy x f p
    pingpongBy x fb tL tR cps f p = stack [ p,
                                 (tL ~> (f p)) # pan (pure $ (1-x)/2) |*| ddd,
                                 ((tL+tR) ~> (f p)) # pan (pure $ (x+1)/2) |*| ddd ]
              where ddd = delay (pure fb) |*| delaytime (pure $ fromRational $ (tL+tR)/cps) |*| delayfeedback (pure fb)
    pingpong = pingpongBy 1
    pingpong0 = pingpong 0
    padd = liftA2 (+)
    pfold op xs = foldl1 (liftA2 op) xs
    psum = pfold (+)
    rep = replicate
    juxp panpat f p = stack [p # pan panpat, f $ p # pan (fmap (1-) panpat)]
    take' n m xs = map (xs!!) [m..n+m-1]
    ngap n d = inside n (densityGap d)
    swing n = inside n (within (0.5,1) (0.3333 ~>))
    swingBy n x = inside n (within (0.5,1) (x ~>))
    swingEvery n e = inside n (every e $ within (0.5,1) (0.3333 ~>))
    necho x = echo $ negate x
    ntrip x = triple $ negate x
    somecyclesBy x = when (test x)
      where test x c = (timeToRand $ fromIntegral c) < x
    somecycles = somecyclesBy 0.5
    creak n t p = stack [(x*(x+1)*t/2) ~> p | x <- take n [0..]]
    dropAfter x = within (x,1) (const silence)
    fractal3 = lindenmayer 30 "0:0-1-,1:22,2:-2--001-,-:-10-" "0"
    cyclerand n = Pattern $ \(s,e) -> [((s,e),(s,e),timeToRand $ fromIntegral $ (floor $ sam s) `mod` n)] -- a new random number each cycle, looping after n cycles
    cycleirand m n = Pattern $ \(s,e) -> [((s,e),(s,e), floor $ (*m) $ timeToRand $ fromIntegral $ (floor $ sam s) `mod` n)] -- a new random number each cycle, looping after n cycles
    doublejuxBy x fl fr p = stack[p, fl p # pan (pure $ 0.5-x/2), fr p # pan (pure $ 0.5+x/2)]
    doublejux = doublejuxBy 1
    decho t p = doublejux (t ~>) ((t+t/2) ~>) p
    nstep n sd str = Pattern $ \(s,e) -> arc (step sd $ take' n (floor (s+2048) * n) $ cycle str) (s,e) -- the 2048 is a workaround due to shifting from sometimesBy' or other sources
    scalex from to p = exp <$> scale (log from) (log to) p
    arp ns t p = stack $ map (tshift p) (zip (0:ns) (fmap (* t) [0.0 ..]))
      where tshift p (n,t) = t ~> (fmap (+n) p)
    arp' ns t p = stack $ map (tshift p) (zip ("0":ns) (fmap (* t) [0.0 ..]))
      where tshift p (n,t) = t ~> (padd p n)
    funrun m n = every 2 (fmap (+ m)) $ run n
    irand2 x y = fmap (+x) $ irand (y - x)
    rand' x = Pattern $ \a -> [(a, a, timeToRand $ (+ x/100) $ midPoint a)]
    quiet = const silence
    oct t = (echo (4*t)) . (quad t)
    stretch n p = slow n p |*| speed (pure $ fromRational $ 1/n) # unit "c"
    repeatCycles n p =  slowcat(replicate n p)
    degradeOverBy i tx p = unwrap $ (\x -> (fmap fst $ filterValues ((>x) .snd) $ (,) <$> p <*> repeatCycles i rand )) <$> (slow (fromIntegral i) tx )


    -- params
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
    perc = mf "perc"
    percf = mf "percf"
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
    sfmod = grp [sfcutoff_p, sfresonance_p, sfenv_p, sfattack_p, sfrelease_p]




:set prompt "tidal> "
