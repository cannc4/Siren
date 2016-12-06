(
Server.supernova;
s.audioBusAllocator.reserve(12,1);
s.options.numAudioBusChannels=128;
s.options.numOutputBusChannels = 2;
s.options.numInputBusChannels = 10;
//s.options.outDevice = "Headphones";
//s.options.outDevice = "Built-in Output";
// s.options.outDevice = "Fireface UCX (23648323)";
//s.options.outDevice = "Fireface UFX (23646473)";
s.options.outDevice = "QUAD-CAPTURE";
//s.options.inDevice = "Analog Rytm (Core Audio)";
s.options.hardwareBufferSize = 256;
s.options.maxNodes = 2048;
s.options.numWireBufs = 1024;
s.options.memSize = 131072 * 16;
s.options.sampleRate = 44100;
s.options.blockSize = 128;

s.options.numBuffers = 2048;
s.latency = 0.02;
s.options.verbosity = -2;
//MIDIClient.init;
//MIDIIn.connectAll;
SuperDirt.start;
)
