(
//s.options.device = "SuperCollider";
s.options.numInputBusChannels = 0;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 64;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.quit;

s.waitForBoot {

  ~dirt = SuperDirt.start;
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
	OSCFunc.trace(true);
	s.sendMsg("/notify", 1);

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
		thisProcess.addOSCRecvFunc(g);
		h = { |msg, time, addr|
			if(msg[0] == '/orbit1') {
				"time: % sender: %\nmessage: %\n".postf(time, addr, msg);
			}
		};


		thisProcess.addOSCRecvFunc(h);
	);
  1.wait;
  "SIREN LOADED".postln;
//  SuperDirt.default = ~dirt;
  s.volume = -12;
  s.latency = 0.3;
  s.makeGui;
  s.meter;

  };


)
