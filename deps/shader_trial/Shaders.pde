GShader blobby;
GShader drip;
GShader bands;
GShader sine;
GShader noise;
GShader bits;

void initShaders() {
  s_init_Bands();
  s_init_Bits();
  s_init_Blobby();
  s_init_Drip();
  s_init_Noise();
  s_init_Sine();
}

void updateUniforms_Shaders(){
  blobby.update();
  drip.update();
  bands.update();
  sine.update();
  noise.update();
  bits.update();
}

void s_init_Bands(){
  bands = new GShader("color/bands.glsl");

  bands.addUniform("noiseFactor", 20.0, 5, 100); // 5-100
  bands.addUniform("stripes", 50.0, 0, 100);     // 0-100
  bands.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

void s_init_Bits(){
  bits = new GShader("color/bits.glsl");

  bits.addUniform("mx", .5, 0, 1); // 0-1
  bits.addUniform("my", .5, 0, 1); // 0-1
  bits.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

void s_init_Blobby(){
  blobby = new GShader("color/blobby.glsl");

  blobby.addUniform("depth", 1.0, 0, 2); //0-2
  blobby.addUniform("rate", 1.0, 0,2);  //0-2
  blobby.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

void s_init_Drip(){
  drip = new GShader("color/drip.glsl");

  drip.addUniform("intense", .5,0,1); // 0-1
  drip.addUniform("speed", .5,0,1);   // 0-1
  drip.addUniform("graininess", new PVector(.5, .5), new PVector(0, 0), new PVector(1, 1)); // vec2(0-1, 0-1
  drip.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

void s_init_Noise(){
  noise = new GShader("color/noisy.glsl");

  noise.addUniform("noiseFactor", new PVector(5, 5), new PVector(0, 0), new PVector(10, 10)); // vec2(0-10, 0-10)
  noise.addUniform("noiseFactorTime", 1.0, 0, 2);  // 0-2
  noise.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

void s_init_Sine(){
  sine = new GShader("color/sinewave.glsl");

  sine.addUniform("colorMult", new PVector(2, 1.25), new PVector(.5, .5), new PVector(5, 2)); // vec2(.5-5, .5-2)
  sine.addUniform("coeffx", 20., 10, 50); // 10-50
  sine.addUniform("coeffy", 40., 0, 90);  // 0-90
  sine.addUniform("coeffz", 50., 1, 200); // 1-200
  sine.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}