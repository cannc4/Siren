PGraphics pg;

void setup() {
  size(1000, 800, P3D);
  //fullScreen(P3D, 1);
  pg = createGraphics(width,height, P3D);

  /* start oscP5, listening for incoming messages at port 12000
     IP = 127.0.0.1 */
  oscP5 = new OscP5(this, 12000);

  initFilters();
  initShaders();
}

void draw() {
  background(20);

  updateUniforms_Filters();
  updateUniforms_Shaders();

  // Main object drawn
  drawSpheres();
  drawShaders();

  // post-processing effects
  presets();
  glitchFx();
  strobeFx();
  randomMasksFx();
  toggleFilters();

  // Overall subtle line pattern
  filter(lines);

  // Debugging texts
  fill(255);
  textSize(25);
  text(frameRate, 5, 30);
}
