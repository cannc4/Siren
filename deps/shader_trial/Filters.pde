GShader lines;
GShader shake;
GShader rgbShift;
GShader hueSaturation;
GShader brightContrast;
GShader barrelBlur;
GShader glow;
GShader halftone;
GShader pixelate;
GShader pixelRolls;
GShader patches;
GShader edge;
GShader mirror;

ArrayList<GShader> filters = new ArrayList();
ArrayList<String>  filterNames = new ArrayList();

void updateUniforms_Filters() {
  for(GShader g : filters){
    g.update();
  }
  //shake.addUniform("time", (float)millis()/1000.0);
  //barrelBlur.addUniform("time", (float)millis()/1000.0);
  //pixelRolls.addUniform("time", (float)millis()/1000.0);
}

void initFilters() {
  f_init_Lines();
  f_init_Shake();
  f_init_RGBShift();
  f_init_HueSaturation();
  f_init_BrightnessContrast();
  f_init_BarrelBlur();
  f_init_Glow();
  f_init_Halftone();
  f_init_Pixelate();
  f_init_PixelRolls();
  f_init_Patches();
  f_init_Edge();
  f_init_Mirror();
}

void f_init_Lines() {
  lines = new GShader("texture/lines.glsl");

  lines.addUniform("lineStrength", 0.09, 0, 1);
  lines.addUniform("lineSize", 2000., 2000, 4000);
  lines.addUniform("lineTilt", 0.45, 0, 1);

  filters.add(lines);
  filterNames.add("lines");
}

void f_init_Shake() {
  shake = new GShader("texture/shake.glsl");

  shake.addUniform("amount", 0.01, 0, 1);     // 0-1.0

  filters.add(shake);
  filterNames.add("shake");
}

void f_init_RGBShift() {
  rgbShift = new GShader("texture/rgbShift.glsl");

  rgbShift.addUniform("angle", PI, 0, TWO_PI);     // 0-TWO_PI
  rgbShift.addUniform("amount", 0.005, 0, .1);     // 0-0.1

  filters.add(rgbShift);
  filterNames.add("rgbShift");
}

void f_init_HueSaturation() {
  hueSaturation = new GShader("texture/hueSaturation.glsl");

  hueSaturation.addUniform("hue", 0.0, .0, 2.);         // 0 - 2
  hueSaturation.addUniform("saturation", 1.0, -1, 1);  // -1 - 1

  filters.add(hueSaturation);
  filterNames.add("hueSaturation");
}

void f_init_BarrelBlur() {
  barrelBlur = new GShader("texture/barrelBlur.glsl");

  barrelBlur.addUniform("amount", 0.1, 0, 1);

  filters.add(barrelBlur);
  filterNames.add("barrelBlur");
}

void f_init_BrightnessContrast() {
  brightContrast = new GShader("texture/brightContrast.glsl");

  brightContrast.addUniform("brightness", 1.0, 0, 1);
  brightContrast.addUniform("contrast", 1.0, 0, 1);

  filters.add(brightContrast);
  filterNames.add("brightContrast");
}


void f_init_Glow() {
  glow = new GShader("texture/glow.glsl");

  glow.addUniform("brightness", 0.25, 0, .5); // 0-0.5
  glow.addUniform("radius", 2, 0, 3);         // 0-3

  filters.add(glow);
  filterNames.add("glow");
}

void f_init_Halftone() {
  halftone = new GShader("texture/halftone.glsl");

  halftone.addUniform("pixelsPerRow", 80., 10., 400.);

  filters.add(halftone);
  filterNames.add("halftone");
}

void f_init_Pixelate() {
  pixelate = new GShader("texture/pixelate.glsl");

  pixelate.addUniform("pixels", new PVector (0.1 * width, 0.1 * height), new PVector(10, 10), new PVector(width/2, height/2));

  filters.add(pixelate);
  filterNames.add("pixelate");
}

void f_init_Patches() {
  patches = new GShader("texture/patches.glsl");

  patches.addUniform("row", 0.5, 0, 1);
  patches.addUniform("col", 0.5, 0, 1);

  filters.add(patches);
  filterNames.add("patches");
}

void f_init_PixelRolls() {
  pixelRolls = new GShader("texture/pixelrolls.glsl");

  pixelRolls.addUniform("pixels", new PVector (50.0, 10.0), new PVector (2.0, 2.0), new PVector (300.0, 300.0));
  pixelRolls.addUniform("rollRate", 10.0, 0, 10);        //0-10
  pixelRolls.addUniform("rollAmount", 0.09, 0, .5);

  filters.add(pixelRolls);
  filterNames.add("pixelRolls");
}

void f_init_Edge(){
  edge = new GShader("texture/edges.glsl");

  filters.add(edge);
  filterNames.add("edge");
}

void f_init_Mirror(){
  mirror = new GShader("texture/mirror.glsl");

  mirror.addUniform("dir", 0.0, 0, 1);  // 0 vertical, 1 horizontal

  filters.add(mirror);
  filterNames.add("mirror");
}