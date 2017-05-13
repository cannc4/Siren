(
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
  //Link.enable;
  //Link.setTempo(120,1);
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

  //"/Users/canince/documents/git/Siren/deps/SynthDefs/nmix.scd".load;
  "SIREN LOADED".postln;
};
)
