(


s.quit;

s.waitForBoot {

	~dirt = SuperDirt(2, s);


	// SIREN FUNCTIONS - DO NOT REMOVE //
	// ------------------------------- //
	
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
	// SIREN FUNCTIONS -- END 
			   //
	
	s.volume = -12;
	s.latency = 0.3;
	s.makeGui;
	s.meter;

	SuperDirt.default = ~dirt;

};

)
