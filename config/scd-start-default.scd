(
s.options.numInputBusChannels = 8;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 32;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.recSampleFormat = "wav";
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
	~dirt.loadSoundFiles("/Users/canince/Desktop/pool1/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 9));
  "SUPERDIRT LOADED".postln;
  1.wait;
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  
  "/Users/canince/documents/github/Siren/deps/SynthDefs/custominputs.scd".load;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/customfx.scd".load;
  //"/Users/canince/documents/github/Siren/deps/SynthDefs/customsynth.scd".load;
~d1 = ~dirt.orbits[0];
  0.2.wait;
  "SIREN LOADED".postln;
  s.volume = -12;
  SuperDirt.default = ~dirt;
  

  OSCFunc.trace(true);
  s.sendMsg("/notify", 0);
  };
)
