//////////////////////////////////// FX ////////////////////////////////////
(
	~emp1 = Bus.audio(s,2);
	~emp2 = Bus.audio(s,2);
	~emp3 = Bus.audio(s,2);
	~emp4 = Bus.audio(s,2);



~defNum = 0;
//////////////////////////////////// DELAY ////////////////////////////////////
SynthDef(\eightdels, {arg ibs = ~emp1, obs = 0,  maxDelay=10, ofBool=1;

	var in, out, env, phasor, delayIn, out0, out1, out2, out3, out4, out5, out6, out7, length;

	length = rrand(2.0, 4.0);
	env = EnvGen.ar(Env.new([0,1,1,0],[length/4, length/4, length/2]), 1, doneAction: 2);

	in = In.ar(ibs);
	delayIn = In.kr(ibs);


	out0 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(1/8)), -1);
	out1 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(2/8)), -0.75);
	out2 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(3/8)), -0.5);
	out3 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(4/8)), -0.25);
	out4 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(5/8)), 0.25);
	out5 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(6/8)), 0.5);
	out6 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(7/8)), 0.75);
	out7 = Pan2.ar(DelayC.ar(in, maxDelay, delayIn*(8/8)), 1);
	out = (out0+out1+out2+out3+out4+out5+out6+out7)*env;
	//DetectSilence.ar(out+ DC.ar(ofBool),0.2,doneAction:2);
	Out.ar(obs, out);

}).add;

SynthDef(\delayll, {arg ibs = ~emp2, obs = 0,  gate= 1, freqHP= 20, freqLP= 20000, filtRes=0.5, delme = 0.003, delRes = 0.6, delRez = 0.22,ofBool=1,
	delFlt = 10000, delTim = 2 ,delFed = 0.5, lfoFrq = 1, lfoAmt = 1, dryWet = 0.5, lagKarme = 0.12, defNum;
	var source, limiting, rhpf, rlpf, delayHotLine, delayFiltLine,	delayLFOLine, delayDryWet;
	source = In.ar(ibs);
	source = LeakDC.ar(source);
	rhpf = BHiPass.ar(source, Lag3.kr(freqHP, 0.07), filtRes);
	rlpf = BLowPass.ar(rhpf, Lag3.kr(freqLP, 0.07), filtRes);
	rlpf = Streson.ar(rlpf, delme.reciprocal, delRes);
	rlpf = LeakDC.ar(rlpf);
	delayLFOLine = SinOsc.ar(lfoFrq, mul: lfoAmt, add: delFlt);
	delayFiltLine = IIRFilter.ar(rlpf, Lag2.ar(Fold.ar(delayLFOLine,10,20000),lagKarme),delRez);
	delayHotLine = CombC.ar(delayFiltLine, Lag2.kr(delTim,1.9), Lag2.kr(delTim,1.9),delFed);
	delayDryWet = XFade2.ar(rlpf,delayHotLine,dryWet);
	delayDryWet = (defNum).dbamp * delayDryWet;
	DetectSilence.ar(delayDryWet+ DC.ar(ofBool),0.2,doneAction:2);
	OffsetOut.ar(obs, delayDryWet);
}).add;

SynthDef(\dubecho,{ arg ibs = ~emp3, length = 0.1, fb = 0.6, sep = 0.00012, hpFreq = 400, lpFreq = 5000, ofBool = 1 , defNum= 1;
	var input = In.ar(ibs);
	var magic;
	var real = 0.2;
	var imag = 0.8;
	var magicL;
	var fft = 0.5;
	var output = input + Fb({
		arg feedback;
		var left,right;
		magic = LeakDC.ar(feedback*fb + input);
		magic = HPF.ar(magic, hpFreq);
		magic = LPF.ar(magic, lpFreq);
		magic = magic.tanh;
		#left, right = magic;
		magic = [DelayC.ar(left, 1, LFNoise2.ar(12).range(0,sep)), DelayC.ar(right, 1, LFNoise2.ar(12).range(sep,0))];
	},length);
	magic = (defNum).dbamp * magic;
	DetectSilence.ar(magic+ DC.ar(ofBool),0.1,doneAction:2);
	Out.ar(0,magic);

}).add;
///////////////////////////////////////////////////////////////////////////

//////////////////////////////////// REVERB ////////////////////////////////////

SynthDef(\nReverb,{arg ibs, maxDelay=0.181, preDelay=0.08, decay=2, numRefl=8, random=0.1, ofBool=1, amp =1, defNum = 1;

	var input, output, new, dlys, numChan;
	#numChan, maxDelay, preDelay, decay, numRefl, random = #[8, 0.219, 0.0008, 12, 24, 0.5];
	input = In.ar(ibs);
	new = input;
	dlys = Array.fill(numRefl, {
		new = AllpassN.ar(new, maxDelay,Array.fill(numChan, { random.rand }) + preDelay, decay);
	});
	output =  Mix.ar((((defNum).dbamp * dlys) * Array.series(numRefl, 1, (numRefl+1).reciprocal.neg)));
	DetectSilence.ar(output+ DC.ar(ofBool),0.01,doneAction:2);
	ReplaceOut.ar(ibs, output);
}).add;


SynthDef(\GVReverb, {arg ibs, roomsize = 243, revtime = 1, damping = 0.1, inputbw = 0.34, defNum = 1,
	spread = 15, drywet= 1, earlylevel = -11, taillevel= -9, ofBool = 1,freqHP= 200 ;

	var input = In.ar(ibs);
	var output = GVerb.ar(input,roomsize,revtime,damping,inputbw,spread, drywet,earlylevel.dbamp,taillevel.dbamp,roomsize);
	output = BHiPass.ar(output, Lag3.kr(freqHP, 0.07), 0.2);
	output = (defNum).dbamp * output;
	DetectSilence.ar(output+ DC.ar(ofBool),0.01,doneAction:2);
	ReplaceOut.ar(ibs,output);

}).add;

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

SynthDef(\freeze,  { arg freeze = 800, ibs, freq=440, bufSize = 1024;
	var chain1, chain2, frozen, inp,temp;
	var	popFreq = EnvGen.ar(Env([3261, 410, 1000], [0.005, 0.01], curve: \exp));
	inp  = In.ar(ibs).asArray;
	temp =  Pulse.ar(rrand(500,800), rrand(0.1,1),rrand(0.2,1));
	chain1 = FFT( LocalBuf( 8192 ! 2 ), inp );
	chain2 = FFT( LocalBuf( 8192 ! 2 ), temp);
	chain1 = PV_CopyPhase( chain1, chain2 );


	frozen = IFFT( chain1 ).asArray;
	frozen = Pan2.ar(frozen,  FSinOsc.kr(2), 1,1.5);
	frozen = frozen * (15).dbamp;
	ReplaceOut.ar( ibs, frozen);
}).add;

SynthDef(\ringMod, {arg ibs, carrFreq = 440, modFreq = 2, amp = 0.06, which = 0;
	var carrier, modulator, input, chain1, chain2, output;
	input = In.ar(ibs);
	carrier = Select.ar(which,
		[
			SinOsc.ar(Lag.kr(carrFreq)),
			Blip.ar(Lag.kr(carrFreq), 5),
			Saw.ar(Lag.kr(carrFreq))
	]);
	modulator = SinOsc.ar(Lag.kr(modFreq));
	output = (10).dbamp*( carrier * input );
	// /Out.ar( ~recBus11, output);
	ReplaceOut.ar( ibs, output);
}).add;

SynthDef(\audioPitchShiftDelay, { arg ibs,obs = 0, ratio = 1, delayTime = 0.05;
	var in, retune1, retune2, delayMod, trig, samplePeriod, transNumber;
	var window, start, end, rate;
	in = In.ar(ibs);
	rate = (1 - ratio ) * SampleRate.ir.reciprocal;
	start = 0.0;
	end = delayTime;
	delayMod = Phasor.ar( 0, rate, start, end);
	window = SinOsc.ar(ratio*delayTime.reciprocal,3pi/2, 0.5, 0.5);
	retune1 = DelayC.ar( in, 0.3, delayMod ) * window;
	retune2 = DelayC.ar( retune1, 0.5, (ratio/delayTime).reciprocal*0.5 );
	retune2 =retune1+retune2;
	//Out.ar(~recBus13, [retune1+retune2, retune1+retune2]);
	ReplaceOut.ar(ibs,retune2);

}).add;

~defNumHold = 0;
~evalNum = {


	~defNumHold = ~defNumHold+2;
	~defNum =  (1/~defNumHold) -1;
};

~eightdels = Synth(\eightdels, [\ibs, ~emp1, \obs, 0]);
~dubecho = Synth(\dubecho, [\ibs, ~emp3, \obs, 0]);
~delayll = Synth(\delayll, [\ibs, ~emp2, \obs, 0]);



)
