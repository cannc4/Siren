
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////  SYNTHDEFS  //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(


~recBus1 = Bus.audio(s,1);
SynthDef(\AR1, { arg in=2;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus1, input);

}).add;
SynthDef(\AR1Diskout, {arg out= 0,bufnum;
	var input =In.ar(~recBus1.index);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;


/////////////////////////////////////////////////
~recBus2 = Bus.audio(s,1);
SynthDef(\AR2, { arg in=3;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus2, input);
}).add;
SynthDef(\AR2Diskout, {arg out = 0, bufnum;
	var input = In.ar(~recBus2.index);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;

/////////////////////////////////////////////////
~recBus3 = Bus.audio(s,1);

SynthDef(\AR3, { arg  in=4;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus3, input);

}).add;
SynthDef(\AR3Diskout, {arg out=0,bufnum;
	var input =In.ar(~recBus3.index);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;

/////////////////////////////////////////////////
~recBus4 = Bus.audio(s,1);

SynthDef(\AR4, { arg in=5;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus4, input);

}).add;
SynthDef(\AR4Diskout, {arg  out=0,bufnum;
	var input =In.ar(~recBus4.index);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;

////////////////////////////////////////////////
~recBus5 = Bus.audio(s,1);

SynthDef(\AR5, { arg  in=6;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus5, input);


}).add;
SynthDef(\AR5Diskout, {arg out=0, bufnum;
	var input = In.ar(~recBus5);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;


////////////////////////////////////////////////

~recBus6 = Bus.audio(s,1);

SynthDef(\AR6, { arg  in=7;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus6, input);

}).add;
SynthDef(\AR6Diskout, {arg out=0,bufnum;
	var input =  In.ar(~recBus6);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;

///////////////////////////////////////////////

~recBus7 = Bus.audio(s,1);

SynthDef(\AR7, { arg in=8;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus7, input);

}).add;
SynthDef(\AR7Diskout, {arg out=0,bufnum;
	var input =In.ar(~recBus7);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;

/////////////////////////////////////////////////////////////////////////////////

~recBus8 = Bus.audio(s,1);
SynthDef(\AR8, { arg in=9;
	var input;
	input = SoundIn.ar(in);
	input = (-3).dbamp * input;
	OffsetOut.ar(~recBus8, input);

}).add;
SynthDef(\AR8Diskout, {arg  out=0,bufnum;
	var input = In.ar(~recBus8);
	DiskOut.ar(bufnum, input);
	Out.ar(out, input.dup);
}).add;


0.2.wait;

/////////////////////////////////////////////// /////////////////////////////
~gr1 = Group.new;
~gr2 = Group.new;
~gr3 = Group.new;
~gr4 = Group.new;
~gr5 = Group.new;
~gr6 = Group.new;
~gr7 = Group.new;
~gr8 = Group.new;



~ar1 = Synth.head(~gr1,\AR1);
~ar2 = Synth.head(~gr2,\AR2);
~ar3 = Synth.head(~gr3,\AR3);
~ar4 = Synth.head(~gr4,\AR4);
~ar5 = Synth.head(~gr5,\AR5);
~ar6 = Synth.head(~gr6,\AR6);
~ar7 = Synth.head(~gr7,\AR7);
~ar8 = Synth.head(~gr8,\AR8);


0.2.wait;


~gfx11 = Group.new(~gr1, \addToTail);
~gfx12 = Group.new(~gr1, \addToTail);
~gfx13 = Group.new(~gr1, \addToTail);
~gfx14 = Group.new(~gr1, \addToTail);
~gfx21 = Group.new(~gr2, \addToTail);
~gfx22 = Group.new(~gr2, \addToTail);
~gfx23 = Group.new(~gr2, \addToTail);
~gfx24 = Group.new(~gr2, \addToTail);
~gfx31 = Group.new(~gr3, \addToTail);
~gfx32 = Group.new(~gr3, \addToTail);
~gfx33 = Group.new(~gr3, \addToTail);
~gfx34 = Group.new(~gr3, \addToTail);
~gfx41 = Group.new(~gr4, \addToTail);
~gfx42 = Group.new(~gr4, \addToTail);
~gfx43 = Group.new(~gr4, \addToTail);
~gfx44 = Group.new(~gr4, \addToTail);
~gfx51 = Group.new(~gr5, \addToTail);
~gfx52 = Group.new(~gr5, \addToTail);
~gfx53 = Group.new(~gr5, \addToTail);
~gfx54 = Group.new(~gr5, \addToTail);
~gfx61 = Group.new(~gr6, \addToTail);
~gfx62 = Group.new(~gr6, \addToTail);
~gfx63 = Group.new(~gr6, \addToTail);
~gfx64 = Group.new(~gr6, \addToTail);
~gfx71 = Group.new(~gr7, \addToTail);
~gfx72 = Group.new(~gr7, \addToTail);
~gfx73 = Group.new(~gr7, \addToTail);
~gfx74 = Group.new(~gr7, \addToTail);
~gfx81 = Group.new(~gr8, \addToTail);
~gfx82 = Group.new(~gr8, \addToTail);
~gfx83 = Group.new(~gr8, \addToTail);
~gfx84 = Group.new(~gr8, \addToTail);


0.2.wait;

~bpm= TempoClock(100/60);
~metronome44 = TempoClock.new(~bpm, 0, Main.elapsedTime.ceil);
~metronome44.schedAbs(0, {~metronome44.beatsPerBar_(4)});
~metronome34 = TempoClock.new(~bpm , 0, Main.elapsedTime.ceil);
~metronome34.schedAbs(0, {~metronome34.beatsPerBar_(3)});



(
~test_DrumSmpl1 = 1;
~test_DrumSmpl2 = 1;
~test_DrumSmpl3 = 1;
~test_DrumSmpl4 = 1;
~test_DrumSmpl5 = 1;
~test_DrumSmpl6 = 1;
~test_DrumSmpl7 = 1;
~test_DrumSmpl8 = 1;
~test_Master= 1;

0.5.wait;

"/Users/canince/Documents/Github/sq/config/default/multitrack.scd".load;
)


)
