(
Server.supernova;
s.audioBusAllocator.reserve(12,1);
s.options.numOutputBusChannels = 2;
s.options.numInputBusChannels = 12;
//s.options.outDevice = "Built-in Output";
s.options.outDevice = "QUAD-CAPTURE";
//s.options.outDevice = "Fireface UCX (23648323)";
//s.options.outDevice = "AudioBox USB";
//s.options.inDevice = "Aggregate Device";
//s.options.inDevice = "Analog Rytm (Core Audio)";
s.options.hardwareBufferSize = 256 * 8;
s.options.maxNodes = 2048;
s.options.numWireBufs = 1024;
s.options.numBuffers = 1024 * 16;
s.options.memSize = 131072 * 16;
s.options.sampleRate = 44100;
s.options.blockSize = 128;
s.options.numBuffers = 2048;
s.latency = 0.02;
s.options.verbosity = -2;
s.boot;
s.waitForBoot({
	0.5.wait;
//"/Users/canince/Documents/Github/sq/config/default/RMdefs.scd".load;
//"/Users/canince/Documents/Github/sq/config/default/RMfx.scd".load;
	~test_DrumSmpl1 = 0;
	~test_DrumSmpl2 = 0;
	~test_DrumSmpl3 = 0;
	~test_DrumSmpl4 = 0;
	~test_DrumSmpl5 = 0;
	~test_DrumSmpl6 = 0;
	~test_DrumSmpl7 = 0;
	~test_DrumSmpl8 = 0;
	~test_DrumSmpl9 = 0;
	~test_freeze = 0;
	~test_delay = 0;
	~test_ringMod = 0;
	~test_dubecho = 0;
	SuperDirt.start;

	s.meter;
	});
)
