(
s.options.numOutputBusChannels = 6;
s.options.numBuffers = 2048 * 16;
s.options.maxNodes = 1024 * 16;
s.options.memSize_(65536 * 4);
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/dropbox/whalehouse/pure/*");

 s.sync;
 ~dirt.start(57120, (0,2 .. 5));



Link.enable;
0.2.wait;
Link.setTempo(120,1);
s.makeGui;
s.meter;
s.latency = 0.3;
~dirt.orderModules([\shape, \lpf]);
"/Users/canince/documents/github/sq/experimentsc.scd".load;
  }
)
