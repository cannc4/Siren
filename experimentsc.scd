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
)
