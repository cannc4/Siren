(
  var numChannels = ~dirt.numChannels;
  SynthDef(\noop, {}).add;

// tuning fork
// from my own experimentation and from "On the acoustics of tuning forks", Rossing Russell and Brown
SynthDef(\superfork, {|out, speed=1, sustain=1, decay=0, pan, freq, voice=0 |
	var sound, env;
	env = EnvGen.ar(Env.linen(0.001, 0.998, 0.001), timeScale:sustain, doneAction:2);
	sound = SinOsc.ar(freq) * XLine.ar(0.3, 1e-4, sustain*4);
	sound = SinOsc.ar(6.1*freq) * XLine.ar(1, 1e-7, sustain*4) + sound;
	sound = SinOsc.ar(16.7*freq) * XLine.ar(1.3, 1e-6, sustain/2) + sound;
	sound = SinOsc.ar(20.1*freq) * XLine.ar(2, 1e-7, sustain/3) + sound;
	sound = sound * 0.2;
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;

/*~bellA = [-19.4, -18.2, -17, -14.8, -23.2, -19, -19.4, -26.7, -21, -27.1, -39, -36.3];
~bellF = [1, 2.010752688172, 2.4408602150538, 4.0537634408602, 5.0430107526882, 5.9784946236559, 8.1827956989247, 10.559139784946, 13.021505376344, 15.58064516129, 18.172043010753, 20.806451612903];
~bellRing = [10, 8, 7, 9, 5, 6, 6, 8, 5, 4, 3, 7];


SynthDef(\bell, {
	arg f = 50, randLo, randHi, dur, out,sound;
	var sig, env;
	env = EnvGen.kr(Env.new([1, 0.001], [1], \exp), 1, timeScale:dur, doneAction:2);
	sig = LPF.ar(PinkNoise.ar, 10000);
	sig = DynKlank.ar(`[(~bellF*f)+ExpRand(randLo, randHi), ~bellA.dbamp, ~bellRing], sig)*0.025;
OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;*/

// hammond B3 sim
// freq adjustments courtesy Tom Wiltshire (electricdruid.net)
// drawbar settings selectable with "voice" and from many public domain sources,
// Google "Hammond drawbar settings" and add your own in the big SelectX block
// "perc" "percf" and "decay" are an attempt at the percussion, no idea if it sounds at all reasonable
// vintage Hammonds had percf as 2 or 3 (switchable), two perc levels (maybe roughly 0.7 and 1.2?),
// and two decay options (roughly 0 and maybe 1ish?)
// "vibrato", "vrate", "perc", "percf" are all new params you'll need to define in Tidal if you want to change them
SynthDef(\superhammond, {|out, speed=1, sustain=1, decay=0, pan, freq, vibrato=0.5, vrate=7,
	voice=0, perc=0, percf=2 |
	var freqs, amps, sound, click, env, ampscale, attrel;
	attrel = (sustain/2).clip(0,0.005);
	env = EnvGen.ar(Env.linen(attrel, sustain-(2*attrel), attrel), doneAction:2);
	freqs = [0.5, 1.4988, 1, 2, 2.9976, 4, 5.0409, 5.9953, 8] * freq;
	freqs = 2**(freqs < 63) * freqs; // fold up bottom register
	freqs = freqs / (2**(freqs > 6000)); // fold down high harmonics
	freqs = freqs / (2**(freqs > 6000)); // do it again for the really high notes
	amps = SelectX.kr(voice, [
		[1, 4, 5, 4, 3, 1, 0, 0, 0], // 0: bass violin 16'
		[0, 0, 8, 0, 4, 0, 0, 0, 0], // 1: tibia 8'
		[0, 7, 8, 1, 2, 0, 0, 0, 0], // 2: bassoon 8'
		[0, 0, 7, 8, 8, 8, 8, 7, 2], // 3: french trumpet 8'
		[4, 0, 5, 5, 4, 5, 3, 3, 6], // 4: string ensemble
		[8, 8, 5, 3, 2, 4, 5, 8, 8], // 5: Blues
		[8, 8, 8, 0 ,0, 0, 0, 0, 3], // 6: Jazz 1
		[8, 8, 8, 8, 8, 8, 8, 8, 8], // 7: Full Shout
		[8, 0, 0, 0, 0, 0, 8, 8, 8], // 8: Bro' Jack
		[0, 0, 8, 8, 0, 0, 0, 0, 0]  // 9: Jazz 2
	]);
	amps = amps - [0, 0, 0, 0, 0, 0, 0.5, 1, 1.5]; // damp brilliance a bit
	amps = 2**(amps-8);
	click = WhiteNoise.ar(1) * XLine.ar(1,1e-6, 0.1);
	sound = 0.5 * Mix.ar( SinOsc.ar(freqs*(2*click+1), (2pi ! 9).rand, amps/amps.sum) );
	sound = perc * 0.5 * SinOsc.ar(freq*percf, 2pi.rand) * XLine.ar(1,1e-6,2*decay+1) + sound;
	sound = sound + BAllPass.ar(sound, 1000*LFTri.kr(vrate,0,vibrato/2,1));
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;

// vibraphone simulator, adapted with some help from Kevin Larke's thesis Real Time Vibraphone Pitch and Timbre Classification
SynthDef(\supervibe, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, velocity=1,
	modamp=1, modfreq=7.0, detune=0 |
	// most envelope shaping is done with XLines later, this envelope is just to clean up overall
	var env = EnvGen.ar(Env.linen(0.001, 0.998, 0.001), timeScale:sustain, doneAction:2);
	var sound, mod, freqs, hifreqs, decays;
	freqs = freq * Line.kr(1, 1+accelerate, sustain) * [1, 4, 10, 13.75+detune];
	hifreqs = freq * Line.kr(1, 1+accelerate, sustain) * [19.2, 20, 21.2];
	mod = SinOsc.kr(modfreq, Rand(0,2pi)).range(1-([0.5,0.3,0.3,0.5]*modamp),1);
	sound = 0.3 * [1, 1.1*velocity, 0.6*velocity*velocity, 0.5*velocity] * SinOsc.ar(freqs);
	decays = [1, 0.7*exp(-1.0*decay), 0.5*exp(-1.0*decay), 0.4*exp(-1.0*decay)]; // use `decay` to damp harmonics
	sound = XLine.ar(1e-6, 1, 1/freqs) * XLine.ar(1, 1e-6, decays*4*sustain) * sound * mod; // main attacks and decays
	sound = (XLine.ar(0.3*(velocity+1e-6),1e-6,0.02) * SinOsc.ar(hifreqs)).sum + sound.sum; // hi frequency onset
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;

// Hoover, adapted from Wouter Snoei's
// http://superdupercollider.blogspot.com/2009/06/more-dominator-deconstruction.html
// could use some tweaking / more params?
SynthDef(\superhoover, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, slide=0|
	var env = EnvGen.ar(Env.pairs([[0,0],[0.03,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var pwm, mix, fglide;
	//fglide = EnvGen.ar(Env.perc(0.05, 0.5, 1, \lin)).range(1,1.25);
	fglide = EnvGen.ar(Env.perc(0.05, 0.3, 1, \lin), timeScale:sustain) * (-1*slide/4) + 1;
	freq = freq * fglide * Line.kr(1, 1+accelerate, sustain);
	//freq = SinOsc.kr( {2.9 rrand: 3.1}!3, {2pi.rand}!3 ).exprange(0.995, 1.005) * freq;
	freq = SinOsc.kr( {2.9 rrand: 3.1}!3, {2pi.rand}!3 ).exprange(0.995, 1.005) * freq;
	//pwm = SinOsc.kr( {2.0 rrand: 4.0}!3 ).range(1/8, 7/8);
	pwm = SinOsc.kr( {1.0 rrand: 5.0}!3 ).range(1/8, 7/8);
	mix = ([1,0.9,1.1]*LFSaw.ar(freq*[0.25, 0.5, 1], [1, 1.01, 1.02]).range(0,1) * (1 - LFPulse.ar(freq*[0.5,1,2], [0,0,0], pwm))).sum * 0.15;
	mix = mix + LFPar.ar(freq * 0.25, 0, 0.1).sum;
	mix = BPeakEQ.ar(mix, 6000, 1, 3);
	mix = BPeakEQ.ar(mix, 3500, 1, 6);
	//mix = LPF.ar(mix, 300,4);
	mix = mix.dup + CombC.ar(mix.dup, 1/200, SinOsc.kr(3, [0.5pi, 1.5pi]).range(1/300, 1/200), 0);
	mix = 1.5*Balance2.ar(mix[0], mix[1], pan*2-1);
	OffsetOut.ar(out, DirtPan.ar(mix, ~dirt.numChannels, 0.5, env, {|x| x}));
}).add;

SynthDef(\supercross, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0.0, detune=0.0,
	  pitch1=1, pitch2=2, vcoegint=0|
	var env = EnvGen.ar(Env.pairs([[0,0],[0.03,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq1 = pitch1 * freq * Line.kr(1, 1+accelerate, sustain);
	var basefreq2 = pitch2 * freq * Line.kr(1, 1+accelerate, sustain);
	var sound, sa, sb, loop, rlo, rhi;
	rlo = 1.0 - (0.9 * vcoegint);
	rhi = 1.0 + (0.9 * vcoegint);
	loop = LocalIn.ar(1);
	basefreq1 = clip(basefreq1 * loop.range(rlo,rhi), 2, 20000); // FM mod from osc 2
	sa = SelectX.ar(voice, [
		VarSaw.ar(basefreq1, 0, 0.5) - VarSaw.ar(basefreq1+detune, 0, 0.2),
		SinOsc.ar(basefreq1+detune,0.1) * loop.range(rlo,1), // ring mod for sine,
		LFTri.ar(basefreq1, 0) + LFTri.ar(basefreq1+detune, 0.1) * 0.5,
		Pulse.ar(basefreq1+detune, LPF.ar(loop.range(rlo/2,rhi/2), 50)) * 0.5 // mod pulse width for square
	]);
	basefreq2 = clip(basefreq2 * sa.range(rlo,rhi), 2, 20000); // FM mod from osc 1
	sb = SelectX.ar(voice, [
		VarSaw.ar(basefreq2-detune, 0.2, 0.2) - VarSaw.ar(basefreq2-detune, 0.2, 0.3),
		SinOsc.ar(basefreq2-detune,0.3) * sa.range(rlo,1), // ring mod for sine
		LFTri.ar(basefreq2-detune, 0.3) + LFTri.ar(basefreq2-detune, 0.2) * 0.5,
		Pulse.ar(basefreq2-detune, LPF.ar(sa.range(rlo/2,rhi/2), 50) ) * 0.5
	]);
	LocalOut.ar(DelayN.ar(sb,0.2, Line.ar(0,0.5,sustain)/basefreq1));
    sound = sa+sb;
	sound = LPF.ar(sound, XLine.ar(1,0.001,sustain, 20000));
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

// env on filter?, and try to play with saw
// doesn't actually sound anything like a 303
SynthDef(\super303, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0.0, slide=0,
	pitch1=1, pitch2=1, pitch3=1, fattack=0, fhold=1, frelease=0, fenv=0, cutoff=10000, resonance=0|
	//var env = EnvGen.ar(Env.pairs([[0,0],[0.1,1],[0.2,1-decay],[0.9,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var sound, glide, basefreq, env, env2, mix;
    env = EnvGen.ar(Env.perc(0.003, (1-decay)*2, 1, -3), timeScale:sustain, doneAction:2);
	env2= EnvGen.ar(Env.linen(fattack, fhold*sustain, frelease));
	glide = EnvGen.ar(Env.perc(0.05, 0.5, 1, \lin), timeScale:sustain) * (-1*slide/4) + 1;
	basefreq = freq * glide * Line.kr(1, 1+accelerate, sustain);
	//sound = clip(VarSaw.ar(basefreq, 0, 0.98) * (voice*20+1), -1, 1);
	sound = tanh(VarSaw.ar(basefreq, 0, 0.98)*(voice*20+1));
	//sound = 3*RLPFD.ar(sound, clip(basefreq*pitch1+(fenv*env2),2,20000), pitch2, pitch3);
	sound = 3*RLPFD.ar(sound, clip((cutoff*pitch1)+(fenv*env2*pitch2),2,10000), resonance, pitch3);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

// probably way too complicated, this synth has it's own set of filters, controllable with new parameters
// voice: 0 - saw, 1 - square (can go past 1 for noisy overdrive)
// slide: initial pitch glide, can be used to fake portamento
// decay: 0 is minimal decay, 1 will quickly decay to silence (you can also use the global release param for a different shape)
// sfcutoff, sfresonance, sfenv, sfattack, sfrelease: filter params for this synth only
//    the envelope shape for this synth is different from the global filter envelope
// vcfegint: advanced param for tweaking Q of bandpass (vcf for short)
// pitch1, pitch2: advanced params for tweaking lowpass and bandpass frequencies

// something I still don't like - CLEAN UP AND FIX
SynthDef(\super302, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0.0, slide=0,
	pitch1=1, pitch2=1, pitch3=1, sfattack=0, sfrelease=0, sfenv=0, sfcutoff=1000, sfresonance=0, vcfegint=0|
	var sound, glide, basefreq, env, env2, resq, loresq;
	env = EnvGen.ar(Env.new([1e-6,1,(1-decay)*0.5,1e-6], [0.003, 0.9, 0.007], 'exp'), timeScale:sustain, doneAction:2);
	// env2= EnvGen.ar(Env.perc(sfattack, sfrelease, 1, [-4,4]));
	env2 = EnvGen.ar(Env.linen(sfattack, 0, sfrelease));
	glide = EnvGen.ar(Env.perc(0.05, 0.5, 1, \lin), timeScale:sustain) * (-1*slide/4) + 1;
	basefreq = freq * glide * Line.kr(1, 1+accelerate, sustain);
	sound = tanh(VarSaw.ar(basefreq, 0, 0.98)+PinkNoise.ar(0.01*exp(voice))*(voice*50+1));
	resq = 1.0 + (26 * sfresonance);
	// loresq = 1.0 + (26*4.67*sfresonance);
	loresq = 1.0 + (26*sfresonance);
	// sound = BPF.ar(sound, clip(sfcutoff/10*pitch2+(sfenv/10*env2*pitch2), 20,11000),
	// rq:2.9-(2.8*vcfegint));
	// sound = sound * (1.2 + (1.2*vcfegint));
	sound = RHPF.ar(sound, clip(sfcutoff/100*pitch1+(sfenv/10000*env2*pitch1), 8,8000), rq:1/loresq);
	sound = RLPF.ar(sound, clip(sfcutoff+(sfenv*env2), 20, 11000), rq:1/clip(resq*1000/sfcutoff,1,52));
	//sound = ((sfresonance * sound)**3 + sound) / (max(1,sfresonance)**3);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;


// testing sample combos - this should override the one in "core-synths.scd"

SynthDef(format("dirt_sampleduo_%", numChannels), { |out, bufnum1, bufnum2, sustain = 1, begin=0, end=1, speed = 1, endSpeed = 1, pan = 0|
	var sound, sound1, sound2, p,q,rate, phase, sawrate, numFrames;
	// playback speed
	rate = Line.kr(speed, endSpeed, sustain);
	// sample phase
	// BufSampleRate adjusts the rate if the sound file doesn't have the same rate as the soundcard
	//phase =  Sweep.ar(1, rate * BufSampleRate.ir(bufnum)) + (BufFrames.ir(bufnum) * begin);
	numFrames = BufFrames.ir(bufnum1);
	sawrate = rate * BufSampleRate.ir(bufnum1) / (absdif(begin, end) * numFrames);
	phase = (speed.sign * LFSaw.ar(sawrate, 1)).range(begin,end) * numFrames;
	sound1 = BufRd.ar(
		numChannels: 1, bufnum: bufnum1, phase: phase, loop: 0, interpolation: 4 // cubic interpolation
	);
	numFrames = BufFrames.ir(bufnum2);
	//sawrate = rate * BufSampleRate.ir(bufnum2) / (absdif(begin, end) * numFrames) * (sound1*0.5+1) ; // FM mod
	sawrate = rate * BufSampleRate.ir(bufnum2) / (absdif(begin, end) * numFrames) ;
	phase = (speed.sign * LFSaw.ar(sawrate, 1)).range(begin,end) * numFrames;
	sound2 = BufRd.ar(
		numChannels: 1, bufnum: bufnum2, phase: phase, loop: 0, interpolation: 4 // cubic interpolation
	);
	p = sound1 * (2**31);
	q = sound2 * (2**31);
	sound = DirtPan.ar(bitXor(p, q) / (2**31), numChannels, pan);
	//sound = DirtPan.ar(sound2, numChannels, pan);
	Out.ar(out, sound)
}, [\ir, \ir, \ir, \ir, \ir, \ir, \ir, \ir]).add;

SynthDef(\superlagcomp, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0.2|
	var env = EnvGen.ar(Env.pairs([[0,0],[0.03,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var sound, sa,sb;
	sa = Saw.ar(basefreq) + Saw.ar(basefreq*1.011);
	sb = Saw.ar(clip(basefreq*4.0+(freq/5*sa),5,20000)) + Saw.ar(clip(basefreq*4.021*(1+voice)+(freq/5*sa), 5, 20000));
	sound = LPF.ar(sa > sb, clip(freq*(voice+1),5,20000));
	sa = sa * sb.range(0.5,1);
	sound = (sound * sa) + ((1-sound) * sb);
	sound = 0.5*Balance2.ar(sound, DelayN.ar(sound, 0.2, Line.ar(0.01,0.02,sustain)), pan*2-1);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, 0.5, env, {|x| x}));
}).add;

SynthDef(\superfm, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0|
	var env = EnvGen.ar(Env.pairs([[0,0],[0.03,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var sound;
	sound = (Impulse.ar(SinOsc.ar(basefreq+0.01,0.1,basefreq*10,basefreq*10))+0.5)
	  * Pulse.ar(basefreq,SinOsc.ar(basefreq+0.1,0.5,0.1,0.5));
	basefreq = basefreq /2.01;
	sound = sound + 0.52 * (Impulse.ar(SinOsc.ar(basefreq+0.01,0.1,basefreq*10,basefreq*10))+0.5)
	  * Pulse.ar(basefreq,SinOsc.ar(basefreq+0.1,0.5,0.1,0.5));
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

SynthDef(\superbass, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0, pitch1=0 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.05,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain) * XLine.ar(3,1,sustain/3);
	var fenv = EnvGen.ar(Env.pairs([[0,0],[0.01,2],[0.2,1.5],[0.8,1],[1,0.9]], -1), levelScale:4*(1+voice), timeScale:sustain, doneAction:2);
	var filterfreq = freq + 100 + (900*pitch1);
	var sound = Pulse.ar(basefreq, Line.kr(0,1,sustain));
	//var sound = Pulse.ar(basefreq, SinOsc.ar(basefreq/4));
	sound = MoogFF.ar(sound, filterfreq * fenv, 3.0);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;


SynthDef(\supertest, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.05,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var sound;
	sound = Dust2.ar(basefreq);
	sound = CombL.ar(CombL.ar(Decay.ar(sound, 1/basefreq), 0.2, 1/basefreq, 0.5), 0.2, 1.1/basefreq, 0.1);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

  SynthDef(\superchop, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.05,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var chopfreq = basefreq;
	var sound;
	basefreq = basefreq * Saw.ar(chopfreq).range(1.5,0.5);
	sound = Mix.arFill(8, {|n| DelayN.ar(LFPulse.ar(basefreq*(n**1.01)), 0.2, 0.02/n*Line.ar(2,0.5,sustain)) });
	sound = sound * LFPulse.ar(chopfreq).range(0.2,1) * LFPulse.ar(chopfreq/(2+voice)).range(0.2,1);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

SynthDef(\supercomb, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.05,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain) * SinOsc.ar(freq,0,0.1,1);
	var sound =LFTri.ar(basefreq, 0) * LFTri.ar(basefreq+2, 0.25);
	voice = max(voice, -0.99);
	sound = sound + CombN.ar(sound, 1, 1.01/basefreq, 1) + CombN.ar(sound, 1, (1.00+voice)/basefreq, -0.5);
	sound = MoogFF.ar(sound, XLine.kr(10000, 100/speed, sustain), 1);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

SynthDef(\superphase, {|out, speed=1, sustain=1, decay=0, pan, freq, accelerate=0, voice=0 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.07,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var fadj = [0.005, 0.007] * (voice+1) + 1.0;
	var fadj2 = 1.0 - ([0.005, 0.007] * (voice+1));
	var sound = Saw.ar(basefreq*fadj[0]) - DelayC.ar(Saw.ar(basefreq*fadj[1]), 0.2, SinOsc.kr(0.5).range(0.2,0.4)/basefreq);
	var fenv = EnvGen.ar(Env.perc(0.01, 1, 1, -1), timeScale:sustain);
	sound = sound + Saw.ar(basefreq*fadj2[0]) - DelayC.ar(Saw.ar(basefreq*fadj2[1]), 0.2, SinOsc.kr(0.5).range(0.2,0.4)/basefreq);
	sound = sound + PMOsc.ar(basefreq, basefreq*1.01, Line.kr(6.28,0));
	sound = sound - BAllPass.ar(sound, XLine.kr(4400,44,sustain), 2);
	sound = MoogFF.ar(sound/2, fenv*XLine.kr(10000, 500/speed, sustain), 1);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

SynthDef(\superstatic, {|out, sustain=1, pan, freq |
	var env = EnvGen.ar(Env.sine(1, 0.5), timeScale:sustain, doneAction:2);
	var sound = Dust.ar(freq*10) > 0.5;
	sound = Pulse.ar(freq*sound,0.5,0.5);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env))
}).add;

SynthDef(\supersomething, {|out, sustain=1, pan, speed=1, accelerate, freq, slide=0, pitch1=1, pitch2=1 |
	var env = EnvGen.ar(Env.perc(0.010, 0.9, 1, -3), timeScale:sustain, doneAction:2);
	var sound = VarSaw.ar(freq*Line.kr(1,1+accelerate), 0, Line.kr(0,speed*0.2,sustain), 0.4);
	sound = sound + Formant.ar(freq, XLine.kr(freq*5*pitch1, freq*(10*max(slide,-0.49)+5)*pitch1), pitch2*200, 0.4);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;

SynthDef(\supersaw2, {|out, sustain=1, pan, speed=1, accelerate, freq, decay=0, slide=1 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.07,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var sound = VarSaw.ar(basefreq, 0, Line.ar(0,0.5,sustain*20/slide));
	var sound2 = VarSaw.ar(basefreq*1.01, 0, Line.ar(0,0.5,sustain*20/slide));
	var sound3 = VarSaw.ar(basefreq*0.99, 0, Line.ar(0,0.5,sustain*20/slide));
	sound = sound - DelayN.ar(sound2,0.2, Line.ar(0,1,5*sustain/slide)/basefreq)
	  + DelayN.ar(sound3,0.2, Line.ar(0,1,20*sustain/slide)/basefreq);
	OffsetOut.ar(out, DirtPan.ar(sound/2, ~dirt.numChannels, pan, env));
}).add;

SynthDef(\supersaw3, {|out, sustain=1, pan, speed=1, accelerate, freq, decay=0, slide=1 |
	var env = EnvGen.ar(Env.pairs([[0,0],[0.07,1],[0.2,1-decay],[0.95,1-decay],[1,0]], -1), timeScale:sustain, doneAction:2);
	var basefreq = freq * Line.kr(1, 1+accelerate, sustain);
	var sound = VarSaw.ar(basefreq, 0, Line.ar(0,0.5,sustain*20/slide));
	var sound2 = VarSaw.ar(basefreq*1.201, 0, Line.ar(0,0.5,sustain*20/slide));
	var sound3 = VarSaw.ar(basefreq*0.75, 0, Line.ar(0,0.5,sustain*20/slide));
	sound = sound - DelayN.ar(sound2,0.5, Line.ar(10,1,5*sustain/slide)/basefreq)
	  + DelayN.ar(sound3,0.5, Line.ar(0,10,20*sustain/slide)/basefreq);
	OffsetOut.ar(out, DirtPan.ar(sound/2, ~dirt.numChannels, pan, env));
}).add;

SynthDef(\superblip, {|out, sustain=1, pan, freq|
	var env = EnvGen.ar(Env.perc(0.050, 0.900, 1, -2), timeScale:sustain, doneAction:2);
	var sound = Pulse.ar(freq, Line.kr(0,1,sustain), 0.5);
	OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;
///////////////////////////////////////////////////////////////////////////////////////////////////
//// custom effects ////////////////////////////////////////////////////////////////////////////////

// add envelope to lpf
~dirt.addModule('lpf',{ |dirtEvent| dirtEvent.sendSynth("dirt_lpf" ++ ~dirt.numChannels,
			[cutoff: ~cutoff, resonance: ~resonance, out: ~out, fattack:~fattack, fhold:~fhold, frelease:~frelease,
		    fenv:~fenv])}, { ~cutoff.notNil });
SynthDef("dirt_lpf" ++ numChannels, { |out, cutoff = 440, resonance = 0, fattack=0, fhold=1, frelease=0, fenv=0, sustain|
	var signal = In.ar(out, numChannels);
	var env;
	env= Lag.ar(EnvGen.ar(Env.linen(fattack, fhold*sustain, frelease, 1, 0)), 0.01);
	signal = RLPF.ar(signal, clip(cutoff+(env*fenv),2,20000), resonance.linexp(0, 1, 1, 0.001));
	ReplaceOut.ar(out, signal)
}, [\ir, \ir, \ir]).add;

// delightfully crunchy
~dirt.addModule('distort', { |dirtEvent| dirtEvent.sendSynth("dirt_distort" ++ ~dirt.numChannels,
			[distort: ~distort, out: ~out])}, { ~distort.notNil});
SynthDef("dirt_distort" ++ ~dirt.numChannels, {|out, distort=0|
	var signal, mod ;
	signal = In.ar(out, ~dirt.numChannels);
	mod = CrossoverDistortion.ar(signal, amp:0.2, smooth:0.01);
	mod = mod + (0.1 * distort * DynKlank.ar(`[[60,61,240,3000+SinOsc.ar(62,mul:100)],nil,[0.1, 0.1, 0.05, 0.01]], signal));
	mod = (mod.cubed * 8).softclip * 0.5;
	mod = SelectX.ar(distort, [signal, mod]);
	ReplaceOut.ar(out, mod);
}).add;

// this compressor is per-voice, so no memory from one sample to the next, would need a global effect for that
~dirt.addModule('comp', { |dirtEvent|
		dirtEvent.sendSynth("dirt_comp" ++ ~dirt.numChannels,
			[comp: ~comp, compa: ~compa, compr: ~compr, out: ~out])},
{ ~comp.notNil});
SynthDef("dirt_comp" ++ ~dirt.numChannels, {|out, comp=0, compa=0, compr=0|
	var signal, mod, inlev, cgain;
	signal = In.ar(out, ~dirt.numChannels);
	inlev = Amplitude.ar(HPF.ar(signal, 600, 1.5), 0.01+compa, 0.02+compr);
	mod = signal / max( inlev, 0.1) * 0.3;
	mod = SelectX.ar(comp, [signal, mod]);
	ReplaceOut.ar(out, mod);
}).add;

// fm with a sine wave
~dirt.addModule('fm', { |dirtEvent|
	dirtEvent.sendSynth('dirt_fm' ++ ~dirt.numChannels,
		[fm: ~fm,	fmf: ~fmf,  out: ~out	]
	)
}, { ~fm.notNil or: { ~fmf.notNil } }); // play synth only if at least one of the two was given
SynthDef("dirt_fm" ++ numChannels, { |out, fm, fmf |
	var signal, mod;
	signal = In.ar(out, numChannels);
	mod = SinOsc.ar(fmf * (1.0 + fm * signal), mul:fm);
	ReplaceOut.ar(out, mod + (1.0-fm)*signal);
}).add;

~dirt.addModule('rectify', { |dirtEvent|
	dirtEvent.sendSynth('dirt_rectify' ++ ~dirt.numChannels,
		[rect: ~rect, rectoff: ~rectoff, out: ~out])}, { ~rect.notNil});
SynthDef("dirt_rectify" ++ numChannels, { |out, rect, rectoff=0 |
	var signal;
	signal = In.ar(out, numChannels);
	ReplaceOut.ar(out, signal.fold(rectoff-rect, rect+rectoff) / rect);
}).add;

~dirt.addModule('wrap', { |dirtEvent|
	dirtEvent.sendSynth('dirt_wrap' ++ ~dirt.numChannels,
		[wrap: ~wrap, wrapoff: ~wrapoff, out: ~out])}, { ~wrap.notNil});
SynthDef("dirt_wrap" ++ numChannels, { |out, wrap, wrapoff=0 |
	var signal;
	signal = In.ar(out, numChannels);
	ReplaceOut.ar(out, signal.wrap(wrapoff-wrap, wrap+wrapoff) / wrap);
}).add;

// not actually a saw anymore, just a "chopper"
~dirt.addModule('envsaw', { |dirtEvent|
	dirtEvent.sendSynth('dirt_envsaw' ++ ~dirt.numChannels,
		[envsaw: ~envsaw, envsawf: ~envsawf, out: ~out])}, { ~envsaw.notNil;});
SynthDef("dirt_envsaw" ++ numChannels, { |out, envsaw, envsawf=10 |
	var signal, mod;
	signal = In.ar(out, numChannels);
	mod = Lag.ar(LFPulse.ar(envsawf, iphase:0, width:0.5), 0.050) * envsaw + 1.0 - envsaw;
	// mod = ((Saw.ar(envsawf) * (-1)) + 1.0) * 0.5 * envsaw + 1.0 - envsaw;
	ReplaceOut.ar(out, signal * mod);
}).add;

// reverb, tails will be cut off
// this is really rough on the CPU if you stack it up, cut things off!
~dirt.addModule('boom', { |dirtEvent| dirtEvent.sendSynth("dirt_boom" ++ ~dirt.numChannels,
			[boom: ~boom, out: ~out])}, { ~boom.notNil});
SynthDef("dirt_boom" ++ ~dirt.numChannels, {|out, boom=0|
	var signal, wet;
	signal = In.ar(out, ~dirt.numChannels);
	wet = JPverb.ar(signal, 0.1, damp:0.5, size:0.5, earlyDiff:1, modDepth:0.7, modFreq:2, low:1, mid:0.1, high:0.1);
	ReplaceOut.ar(out, SelectX.ar(boom, [signal, wet]));
}).add;

// an alternative to boom, might be less CPU-hungry
~dirt.addModule('gboom', { |dirtEvent| dirtEvent.sendSynth("dirt_gboom" ++ ~dirt.numChannels,
			[gboom: ~gboom, out: ~out])}, { ~gboom.notNil});
SynthDef("dirt_gboom" ++ ~dirt.numChannels, {|out, gboom=0|
	var signal, wet;
	signal = In.ar(out, ~dirt.numChannels);
	//wet = (abs(Amplitude.ar(signal, 0.01, 0.1)) > 0.2) * signal;
	wet = (abs(signal) > 0.2) * signal;
	wet = FreeVerb.ar(signal, 1, 0.1, 1);
	ReplaceOut.ar(out, SelectX.ar(gboom, [signal, wet]));
}).add;


)
