(
// balc
SynthDef(\kick, {|out=0, attack=0.001, release=0.125, pan=0.5, freq|
  var sound, env;
  sound = HPF.ar(SinOsc.ar(freq * XLine.ar(1, 1/4, 1/16, doneAction:2)), 100);
  env = EnvGen.ar(Env.perc(attack, release, 1, -4), doneAction:2);
  sound = sound * 2 * env;
    OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan, env));
}).add;
SynthDef(\snare1, {
  |out=0, attack=0.01, sustain=0.125, amp=1, pan=0, freq|
  var sound = HPF.ar(BrownNoise.ar(1), freq) * EnvGen.ar(Env.perc(attack, sustain, 1, -4), doneAction:2);
  OffsetOut.ar(out, DirtPan.ar(sound, ~dirt.numChannels, pan))
}).add;
SynthDef(\hihat, {|out=0, amp = 1, attack = 0.01, release = 0.1, pan = 0.5|
  var snd, env;
    env = Env.perc(attack, release).ar(doneAction: 2);
    snd = RHPF.ar(WhiteNoise.ar(amp) * env, 10000, 0.1) * env * amp;
    OffsetOut.ar(out, DirtPan.ar(snd, ~dirt.numChannels, pan))
    }).add;
    Routine.run{
            var syn, time= 16;              //allow each patch to run for 16sec / 8bars
            3.do{|i|
                    ("\n//fm7 patch"+i+"generated on"+Date.localtime).post;
                    syn= ("
                            (
                            var x= #"++({{{1.5.linrand.round(0.5)}!4}!3}!6).asCompileString++";
                            var y= #"++({{{1.5.linrand.round(0.5)}!4}!6}!6).asCompileString++";
                            {
                                    var ctls= x.collect{|a| a.collect{|b| LFSaw.kr(*b)}};
                                    var mods= y.collect{|a| a.collect{|b| LFSaw.kr(*b)}};
                                    var chans= #[0, 1];
                                    FM7.ar(ctls, mods).slice(chans)*0.5;
                            }.play)").postln.interpret;
                    time.wait;
                    syn.free;
            };
    };
)
//link enable 
/*(

)*/
