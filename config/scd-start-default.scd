(
s.options.numInputBusChannels = 6;
s.options.numOutputBusChannels = 16;
s.options.numBuffers = 2048 * 64;
s.options.maxNodes = 1024 * 32;
s.options.memSize = 131072 * 16;
s.quit;

s.waitForBoot {

	SuperDirt.start;
}
)
