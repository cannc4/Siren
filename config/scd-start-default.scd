(
s.options.numOutputBusChannels = 10;
s.options.numBuffers = 1024 * 16;
s.options.memSize = 8192 * 16;
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("C:\\Users\\Mert\\Dropbox\\Whalehouse\\99s\\*");
 "SUPERDIRT LOADED".postln;

 s.sync;
 ~dirt.start(57120, (0, 2 .. 9));

 0.2.wait;
 "SIREN ARRIVED".postln;
}
)
