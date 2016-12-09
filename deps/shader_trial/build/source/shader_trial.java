import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import oscP5.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class shader_trial extends PApplet {

PGraphics pg;

PShape ph;
PShader ps;

public void setup() {
  
  pg = createGraphics(width,height, P3D);

  ph = createSphere();
  ps = loadShader("main/sphereFrag.glsl", "main/sphereVert.glsl");

  /* start oscP5, listening for incoming messages at port 12000
     IP = 127.0.0.1 */
  oscP5 = new OscP5(this, 12000);

  initFilters();
  initShaders();
}

public void draw() {
  background(20);

  updateUniforms_Filters();
  updateUniforms_Shaders();

  // Main object drawn
  drawShaders();
  drawSphere();

  // post-processing effects
  presets();
  glitchFx();
  strobeFx();
  randomMasksFx();
  toggleFilters();

  // Overall subtle line pattern
  filter(lines);

  //saveFrame("C:\\GitHub\\200c\\celluar\\im-######.tga");

  // Debugging texts
  /*fill(255);
  textSize(25);
  text(frameRate, 5, 30);*/
}
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

public void updateUniforms_Filters() {
  shake.set("time", (float)millis()/1000.0f);
  barrelBlur.set("time", (float)millis()/1000.0f);
  pixelRolls.set("time", (float)millis()/1000.0f);
}

public void initFilters() {
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

public void f_init_Lines() {
  lines = loadShader("texture/lines.glsl");

  lines.set("lineStrength", 0.09f);
  lines.set("lineSize", 2000.f);
  lines.set("lineTilt", 0.45f);

  filters.add(lines);
  filterNames.add("lines");
}

public void f_init_Shake() {
  shake = loadShader("texture/shake.glsl");

  shake.set("time", millis());
  shake.set("amount", 0.01f);     // 0-1.0

  shake.set("mask_c", 0.0f, .0f);
  shake.set("mask_d", 1.f, 1.f);

  filters.add(shake);
  filterNames.add("shake");
}

public void f_init_RGBShift() {
  rgbShift = loadShader("texture/rgbShift.glsl");

  rgbShift.set("angle", PI);     // 0-TWO_PI
  rgbShift.set("amount", 0.005f); // 0-0.1

  rgbShift.set("mask_c", 0.0f, .0f);
  rgbShift.set("mask_d", 1.f, 1.f);

  filters.add(rgbShift);
  filterNames.add("rgbShift");
}

public void f_init_HueSaturation() {
  hueSaturation = loadShader("texture/hueSaturation.glsl");

  hueSaturation.set("hue", 0.0f);         // 0 - 2
  hueSaturation.set("saturation", 1.0f);  // -1 - 1

    hueSaturation.set("mask_c", 0.0f, .0f);
    hueSaturation.set("mask_d", 1.f, 1.f);
  filters.add(hueSaturation);
  filterNames.add("hueSaturation");
}

public void f_init_BarrelBlur() {
  barrelBlur = loadShader("texture/barrelBlur.glsl");

  barrelBlur.set("amount", 0.1f);

    barrelBlur.set("mask_c", 0.0f, .0f);
    barrelBlur.set("mask_d", 1.f, 1.f);
  filters.add(barrelBlur);
  filterNames.add("barrelBlur");
}

public void f_init_BrightnessContrast() {
  brightContrast = loadShader("texture/brightContrast.glsl");

  brightContrast.set("brightness", 1.0f);
  brightContrast.set("contrast", 1.0f);

    brightContrast.set("mask_c", 0.0f, .0f);
    brightContrast.set("mask_d", 1.f, 1.f);
  filters.add(brightContrast);
  filterNames.add("brightContrast");
}


public void f_init_Glow() {
  glow = loadShader("texture/glow.glsl");

  glow.set("brightness", 0.25f); // 0-0.5
  glow.set("radius", 2);        // 0-3

    glow.set("mask_c", 0.0f, .0f);
    glow.set("mask_d", 1.f, 1.f);
  filters.add(glow);
  filterNames.add("glow");
}

public void f_init_Halftone() {
  halftone = loadShader("texture/halftone.glsl");

  halftone.set("pixelsPerRow", 80);

    halftone.set("mask_c", 0.0f, .0f);
    halftone.set("mask_d", 1.f, 1.f);
  filters.add(halftone);
  filterNames.add("halftone");
}

public void f_init_Pixelate() {
  pixelate = loadShader("texture/pixelate.glsl");

  pixelate.set("pixels", 0.1f * width, 0.1f * height);

    pixelate.set("mask_c", 0.0f, .0f);
    pixelate.set("mask_d", 1.f, 1.f);
  filters.add(pixelate);
  filterNames.add("pixelate");
}

public void f_init_Patches() {
  patches = loadShader("texture/patches.glsl");

  patches.set("row", 0.5f);
  patches.set("col", 0.5f);

    patches.set("mask_c", 0.0f, .0f);
    patches.set("mask_d", 1.f, 1.f);
  filters.add(patches);
  filterNames.add("patches");
}

public void f_init_PixelRolls() {
  pixelRolls = loadShader("texture/pixelrolls.glsl");

  pixelRolls.set("pixels", 50.0f, 10.0f);
  pixelRolls.set("rollRate", 10.0f);        //0-10
  pixelRolls.set("rollAmount", 0.09f);

    pixelRolls.set("mask_c", 0.0f, .0f);
    pixelRolls.set("mask_d", 1.f, 1.f);

  filters.add(pixelRolls);
  filterNames.add("pixelRolls");
}

public void f_init_Edge(){
  edge = loadShader("texture/edges.glsl");

  edge.set("mask_c", 0.0f, .0f);
  edge.set("mask_d", 1.f, 1.f);

  filters.add(edge);
  filterNames.add("edge");
}

public void f_init_Mirror(){
  mirror = loadShader("texture/mirror.glsl");

  mirror.set("dir", 0.0f);  // 0 vertical, 1 horizontal

  mirror.set("mask_c", 0.0f, .0f);
  mirror.set("mask_d", 1.f, 1.f);

  filters.add(mirror);
  filterNames.add("mirror");
}

OscP5 oscP5;

// global filter toggles
boolean isshake = false;
boolean isrgbShift = false;
boolean ishueSaturation = false;
boolean isbrightContrast = false;
boolean isfxaa = false;
boolean isbarrelBlur = false;
boolean isglow = false;
boolean ishalftone = false;
boolean ispixelate = false;
boolean ispixelRolls = false;
boolean ispatches = false;
boolean isedge = false;
boolean ismirror = false;

/* incoming osc message are forwarded to the oscEvent method. */
public void oscEvent(OscMessage m)
{
  // sendOSC `channel` $ Message "global" [string "global", Float 1]
  if(getName(m).equals("global")){
    if (m.checkTypetag("sf"))
    {
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg){
        case "glitch":
          glitchLasttime = millis();
          glitchTime = val;   break;
        case "strobe":
          strobeLasttime = millis();
          strobeTime = val;   break;
        case "randMask":
          randomMaskLasttime = millis();
          randomMaskTime = val;
          orientation = random(-1, 1);
          rand_x = random(1); rand_width = random(1);
          rand_y = random(1); rand_height = random(1); break;
        case "preset":
          presetNumber = PApplet.parseInt(val);   break;
        case "shake":
          isshake = !isshake;
          if(isshake) toggledFilters.add(shake);
          else toggledFilters.remove(shake); break;
        case "rgbShift":
          isrgbShift = !isrgbShift;
          if(isrgbShift) toggledFilters.add(rgbShift);
          else toggledFilters.remove(rgbShift); break;
        case "hueSaturation":
          ishueSaturation = !ishueSaturation;
          if(ishueSaturation) toggledFilters.add(hueSaturation);
          else toggledFilters.remove(hueSaturation); break;
        case "brightContrast":
          isbrightContrast = !isbrightContrast;
          if(isbrightContrast) toggledFilters.add(brightContrast);
          else toggledFilters.remove(brightContrast); break;
        case "barrelBlur":
          isbarrelBlur = !isbarrelBlur;
          if(isbarrelBlur) toggledFilters.add(barrelBlur);
          else toggledFilters.remove(barrelBlur); break;
        case "glow":
          isglow = !isglow;
          if(isglow) toggledFilters.add(glow);
          else toggledFilters.remove(glow); break;
        case "halftone":
          ishalftone = !ishalftone;
          if(ishalftone) toggledFilters.add(halftone);
          else toggledFilters.remove(halftone); break;
        case "pixelate":
          ispixelate = !ispixelate;
          if(ispixelate) toggledFilters.add(pixelate);
          else toggledFilters.remove(pixelate); break;
        case "pixelRolls":
          ispixelRolls = !ispixelRolls;
          if(ispixelRolls) toggledFilters.add(pixelRolls);
          else toggledFilters.remove(pixelRolls); break;
        case "patches":
          ispatches = !ispatches;
          if(ispatches) toggledFilters.add(patches);
          else toggledFilters.remove(patches); break;
        case "edge":
          isedge = !isedge;
          if(isedge) toggledFilters.add(edge);
          else toggledFilters.remove(edge); break;
        case "mirror":
          ismirror = !ismirror;
          if(ismirror) toggledFilters.add(mirror);
          else toggledFilters.remove(mirror); break;
        default:
          break;
      }
    }
  }
  else if(getName(m).equals("object")){
    if (m.checkTypetag("sf"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg){
        case "shaders":
          shaderNumber = (int)val; break;
        default:
          break;
      }
    }
  }
  else // per filter modification
  {
    // sendOSC `channel` $ Message "FilterName" [string "AttrName", Float AttrValue]
    if (m.checkTypetag("sf"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      // Get filter index
      int index = -1;
      for (int i = 0; i < filterNames.size(); ++i) {
        if (filterNames.get(i).equals(getName(m))) {
          index = i;
        }
      }

      // Apply modification
      if (index >= 0) {
        filters.get(index).set(arg, val);
      }
    }
  }
}

public String getName(OscMessage m) {
  String s = "";
  for (int i = 0; i < m.getAddrPatternAsBytes().length; i++) {
    if ((char) m.getAddrPatternAsBytes()[i] != 0)
      s += (char) m.getAddrPatternAsBytes()[i];
  }
  return s;
}
PShader blobby;
PShader drip;
PShader bands;
PShader sine;
PShader noise;
PShader bits;

public void initShaders() {
  s_init_Bands();
  s_init_Bits();
  s_init_Blobby();
  s_init_Drip();
  s_init_Noise();
  s_init_Sine();
}

public void updateUniforms_Shaders(){
  blobby.set("time", (float) millis()/1000.0f);
  blobby.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
  drip.set("time", (float) millis()/1000.0f);
  drip.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
  bands.set("time", (float) millis()/1000.0f);
  bands.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
  sine.set("time", (float) millis()/1000.0f);
  sine.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
  noise.set("time", (float) millis()/1000.0f);
  noise.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
  bits.set("time", (float) millis()/1000.0f);
  bits.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));
}

public void s_init_Bands(){
  bands = loadShader("color/bands.glsl");

  bands.set("noiseFactor", 20.0f); // 5-100
  bands.set("stripes", 50.0f);     // 0-100
}

public void s_init_Bits(){
  bits = loadShader("color/bits.glsl");

  bits.set("mx", .5f); // 0-1
  bits.set("my", .5f); // 0-1
}

public void s_init_Blobby(){
  blobby = loadShader("color/blobby.glsl");

  blobby.set("depth", 1.0f); //0-2
  blobby.set("rate", 1.0f);  //0-2
}

public void s_init_Drip(){
  drip = loadShader("color/drip.glsl");

  drip.set("intense", .5f); // 0-1
  drip.set("speed", .5f);   // 0-1
  drip.set("graininess", .5f, .5f); // vec2(0-1, 0-1)
}

public void s_init_Noise(){
  noise = loadShader("color/noisy.glsl");

  noise.set("noiseFactor", 5.0f, 5.0f); // vec2(0-10, 0-10)
  noise.set("noiseFactorTime", 1.0f);  // 0-2
}

public void s_init_Sine(){
  sine = loadShader("color/sinewave.glsl");

  sine.set("colorMult", 2.f, 1.25f); // vec2(.5-5, .5-2)
  sine.set("coeffx", 20.f); // 10-50
  sine.set("coeffy", 40.f);  // 0-90
  sine.set("coeffz", 50.f); // 1-200
}
// OSC Parameters for shape drawing
int shaderNumber = 0;

public PShape createSphere() {
  float[] vertices = {
      0.404509f,-0.866025f,-0.293893f, 0.154508f,-0.866025f,-0.475528f, -0.154509f,-0.866025f,-0.475528f, -0.404509f,-0.866025f,-0.293893f, -0.500000f,-0.866025f,0.000000f, -0.404509f,-0.866025f,0.293893f, -0.154508f,-0.866025f,0.475528f, 0.154509f,-0.866025f,0.475528f, 0.404509f,-0.866025f,0.293893f, 0.500000f,-0.866025f,0.000000f, 0.700629f,-0.500000f,-0.509037f, 0.267617f,-0.500000f,-0.823639f, -0.267617f,-0.500000f,-0.823639f, -0.700629f,-0.500000f,-0.509037f, -0.866026f,-0.500000f,0.000000f, -0.700629f,-0.500000f,0.509037f, -0.267617f,-0.500000f,0.823639f, 0.267617f,-0.500000f,0.823639f, 0.700629f,-0.500000f,0.509037f, 0.866025f,-0.500000f,0.000000f, 0.809017f,0.000000f,-0.587785f, 0.309017f,0.000000f,-0.951057f, -0.309017f,0.000000f,-0.951057f, -0.809017f,0.000000f,-0.587785f, -1.000000f,0.000000f,0.000000f, -0.809017f,0.000000f,0.587785f, -0.309017f,0.000000f,0.951057f, 0.309017f,0.000000f,0.951057f, 0.809017f,0.000000f,0.587785f, 1.000000f,0.000000f,0.000000f, 0.700629f,0.500000f,-0.509037f, 0.267617f,0.500000f,-0.823639f, -0.267617f,0.500000f,-0.823639f, -0.700629f,0.500000f,-0.509037f, -0.866026f,0.500000f,0.000000f, -0.700629f,0.500000f,0.509037f, -0.267617f,0.500000f,0.823639f, 0.267617f,0.500000f,0.823639f, 0.700629f,0.500000f,0.509037f, 0.866025f,0.500000f,0.000000f, 0.404509f,0.866025f,-0.293893f, 0.154508f,0.866025f,-0.475528f, -0.154509f,0.866025f,-0.475528f, -0.404509f,0.866025f,-0.293893f, -0.500000f,0.866025f,0.000000f, -0.404509f,0.866025f,0.293893f, -0.154508f,0.866025f,0.475528f, 0.154509f,0.866025f,0.475528f, 0.404509f,0.866025f,0.293893f, 0.500000f,0.866025f,0.000000f, 0.000000f,-1.000000f,0.000000f, 0.000000f,1.000000f,0.000000f
  };
  float[] texCoord = {
      0.000000f,0.166667f, 0.100000f,0.166667f, 0.200000f,0.166667f, 0.300000f,0.166667f, 0.400000f,0.166667f, 0.500000f,0.166667f, 0.600000f,0.166667f, 0.700000f,0.166667f, 0.800000f,0.166667f, 0.900000f,0.166667f, 1.000000f,0.166667f, 0.000000f,0.333333f, 0.100000f,0.333333f, 0.200000f,0.333333f, 0.300000f,0.333333f, 0.400000f,0.333333f, 0.500000f,0.333333f, 0.600000f,0.333333f, 0.700000f,0.333333f, 0.800000f,0.333333f, 0.900000f,0.333333f, 1.000000f,0.333333f, 0.000000f,0.500000f, 0.100000f,0.500000f, 0.200000f,0.500000f, 0.300000f,0.500000f, 0.400000f,0.500000f, 0.500000f,0.500000f, 0.600000f,0.500000f, 0.700000f,0.500000f, 0.800000f,0.500000f, 0.900000f,0.500000f, 1.000000f,0.500000f, 0.000000f,0.666667f, 0.100000f,0.666667f, 0.200000f,0.666667f, 0.300000f,0.666667f, 0.400000f,0.666667f, 0.500000f,0.666667f, 0.600000f,0.666667f, 0.700000f,0.666667f, 0.800000f,0.666667f, 0.900000f,0.666667f, 1.000000f,0.666667f, 0.000000f,0.833333f, 0.100000f,0.833333f, 0.200000f,0.833333f, 0.300000f,0.833333f, 0.400000f,0.833333f, 0.500000f,0.833333f, 0.600000f,0.833333f, 0.700000f,0.833333f, 0.800000f,0.833333f, 0.900000f,0.833333f, 1.000000f,0.833333f, 0.050000f,0.000000f, 0.150000f,0.000000f, 0.250000f,0.000000f, 0.350000f,0.000000f, 0.450000f,0.000000f, 0.550000f,0.000000f, 0.650000f,0.000000f, 0.750000f,0.000000f, 0.850000f,0.000000f, 0.950000f,0.000000f, 0.050000f,1.000000f, 0.150000f,1.000000f, 0.250000f,1.000000f, 0.350000f,1.000000f, 0.450000f,1.000000f, 0.550000f,1.000000f, 0.650000f,1.000000f, 0.750000f,1.000000f, 0.850000f,1.000000f, 0.950000f,1.000000f
  };
  float[] in = {
      1,2,11, 11,2,12, 2,3,12, 12,3,13, 3,4,13, 13,4,14, 4,5,14, 14,5,15, 5,6,15, 15,6,16, 6,7,16, 16,7,17, 7,8,17, 17,8,18, 8,9,18, 18,9,19, 9,10,19, 19,10,20, 10,1,20, 20,1,11, 11,12,21, 21,12,22, 12,13,22, 22,13,23, 13,14,23, 23,14,24, 14,15,24, 24,15,25, 15,16,25, 25,16,26, 16,17,26, 26,17,27, 17,18,27, 27,18,28, 18,19,28, 28,19,29, 19,20,29, 29,20,30, 20,11,30, 30,11,21, 21,22,31, 31,22,32, 22,23,32, 32,23,33, 23,24,33, 33,24,34, 24,25,34, 34,25,35, 25,26,35, 35,26,36, 26,27,36, 36,27,37, 27,28,37, 37,28,38, 28,29,38, 38,29,39, 29,30,39, 39,30,40, 30,21,40, 40,21,31, 31,32,41, 41,32,42, 32,33,42, 42,33,43, 33,34,43, 43,34,44, 34,35,44, 44,35,45, 35,36,45, 45,36,46, 36,37,46, 46,37,47, 37,38,47, 47,38,48, 38,39,48, 48,39,49, 39,40,49, 49,40,50, 40,31,50, 50,31,41, 2,1,51, 3,2,51, 4,3,51, 5,4,51, 6,5,51, 7,6,51, 8,7,51, 9,8,51, 10,9,51, 1,10,51, 41,42,52, 42,43,52, 43,44,52, 44,45,52, 45,46,52, 46,47,52, 47,48,52, 48,49,52, 49,50,52, 50,41,52
  };
  // to start indices from 0
  for(int i = 0; i < in.length; i++){
      in[i]--;
  }
  textureMode(NORMAL);
  PShape sh = createShape();
  sh.beginShape(TRIANGLES);
  sh.noStroke();
  for (int i = 0; i < in.length/3.0f; i++) {
    sh.vertex(vertices[PApplet.parseInt(3*in[3*i])], vertices[PApplet.parseInt(3*in[3*i]+1)], vertices[PApplet.parseInt(3*in[3*i]+2)],
              texCoord[PApplet.parseInt(2*in[3*i])], texCoord[PApplet.parseInt(2*in[3*i]+1)]);
    sh.vertex(vertices[PApplet.parseInt(3*in[3*i+1])], vertices[PApplet.parseInt(3*in[3*i+1]+1)], vertices[PApplet.parseInt(3*in[3*i+1]+2)],
              texCoord[PApplet.parseInt(2*in[3*i])], texCoord[PApplet.parseInt(2*in[3*i+1]+1)]);
    sh.vertex(vertices[PApplet.parseInt(3*in[3*i+2])], vertices[PApplet.parseInt(3*in[3*i+2]+1)], vertices[PApplet.parseInt(3*in[3*i+2]+2)],
              texCoord[PApplet.parseInt(2*in[3*i+2])], texCoord[PApplet.parseInt(2*in[3*i+2]+1)]);
  }
  sh.endShape();
  return sh;
}

public void drawSphere(){
  pushMatrix();
  translate(width/2, height/2, 10);
  scale(150);
  ps.set("u_time", (float)millis()/1000);
  shader(ps);
  shape(ph);
  resetShader();
  popMatrix();
}

public void drawShaders(){
  if(shaderNumber > 0){
    pg.beginDraw();
    if(shaderNumber == 1)
      pg.shader(blobby);
    else if(shaderNumber == 2)
      pg.shader(bits);
    else if(shaderNumber == 3)
      pg.shader(bands);
    else if(shaderNumber == 4)
      pg.shader(noise);
    else if(shaderNumber == 5)
      pg.shader(sine);
    else if(shaderNumber == 6)
      pg.shader(drip);
    pg.rect(0,0,pg.width, pg.height);
    pg.endDraw();

    image(pg, 0, 0);
  }
}
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
ArrayList<PShader> toggledFilters = new ArrayList<PShader>();

// Glitch Effect
public void glitchFx(){
  if(glitchLasttime+glitchTime > millis()){
    pixelate.set("pixels", random(1, 0.1f * width), random(1, 0.1f * height));

    glow.set("mask_c", 0.f, .0f);
    glow.set("mask_d", 1.f, 1.f);
    pixelate.set("mask_c", 0.f, .0f);
    pixelate.set("mask_d", 1.f, 1.f);

    filter(glow);
    filter(pixelate);
  }
}

// Strobe effect
public void strobeFx(){
  if(strobeLasttime + strobeTime > millis()){
    brightContrast.set("brightness", random(-5, 5));
    brightContrast.set("contrast", random(-5, 5));

    brightContrast.set("mask_c", 0.f, .0f);
    brightContrast.set("mask_d", 1.f, 1.f);

    filter(brightContrast);
  }
  else{
    brightContrast.set("brightness", 1.f);
    brightContrast.set("contrast", 1.f);
    filter(brightContrast);
  }
}

// Masks effects randomly
public void randomMasksFx(){
  if(randomMaskLasttime + randomMaskTime > millis()){
    for(int i = 0; i < filters.size(); i++)
    {
      if(orientation > 0){
        filters.get(i).set("mask_c", 0.f, rand_y);
        filters.get(i).set("mask_d", 1.f, rand_height);
      }
      else{
        filters.get(i).set("mask_c", rand_x, 0.f);
        filters.get(i).set("mask_d", rand_width, 1.f);
      }
    }
  }
  else{
    for(int i = 0; i < filters.size(); i++)
    {
      filters.get(i).set("mask_c", 0.f, 0.f);
      filters.get(i).set("mask_d", 1.f, 1.f);
    }
  }
}

// Toggle Filters
public void toggleFilters() {
  for(int i = 0; i < toggledFilters.size(); i++) {
    filter(toggledFilters.get(i));
  }
}

// Saved filter sequences
public void presets(){
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
  public void settings() {  fullScreen(P3D, 2); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "shader_trial" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
