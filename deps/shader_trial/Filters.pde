PShader lines;
PShader shake;
PShader rgbShift;
PShader hueSaturation;
PShader brightContrast;
PShader barrelBlur;
PShader glow;
PShader halftone;
PShader pixelate;
PShader pixelRolls;
PShader patches;
PShader edge;
PShader mirror;

ArrayList<PShader> filters = new ArrayList();
ArrayList<String>  filterNames = new ArrayList();

void updateUniforms_Filters() {
  shake.set("time", (float)millis()/1000.0);
  barrelBlur.set("time", (float)millis()/1000.0);
  pixelRolls.set("time", (float)millis()/1000.0);
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
  lines = loadShader("texture/lines.glsl");

  lines.set("lineStrength", 0.09);
  lines.set("lineSize", 2000.);
  lines.set("lineTilt", 0.45);

  filters.add(lines);
  filterNames.add("lines");
}

void f_init_Shake() {
  shake = loadShader("texture/shake.glsl");

  shake.set("time", millis());
  shake.set("amount", 0.01);     // 0-1.0

  shake.set("mask_c", 0.0, .0);
  shake.set("mask_d", 1., 1.);

  filters.add(shake);
  filterNames.add("shake");
}

void f_init_RGBShift() {
  rgbShift = loadShader("texture/rgbShift.glsl");

  rgbShift.set("angle", PI);     // 0-TWO_PI
  rgbShift.set("amount", 0.005); // 0-0.1

  rgbShift.set("mask_c", 0.0, .0);
  rgbShift.set("mask_d", 1., 1.);

  filters.add(rgbShift);
  filterNames.add("rgbShift");
}

void f_init_HueSaturation() {
  hueSaturation = loadShader("texture/hueSaturation.glsl");

  hueSaturation.set("hue", 0.0);         // 0 - 2
  hueSaturation.set("saturation", 1.0);  // -1 - 1

    hueSaturation.set("mask_c", 0.0, .0);
    hueSaturation.set("mask_d", 1., 1.);
  filters.add(hueSaturation);
  filterNames.add("hueSaturation");
}

void f_init_BarrelBlur() {
  barrelBlur = loadShader("texture/barrelBlur.glsl");

  barrelBlur.set("amount", 0.1);

    barrelBlur.set("mask_c", 0.0, .0);
    barrelBlur.set("mask_d", 1., 1.);
  filters.add(barrelBlur);
  filterNames.add("barrelBlur");
}

void f_init_BrightnessContrast() {
  brightContrast = loadShader("texture/brightContrast.glsl");

  brightContrast.set("brightness", 1.0);
  brightContrast.set("contrast", 1.0);

    brightContrast.set("mask_c", 0.0, .0);
    brightContrast.set("mask_d", 1., 1.);
  filters.add(brightContrast);
  filterNames.add("brightContrast");
}


void f_init_Glow() {
  glow = loadShader("texture/glow.glsl");

  glow.set("brightness", 0.25); // 0-0.5
  glow.set("radius", 2);        // 0-3

    glow.set("mask_c", 0.0, .0);
    glow.set("mask_d", 1., 1.);
  filters.add(glow);
  filterNames.add("glow");
}

void f_init_Halftone() {
  halftone = loadShader("texture/halftone.glsl");

  halftone.set("pixelsPerRow", 80);

    halftone.set("mask_c", 0.0, .0);
    halftone.set("mask_d", 1., 1.);
  filters.add(halftone);
  filterNames.add("halftone");
}

void f_init_Pixelate() {
  pixelate = loadShader("texture/pixelate.glsl");

  pixelate.set("pixels", 0.1 * width, 0.1 * height);

    pixelate.set("mask_c", 0.0, .0);
    pixelate.set("mask_d", 1., 1.);
  filters.add(pixelate);
  filterNames.add("pixelate");
}

void f_init_Patches() {
  patches = loadShader("texture/patches.glsl");

  patches.set("row", 0.5);
  patches.set("col", 0.5);

    patches.set("mask_c", 0.0, .0);
    patches.set("mask_d", 1., 1.);
  filters.add(patches);
  filterNames.add("patches");
}

void f_init_PixelRolls() {
  pixelRolls = loadShader("texture/pixelrolls.glsl");

  pixelRolls.set("pixels", 50.0, 10.0);
  pixelRolls.set("rollRate", 10.0);        //0-10
  pixelRolls.set("rollAmount", 0.09);

    pixelRolls.set("mask_c", 0.0, .0);
    pixelRolls.set("mask_d", 1., 1.);

  filters.add(pixelRolls);
  filterNames.add("pixelRolls");
}

void f_init_Edge(){
  edge = loadShader("texture/edges.glsl");

  edge.set("mask_c", 0.0, .0);
  edge.set("mask_d", 1., 1.);

  filters.add(edge);
  filterNames.add("edge");
}

void f_init_Mirror(){
  mirror = loadShader("texture/mirror.glsl");

  mirror.set("dir", 0.0);  // 0 vertical, 1 horizontal

  mirror.set("mask_c", 0.0, .0);
  mirror.set("mask_d", 1., 1.);

  filters.add(mirror);
  filterNames.add("mirror");
}
