// Timings /////
float glitchLasttime = 0;
float glitchTime = 0;

float strobeLasttime = 0;
float strobeTime = 0;

float randomMaskLasttime = 0;
float randomMaskTime = 0;
/////////////////

int presetNumber = 0;

// Keeps track of toggled shaders
ArrayList<PShader> toggledFilters = new ArrayList<PShader>();

// Glitch Effect
void glitchFx(){
  if(glitchLasttime+glitchTime > millis()){
    pixelate.set("pixels", random(1, 0.1 * width), random(1, 0.1 * height));

    glow.set("mask_c", 0., .0);
    glow.set("mask_d", 1., 1.);
    pixelate.set("mask_c", 0., .0);
    pixelate.set("mask_d", 1., 1.);

    filter(glow);
    filter(pixelate);
  }
}

// Strobe effect
void strobeFx(){
  if(strobeLasttime + strobeTime > millis()){
    brightContrast.set("brightness", random(-5, 5));
    brightContrast.set("contrast", random(-5, 5));

    brightContrast.set("mask_c", 0., .0);
    brightContrast.set("mask_d", 1., 1.);

    filter(brightContrast);
  }
  else{
    brightContrast.set("brightness", 1.);
    brightContrast.set("contrast", 1.);
    filter(brightContrast);
  }
}

// Masks effects randomly
void randomMasksFx(){
  if(randomMaskLasttime + randomMaskTime > millis()){
    float orientation = random(-1, 1);
    float rand_x = random(1);
    float rand_width = random(1);
    float rand_y = random(1);
    float rand_height = random(1);
    for(int i = 0; i < filters.size(); i++)
    {
      if(orientation > 0){
        filters.get(i).set("mask_c", 0., rand_y);
        filters.get(i).set("mask_d", 1., rand_height);
      }
      else{
        filters.get(i).set("mask_c", rand_x, 0.);
        filters.get(i).set("mask_d", rand_width, 1.);
      }
    }
  }
  else{
    for(int i = 0; i < filters.size(); i++)
    {
      filters.get(i).set("mask_c", 0., 0.);
      filters.get(i).set("mask_d", 1., 1.);
    }
  }
}

// Toggle Filters
void toggleFilters() {
  for(int i = 0; i < toggledFilters.size(); i++) {
    filter(toggledFilters.get(i));
  }
}

// Saved filter sequences
void presets(){
  if(presetNumber == 1){
    filter(shake);
    filter(rgbShift);
    filter(hueSaturation);
    filter(brightContrast);
    filter(barrelBlur);
    filter(glow);
    filter(halftone);
    filter(mirror);
  }
  else if(presetNumber == 2)
  {
    filter(shake);
    filter(rgbShift);
    filter(hueSaturation);
    filter(brightContrast);
    filter(barrelBlur);
    filter(glow);
    filter(pixelRolls);
  }
  else if(presetNumber == 3)
  {
    filter(shake);
    filter(rgbShift);
    filter(hueSaturation);
    filter(brightContrast);
    filter(barrelBlur);
    filter(glow);
    filter(patches);
  }
  else if(presetNumber == 4)
  {
    filter(shake);
    filter(rgbShift);
    filter(hueSaturation);
    filter(brightContrast);
    filter(barrelBlur);
    filter(glow);
    filter(edge);
  }
}