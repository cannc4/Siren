PShader blobby;
PShader drip;
PShader bands;
PShader sine;
PShader noise;
PShader bits;

void initShaders() {
  s_init_Bands();
  s_init_Bits();
  s_init_Blobby();
  s_init_Drip();
  s_init_Noise();
  s_init_Sine();
}

void updateUniforms_Shaders(){
  blobby.set("time", (float) millis()/1000.0);
  blobby.set("resolution", float(width), float(height));
  drip.set("time", (float) millis()/1000.0);
  drip.set("resolution", float(width), float(height));
  bands.set("time", (float) millis()/1000.0);
  bands.set("resolution", float(width), float(height));
  sine.set("time", (float) millis()/1000.0);
  sine.set("resolution", float(width), float(height));
  noise.set("time", (float) millis()/1000.0);
  noise.set("resolution", float(width), float(height));
  bits.set("time", (float) millis()/1000.0);
  bits.set("resolution", float(width), float(height));
}

void s_init_Bands(){
  bands = loadShader("color/bands.glsl");

  bands.set("noiseFactor", 20.0); // 5-100
  bands.set("stripes", 50.0);     // 0-100
}

void s_init_Bits(){
  bits = loadShader("color/bits.glsl");

  bits.set("mx", .5); // 0-1
  bits.set("my", .5); // 0-1
}

void s_init_Blobby(){
  blobby = loadShader("color/blobby.glsl");

  blobby.set("depth", 1.0); //0-2
  blobby.set("rate", 1.0);  //0-2
}

void s_init_Drip(){
  drip = loadShader("color/drip.glsl");

  drip.set("intense", .5); // 0-1
  drip.set("speed", .5);   // 0-1
  drip.set("graininess", .5, .5); // vec2(0-1, 0-1)
}

void s_init_Noise(){
  noise = loadShader("color/noisy.glsl");

  noise.set("noiseFactor", 5.0, 5.0); // vec2(0-10, 0-10)
  noise.set("noiseFactorTime", 1.0);  // 0-2
}

void s_init_Sine(){
  sine = loadShader("color/sinewave.glsl");

  sine.set("colorMult", 2., 1.25); // vec2(.5-5, .5-2)
  sine.set("coeffx", 20.); // 10-50
  sine.set("coeffy", 40.);  // 0-90
  sine.set("coeffz", 50.); // 1-200
}
