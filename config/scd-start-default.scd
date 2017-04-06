(
s.options.numOutputBusChannels = 6;
s.options.numBuffers = 2048 * 16;
s.options.maxNodes = 1024 * 16;
s.options.memSize_(65536 * 4);
s.quit;

s.waitForBoot {
 SuperDirt.start;
 s.latency = 0.3;

  }
)
