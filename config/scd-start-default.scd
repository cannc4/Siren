(


s.options.device = "Fireface UCX (23769248)";
//s.options.device = "SuperCollider";
s.options.numInputBusChannels = 0;
s.options.numOutputBusChannels = 6;
//s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 64;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.quit;

s.waitForBoot {

	// ~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/sample_banks/poolx/*");
	//~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/sample_banks/gfix/*");
	//~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/sample_banks/gfixing/*");
	
	~dirt = SuperDirt(2, s);
	~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/sample_banks/VSV/*");
	~dirt.loadSoundFiles("/Users/canince/Dropbox/\~siren/sample_banks/genpool/*");

	//
	"SUPERDIRT LOADED".postln;

	
	0.5.wait;
	if(ServerOptions.devices.find(["Fireface UCX (23769248)"]).notNil, {
		"/Users/canince/documents/git/Siren/deps/scsynth/firefacemidi.scd".load;
		~dirt.start(57120, [0,1,2,3,4,6]);
		"FireFace MIDI LOADED".postln;
	0.5.wait;
	});
	if(ServerOptions.devices.find(["SuperCollider"]).notNil, {
		~dirt.start(57120, [0,1,2,3,4,6]);
		"FireFace MIDI LOADED".postln;
	0.5.wait;
	});
	1.wait;
	"/Users/canince/documents/git/Siren/deps/scsynth/dxmidi.scd".load;
	"/Users/canince/documents/git/Siren/deps/scsynth/customfx.scd".load;
	"/Users/canince/documents/git/Siren/deps/scsynth/customsynth.scd".load;
	"/Users/canince/Documents/git/Siren/deps/scsynth/dx7/DX7MIDI.scd".load;
	0.5.wait;
	"DX7 MIDI LOADED".postln;
	



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
	
	s.volume = -6;
	s.latency = 0.3;
	s.makeGui;
	s.meter;

	SuperDirt.default = ~dirt;
	~d1 = ~dirt.orbits[0];
	~d2 = ~dirt.orbits[1];
	~d3 = ~dirt.orbits[2];
	~d4 = ~dirt.orbits[3];
	~d5 = ~dirt.orbits[4];
	~d6 = ~dirt.orbits[5];
	~d7 = ~dirt.orbits[6];
	~d8 = ~dirt.orbits[7];

};

)
