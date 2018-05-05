(
s.options.device = "SuperCollider";
s.options.numInputBusChannels = 0;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 64;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.quit;

s.waitForBoot {

  ~dirt = SuperDirt(2, s);
  ~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/poolx/*");
  ~dirt.start(57120, (0,2 .. 15));
  "SUPERDIRT LOADED".postln;
  0.5.wait;
	~dirt.orbits.do { |orbit, i|
		{SendPeakRMS.kr(
			InFeedback.ar(orbit.dryBus, ~dirt.numChannels),
				4, // refresh rate 
				3, // peak lag
				"/orbit" ++ i);
		}.play;
	};	

	0.1.wait;
	"SIREN LOADED".postln;
	//s.volume = -12;
	
	(
		f = { |msg, time, addr|
			if(msg[0] == '/play2') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		thisProcess.addOSCRecvFunc(f);

		g = { |msg, time, addr|
			if(msg[0] == '/orbit0') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		h = { |msg, time, addr|
			if(msg[0] == '/orbit1') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		
		thisProcess.addOSCRecvFunc(g);
		thisProcess.addOSCRecvFunc(h);
	);
  1.wait;
  "/Users/canince/documents/git/Siren/deps/SynthDefs/customfx.scd".load;
  "/Users/canince/documents/git/Siren/deps/SynthDefs/customsynth.scd".load;
  0.5.wait;
  "DX7 MIDI LOADED".postln;
  if(ServerOptions.devices.find(["Fireface UCX (23769248)"]).notNil, {
	  "/Users/canince/documents/git/Siren/deps/SynthDefs/sdmidi.scd".load;
    "SD MIDI LOADED".postln;
    0.5.wait;
  });  
  "/Users/canince/Documents/git/Siren/deps/SynthDefs/dx7/DX7MIDI.scd".load;
  0.5.wait;
  "SIREN LOADED".postln;

  SuperDirt.default = ~dirt;

  //~d1 = ~dirt.orbits[0];

  s.volume = -12;
  s.latency = 0.3;
  s.makeGui;
  s.meter;
  



  OSCFunc.trace(true);
  s.sendMsg("/notify", 1);
  
  };


)
