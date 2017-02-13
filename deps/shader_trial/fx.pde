// Timings /////
float glitchLasttime = 0;
float glitchTime = 0;

float strobeLasttime = 0;
float strobeTime = 0;

float randomMaskLasttime = 0;
float randomMaskTime = 0;
/////////////////

// Random Mask Parameters ///
float orientation = 0;
float rand_x = 0;
float rand_width = 0;
float rand_y = 0;
float rand_height = 0;
////////////////////////////

int presetNumber = 0;

// Keeps track of toggled shaders
ArrayList<GShader> toggledFilters = new ArrayList<GShader>();

// Glitch Effect
void glitchFx(){
  if(glitchLasttime+glitchTime > millis()){
    pixelate.set("pixels", new PVector(random(1, 0.1 * width), random(1, 0.1 * height)));

    glow.set("mask_c", new PVector(0,0));
    glow.set("mask_d", new PVector(1,1));
    pixelate.set("mask_c", new PVector(0,0));
    pixelate.set("mask_d", new PVector(1,1));

    filter(glow.shader);
    filter(pixelate.shader);
  }
}

// Strobe effect
void strobeFx(){
  if(strobeLasttime + strobeTime > millis()){
    brightContrast.set("brightness", random(-5, 5));
    brightContrast.set("contrast", random(-5, 5));

    brightContrast.set("mask_c", new PVector(0,0));
    brightContrast.set("mask_d", new PVector(1,1));

    filter(brightContrast.shader);
  }
}

// Masks effects randomly
void randomMasksFx(){
  if(randomMaskLasttime + randomMaskTime > millis()){
    for(int i = 0; i < filters.size(); i++)
    {
      if(orientation > 0){
        filters.get(i).set("mask_c", new PVector(0,rand_y));
        filters.get(i).set("mask_d", new PVector(1,rand_height));
      }
      else{
        filters.get(i).set("mask_c", new PVector(rand_x, 0));
        filters.get(i).set("mask_d", new PVector(rand_width, 1));
      }
    }
  }
  else{
    for(int i = 0; i < filters.size(); i++)
    {
      filters.get(i).set("mask_c", new PVector(0,0));
      filters.get(i).set("mask_d", new PVector(1,1));
    }
  }
}

// Toggle Filters
void toggleFilters() {
  for(int i = 0; i < toggledFilters.size(); i++) {
    filter(toggledFilters.get(i).shader);
  }
}

// Saved filter sequences
void presets(){
  if(presetNumber == 1)      // OK
    filter(shake.shader);
  else if(presetNumber == 2) // OK
    filter(rgbShift.shader);
  else if(presetNumber == 3) // OK
    filter(hueSaturation.shader);
  else if(presetNumber == 4) // OK
    filter(brightContrast.shader);
  else if(presetNumber == 5) // OK --
    filter(barrelBlur.shader);
  else if(presetNumber == 6) // not working
    filter(glow.shader);
  else if(presetNumber == 7) // complete black
    filter(halftone.shader);
  else if(presetNumber == 8) // OK
    filter(pixelRolls.shader);
  else if(presetNumber == 9) // OK
    filter(pixelate.shader);
  else if(presetNumber == 10)// OKo
    filter(patches.shader);
  else if(presetNumber == 11)// OK
    filter(edge.shader);
  else if(presetNumber == 12)// OK
    filter(mirror.shader);
  
  //if(presetNumber == 1){
  //  filter(shake.shader);
  //  filter(rgbShift.shader); // not colored
  //  filter(hueSaturation.shader); // always applies
  //  filter(brightContrast.shader); // doesnt seem to work
  //  filter(barrelBlur.shader); // something off
  //  filter(glow.shader); // doesnt work
  //  filter(halftone.shader); // blacks out screen
  //  filter(mirror.shader); 
  //}
  //else if(presetNumber == 2)
  //{
  //  filter(shake.shader);
  //  filter(rgbShift.shader);
  //  filter(hueSaturation.shader);
  //  filter(brightContrast.shader);
  //  filter(barrelBlur.shader);
  //  filter(glow.shader);
  //  filter(pixelRolls.shader);
  //}
  //else if(presetNumber == 3)
  //{
  //  filter(shake.shader);
  //  filter(rgbShift.shader);
  //  filter(hueSaturation.shader);
  //  filter(brightContrast.shader);
  //  filter(barrelBlur.shader);
  //  filter(glow.shader);
  //  filter(patches.shader);
  //}
  //else if(presetNumber == 4)
  //{
  //  filter(shake.shader);
  //  filter(rgbShift.shader);
  //  filter(hueSaturation.shader);
  //  filter(brightContrast.shader);
  //  filter(barrelBlur.shader);
  //  filter(glow.shader);
  //  filter(edge.shader);
  //}
}