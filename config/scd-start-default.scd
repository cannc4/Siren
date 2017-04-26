(
s.options.numOutputBusChannels = 12;
s.options.numBuffers = 2048 * 16;
s.options.maxNodes = 1024 * 16;
s.options.memSize_(65536 * 4);
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/dropbox/whalehouse/siren/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 11));
 ~dirt.orderModules([\shape, \lpf]);
  //Link.enable;
  //Link.setTempo(120,1);
  StageLimiter.activate;
  0.2.wait;
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/experimentsc.scd".load;
  "SIREN LOADED".postln;
};
)
