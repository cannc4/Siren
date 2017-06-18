(
s.options.numInputBusChannels = 10;
s.options.numOutputBusChannels = 10;
s.options.numBuffers = 2048 * 32;
s.options.maxNodes = 1024 * 32;
s.options.memSize_(65536 * 16);

s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/dropbox/whalehouse/99s/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 9));
  s.sync;
  StageLimiter.activate;
  3.wait;
  SuperDirt.default = ~dirt;
  TempoClock.default.tempo = 120/60;
  1.wait;
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  "/Users/canince/documents/git/Siren/deps/SynthDefs/experimentsc.scd".load;
  0.2.wait;
  "SIREN LOADED".postln;

  //Compressor Side Chain
  /*~bus1.free;
  ~bus2.free;
  ~bus3.free;
  ~bus1 = Bus.new('audio',5,2);
  ~bus2 = Bus.new('audio',6,2);
  ~bus3 = Bus.new('audio',7,2);
  ~dirt.orbits[4].outBus = ~bus1; // play into that bus.
  ~dirt.orbits[0].outBus = ~bus2; // play into that bus.
  ~dirt.orbits[1].outBus = ~bus3; // play into that bus.
  b= Ndef(\b, {
    var control = InBus.ar(~dirt.orbits[2].dryBus, 2).sum;
    var dirt = InBus.ar(~bus1);
    Compander.ar(dirt, control, thresh:0.03, slopeBelow:1, slopeAbove: 0.1, clampTime:0.002, relaxTime:0.05)
  });
  b.playN(
    outs:[8,9]
  );

a= Ndef(\a, {
  var control = InBus.ar(~dirt.orbits[2].dryBus, 2).sum;
  var dirt = InBus.ar(~bus2);
  Compander.ar(dirt, control, thresh:0.04, slopeBelow:1, slopeAbove: 0.1, clampTime:0.02, relaxTime:0.1)
  });
  a.playN(
    outs:[0,1]
    );

  c= Ndef(\c, {
    var control = InBus.ar(~dirt.orbits[2].dryBus, 2).sum;
    var dirt = InBus.ar(~bus3);
    Compander.ar(dirt, control, thresh:0.04, slopeBelow:1, slopeAbove: 0.1, clampTime:0.02, relaxTime:0.1)
    });
    c.playN(
      outs:[2,3]
      );*/
/*~bus.free;
~bus = Bus.audio(s, numChannels:2); // assuming stereo, expand if needed
~dirt.orbits[0].outBus = ~bus; // play into that bus.
Ndef(\x, {
  var control = InBus.ar(~dirt.orbits[1].dryBus, 2).sum;
  var dirt = InBus.ar(~bus, 2);
  Compander.ar(dirt, control, thresh:0.01, slopeBelow:1, slopeAbove: 0.1, clampTime:0.02, relaxTime:0.1)
  }).play;
};*/
  };
)
