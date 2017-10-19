(
  s.options.numOutputBusChannels = 10;
  s.options.numBuffers = 1024 * 16;
  s.options.memSize = 8192 * 16;
  s.quit;

  s.waitForBoot {
    SuperDirt.start;
  };
)
