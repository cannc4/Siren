(
s.options.numBuffers = 2048 * 8;
s.options.maxNodes = 1024 * 4;
s.options.memSize = 13000 * 16;
s.quit;

s.waitForBoot 
{
	
	// Initalize SuperDirt //
	// ------------------- //
	~dirt = SuperDirt(2, s);
	~dirt.loadSoundFiles;
	0.2.wait;
	~dirt.start(57120, [0, 1]);
	"SUPERDIRT LOADED".postln;

	s.volume = -12;
	s.latency = 0.3;

	// SIREN FUNCTIONS - DO NOT REMOVE //
	// ------------------------------- //
	~dirt.orbits.do { |orbit, i|
		{SendPeakRMS.kr(
			InFeedback.ar(orbit.dryBus, ~dirt.numChannels),
				4,
				3,
				"/orbit" ++ i);
		}.play;
	};

	(
		// Tidal playback information
		f = { |msg, time, addr|
			if(msg[0] == '/play2') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		thisProcess.addOSCRecvFunc(f);

		g = { |msg, time, addr|
			if(msg[0].asString.includesAll("/orbit")) {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		thisProcess.addOSCRecvFunc(g);
		
	);
  	0.2.wait;
  	"SIREN LOADED".postln;
	// ------------------------------- //
	// SIREN FUNCTIONS -- END 		   //

	s.meter;
	//s.makeGui;
  };
)
