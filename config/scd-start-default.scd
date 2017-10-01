(
s.options.numInputBusChannels = 8;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 32;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.recSampleFormat = "int24";
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/dropbox/whalehouse/99s/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 9));
  "SUPERDIRT LOADED".postln;
  1.wait;
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/customfx.scd".load;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/customsynth.scd".load;
  0.2.wait;
  "SIREN LOADED".postln;
  };
)
