(
s.options.numBuffers = 2048 * 8;
s.options.maxNodes = 1024 * 4;
s.options.memSize = 8 * 13000 * 16;
s.quit;

s.waitForBoot 
{
	
	// Initalize SuperDirt //
	// ------------------- //
	SuperDirt.postBadValues = false;
	~dirt = SuperDirt(2, s);
	//~dirt.loadSoundFiles;
	~dirt.loadSoundFiles("C:\\Users\\Mert\\Dropbox\\~siren\\sample_banks\\gfix\\*");
	~dirt.loadSoundFiles("C:\\Users\\Mert\\Dropbox\\~siren\\sample_banks\\poolx\\*");
	0.2.wait;
	
	~dirt.start(57120, [0, 0, 0, 0,0,0,0,0]);
	"SUPERDIRT LOADED".postln;


	s.volume = -12;
	s.latency = 0.3;

	// SIREN FUNCTIONS - DO NOT REMOVE //
	// ------------------------------- //
	/*~dirt.orbits.do { |orbit, i|
		{SendPeakRMS.kr(
			InFeedback.ar(orbit.dryBus, ~dirt.numChannels),
				4,
				3,
				"/orbit" ++ i);
		}.play;
	};*/

	(
		// Tidal playback information
		f = { |msg, time, addr|
			if(msg[0] == '/play2') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		thisProcess.addOSCRecvFunc(f);

		/*g = { |msg, time, addr|
			if(msg[0].asString.includesAll("/orbit")) {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};
		thisProcess.addOSCRecvFunc(g);*/
		
	);
  	0.2.wait;
  	"SIREN LOADED".postln;
	// ------------------------------- //
	// SIREN FUNCTIONS -- END 		   //

	
	1.wait;
	"C:\\Users\\Mert\\Dropbox\\~siren\\code\\win\\Siren\\config\\customfx.scd".load;
	"C:\\Users\\Mert\\Dropbox\\~siren\\code\\win\\Siren\\config\\customsynth.scd".load;
	0.5.wait;
	
	s.meter;
	//s.makeGui;
  };
)
