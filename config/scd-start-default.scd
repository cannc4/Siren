(
s.options.numInputBusChannels = 6;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 64;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.quit;

s.waitForBoot {

 ~dirt = SuperDirt(2, s);
 ~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/pool1/*");
 s.sync;
 ~dirt.start(57120, (0,2 .. 7));
  "SUPERDIRT LOADED".postln;
  1.wait;
  s.makeGui;
  s.meter;
  s.scope;
  s.latency = 0.3;
  MIDIClient.init;


  "/Users/canince/documents/github/Siren/deps/SynthDefs/custominputs.scd".load;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/customfx.scd".load;
  "/Users/canince/documents/github/Siren/deps/SynthDefs/customsynth.scd".load;
  "/Users/canince/Documents/Github/Siren/deps/SynthDefs/dx7/DX7MIDI.scd".load;
  "DX7 MIDI LOADED".postln;
  
  //"SD MIDI".postln;
  //~midiOut1 = MIDIOut.newByName("USB MIDI Device", "Port 1");
  //~midiOut2 = MIDIOut.newByName("IAC", "Bus 1"); // replace by your devices
  //~midiOut1 = MIDIOut.newByName("USB MIDI Device", "Port 1");
 // "/Users/spat/documents/github/Siren/deps/SynthDefs/sdmidi.scd".load;

  0.2.wait;
  "SIREN LOADED".postln;
  s.volume = -12;
  SuperDirt.default = ~dirt;

  ~d1 = ~dirt.orbits[0];
  ~d2 = ~dirt.orbits[1];
  ~d3 = ~dirt.orbits[2];
  ~d4 = ~dirt.orbits[3];
  ~d5 = ~dirt.orbits[4];

  OSCFunc.trace(true);
  s.sendMsg("/notify", 1);
  };

)
