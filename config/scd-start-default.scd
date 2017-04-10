(
s.options.numOutputBusChannels = 6;
s.options.numBuffers = 2048 * 16;
s.options.maxNodes = 1024 * 16;
s.options.memSize_(65536 * 4);
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/dropbox/whalehouse/siren/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 5));
 ~dirt.orderModules([\shape, \lpf]);
  Link.enable;
  0.2.wait;
  Link.setTempo(120,1);
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  "/Users/canince/documents/github/sq/deps/SynthDefs/experimentsc.scd".load;

  ~modBus.free;
~carBus.free;
~dirt.orbits[0].outBus = 0;
~dirt.orbits[1].outBus = 0;
// --- //
~modBus = Bus.audio(s, numChannels:2); // assuming stereo, expand if needed
~carBus = Bus.audio(s, numChannels:2);
~dirt.orbits[0].outBus = ~modBus; // play into that bus.
~dirt.orbits[1].outBus = ~carBus;
Ndef(\x, {
    var modBus = In.ar(~modBus, 2);
    var carBus = In.ar(~carBus, 2);
    var out = modBus+carBus;
    //carBus = FreeVerb.ar(carBus, 0.9, 0.8, 0.8);
    out = Compander.ar(carBus, modBus, -30.dbamp, 1, 0.01, 0.01, 0.07)+modBus;
    out = Compander.ar(out, out, -15.dbamp, 1, 0.2)*4;
    Out.ar(0, out);
});
  }

)
