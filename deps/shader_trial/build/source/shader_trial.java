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

float angle = 0;
float scale = 0;

public void setup() {

  
  //fullScreen(P3D, 1);

  pg = createGraphics(width, height, P3D);

  ph = createSphere();
  ps = loadShader("main/sphereFrag.glsl", "main/sphereVert.glsl");

  /* start oscP5, listening for incoming messages at port 12000
   IP = 127.0.0.1 */
  oscP5 = new OscP5(this, 12000);

  initFilters();
  initShaders();
}

public void keyPressed(){
  if(key == 'p')
    presetNumber++;
  else if(key == 'o')
    presetNumber--;
  else if(key == 's'){
    strobeLasttime = millis();
    strobeTime = 500;
  }
  else if(key == 'a'){
    glitchLasttime = millis();
    glitchTime = 500;
  }
  else if(key == 'd'){
    randomMaskLasttime = millis();
    randomMaskTime = 1000;
    orientation = random(-1, 1);
    rand_x = random(1);
    rand_width = random(1);
    rand_y = random(1);
    rand_height = random(1);
  }
}

public void draw() {
  background(20);

  updateUniforms_Filters();
  updateUniforms_Shaders();

  // Main object drawn
  drawShaders();
  pushMatrix();
  angle+= 0.02f;
  translate(width/2, height/2);
  rotate(angle, random(0,1),random(0,1),random(0,1));
  noFill();
  stroke(200);
  sphereDetail(10);
  sphere(100);
  popMatrix();
  //drawSphere();

  // post-processing effects
  presets();
  glitchFx();
  strobeFx();
  randomMasksFx();
  toggleFilters();

  // Overall subtle line pattern
  filter(lines.shader);

  // Debugging texts
  /*fill(255);
   textSize(25);
   text(frameRate, 5, 30);*/
}
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

public void updateUniforms_Filters() {
  for(GShader g : filters){
    g.update();
  }
  //shake.addUniform("time", (float)millis()/1000.0);
  //barrelBlur.addUniform("time", (float)millis()/1000.0);
  //pixelRolls.addUniform("time", (float)millis()/1000.0);
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
  lines = new GShader("texture/lines.glsl");

  lines.addUniform("lineStrength", 0.09f, 0, 1);
  lines.addUniform("lineSize", 2000.f, 2000, 4000);
  lines.addUniform("lineTilt", 0.45f, 0, 1);

  filters.add(lines);
  filterNames.add("lines");
}

public void f_init_Shake() {
  shake = new GShader("texture/shake.glsl");

  shake.addUniform("amount", 0.01f, 0, 1);     // 0-1.0

  filters.add(shake);
  filterNames.add("shake");
}

public void f_init_RGBShift() {
  rgbShift = new GShader("texture/rgbShift.glsl");

  rgbShift.addUniform("angle", PI, 0, TWO_PI);     // 0-TWO_PI
  rgbShift.addUniform("amount", 0.005f, 0, .1f);     // 0-0.1

  filters.add(rgbShift);
  filterNames.add("rgbShift");
}

public void f_init_HueSaturation() {
  hueSaturation = new GShader("texture/hueSaturation.glsl");

  hueSaturation.addUniform("hue", 0.0f, .0f, 2.f);         // 0 - 2
  hueSaturation.addUniform("saturation", 1.0f, -1, 1);  // -1 - 1

  filters.add(hueSaturation);
  filterNames.add("hueSaturation");
}

public void f_init_BarrelBlur() {
  barrelBlur = new GShader("texture/barrelBlur.glsl");

  barrelBlur.addUniform("amount", 0.1f, 0, 1);

  filters.add(barrelBlur);
  filterNames.add("barrelBlur");
}

public void f_init_BrightnessContrast() {
  brightContrast = new GShader("texture/brightContrast.glsl");

  brightContrast.addUniform("brightness", 1.0f, 0, 1);
  brightContrast.addUniform("contrast", 1.0f, 0, 1);

  filters.add(brightContrast);
  filterNames.add("brightContrast");
}


public void f_init_Glow() {
  glow = new GShader("texture/glow.glsl");

  glow.addUniform("brightness", 0.25f, 0, .5f); // 0-0.5
  glow.addUniform("radius", 2, 0, 3);         // 0-3

  filters.add(glow);
  filterNames.add("glow");
}

public void f_init_Halftone() {
  halftone = new GShader("texture/halftone.glsl");

  halftone.addUniform("pixelsPerRow", 80.f, 10.f, 400.f);

  filters.add(halftone);
  filterNames.add("halftone");
}

public void f_init_Pixelate() {
  pixelate = new GShader("texture/pixelate.glsl");

  pixelate.addUniform("pixels", new PVector (0.1f * width, 0.1f * height), new PVector(10, 10), new PVector(width/2, height/2));

  filters.add(pixelate);
  filterNames.add("pixelate");
}

public void f_init_Patches() {
  patches = new GShader("texture/patches.glsl");

  patches.addUniform("row", 0.5f, 0, 1);
  patches.addUniform("col", 0.5f, 0, 1);

  filters.add(patches);
  filterNames.add("patches");
}

public void f_init_PixelRolls() {
  pixelRolls = new GShader("texture/pixelrolls.glsl");

  pixelRolls.addUniform("pixels", new PVector (50.0f, 10.0f), new PVector (2.0f, 2.0f), new PVector (300.0f, 300.0f));
  pixelRolls.addUniform("rollRate", 10.0f, 0, 10);        //0-10
  pixelRolls.addUniform("rollAmount", 0.09f, 0, .5f);

  filters.add(pixelRolls);
  filterNames.add("pixelRolls");
}

public void f_init_Edge(){
  edge = new GShader("texture/edges.glsl");

  filters.add(edge);
  filterNames.add("edge");
}

public void f_init_Mirror(){
  mirror = new GShader("texture/mirror.glsl");

  mirror.addUniform("dir", 0.0f, 0, 1);  // 0 vertical, 1 horizontal

  filters.add(mirror);
  filterNames.add("mirror");
}
class GShader {
  PShader shader;
  String filename;

  // common uniforms
  Uniform<PVector> mask_c;
  Uniform<PVector> mask_d;
  Uniform<Float> time;
  
  // all uniforms
  ArrayList<Uniform<Float>> f_uniforms;
  ArrayList<Uniform<PVector>> p_uniforms;

  GShader(String filename) {
    this.filename = filename;
    this.f_uniforms = new ArrayList<Uniform<Float>>();
    this.p_uniforms = new ArrayList<Uniform<PVector>>();

    shader = loadShader(filename);

    mask_c = new Uniform<PVector>(this, "mask_c", new PVector(.0f, .0f), new PVector(.0f, .0f), new PVector(1.f, 1.f));
    mask_d = new Uniform<PVector>(this, "mask_d", new PVector(1.f, 1.f), new PVector(.0f, .0f), new PVector(1.f, 1.f));
    time = new Uniform<Float>(this, "time", (float)millis()/1000.0f, 0.f, Float.MAX_VALUE);
  }
  
  public void update() {
    time.set((float)millis()/1000.0f);
  }
  
  public void addUniform(String name, float val){
    f_uniforms.add(new Uniform<Float>(this, name, val));
  }
  public void addUniform(String name, PVector val){
    p_uniforms.add(new Uniform<PVector>(this, name, val));
  }
  public void addUniform(String name, float val, float min, float max){
    f_uniforms.add(new Uniform<Float>(this, name, val, min, max));
  }
  public void addUniform(String name, PVector val, PVector min, PVector max){
    p_uniforms.add(new Uniform<PVector>(this, name, val, min, max));
  }
  
  public float getF(String n){
    if(n.equals(time.name)) {return time.value;}
    else{
      for(Uniform<Float> u : f_uniforms){
        if(n.equals(u.name) && u.value instanceof Float){
           return u.value;
        }
      }
    }
    return -1;
  }
  public PVector getV(String n){
    if(n.equals(mask_c.name)) {return mask_c.value;}
    else if(n.equals(mask_d.name)) {return mask_d.value;}
    else{
      for(Uniform<PVector> u : p_uniforms){
        if(n.equals(u.name) && u.value instanceof PVector){
           return u.value;
        }
      }
    }
    return null;
  }
  public boolean set(String n, float v){
    if(n.equals(time.name)) { time.set(v); return true;}
    else{
      for(Uniform<Float> u : f_uniforms){
        if(n.equals(u.name) && u.value instanceof Float){
           u.set(v);
           return true;
        }
      }
    }
    return false;
  }
  public boolean set(String n, PVector v){
    if(n.equals(mask_c.name)) { mask_c.set(v); return true;}
    else if(n.equals(mask_d.name)) { mask_d.set(v); return true;}
    else{
      for(Uniform<PVector> u : p_uniforms){
        if(n.equals(u.name) && u.value instanceof PVector){
           u.set(v);
           return true;
        }
      }
    }
    return false;
  }
  public boolean set(String n, float v, long d){
    if(n.equals(time.name)) { time.set(v,d); return true;}
    else{
      for(Uniform<Float> u : f_uniforms){
        if(n.equals(u.name) && u.value instanceof Float){
           u.set(v,d);
           return true;
        }
      }
    }
    return false;
  }
  public boolean set(String n, PVector v, long d){
    if(n.equals(mask_c.name)) { mask_c.set(v, d); return true;}
    else if(n.equals(mask_d.name)) { mask_d.set(v, d); return true;}
    else{
      for(Uniform<PVector> u : p_uniforms){
        if(n.equals(u.name) && u.value instanceof PVector){
           u.set(v, d);
           return true;
        }
      }
    }
    return false;
  }
  
  // Printer
  public void print(){
    println(split(filename, '/')[1]+": ");
    for(int i = 0; i < f_uniforms.size(); i++)
      println(i+ "(float): " + f_uniforms.get(i).name + " " + f_uniforms.get(i).value);
      
    for(int i = 0; i < p_uniforms.size(); i++)
      println((i+f_uniforms.size()) + "(PVector): " + p_uniforms.get(i).name + " " + p_uniforms.get(i).value);
    println("(PVector): " + mask_c.name + " " + mask_c.value);
    println("(PVector): " + mask_d.name + " " + mask_d.value);
    println("(float): " + time.name + " " + time.value);
  }
};

class Uniform<T> {
  Interpolater i;
  GShader s;

  String name;
  T value;
  
  T maxValue;
  T minValue;
  
  
  Uniform(GShader g, String n, T v){
    s = g;
    name = n;
    set(v);
  }
  
  Uniform(GShader g, String n, T v, T min, T max){
    s = g;
    name = n;
    minValue = min;
    maxValue = max;
    set(v);
  }

  public void setMinMax(T min, T max){
    minValue = min;
    maxValue = max;
  }

  public void set(T v) { 
    value = v;
    
    if(maxValue != null && minValue != null){
      if(v instanceof Float) {
        if((float)v > (float)maxValue)
          value = maxValue;
        else if((float)v < (float)minValue)
          value = minValue;
      }
      else if(v instanceof PVector) {
        if(((PVector)v).x > ((PVector)maxValue).x)
          ((PVector)value).x = ((PVector)maxValue).x;
        else if(((PVector)v).x < ((PVector)minValue).x)
          ((PVector)value).x = ((PVector)minValue).x;
        
        if(((PVector)v).y > ((PVector)maxValue).y)
          ((PVector)value).y = ((PVector)maxValue).y;
        else if(((PVector)v).y < ((PVector)minValue).y)
          ((PVector)value).y = ((PVector)minValue).y;   
      }
    }
    
    try{
      if(v instanceof Float)
        s.shader.set(name, (float)v);
      else if(v instanceof PVector)
        s.shader.set(name, ((PVector)v).x, ((PVector)v).y);
    }catch(Exception e){e.printStackTrace();}
  }
  public void set(T v, long duration) {
    if (i == null) {
      i = new Interpolater(this, get(), v, millis(), duration);
      i.start();
    }
  }
  public T get() {
    return value;
  }

  private class Interpolater extends Thread {
    private T value_initial, value_target;
    private long timecheck, duration;
    private Uniform uni;

    public Interpolater(Uniform u, T v0, T vn, long t0, long d) {
      uni = u;
      value_initial = v0;
      value_target = vn;
      timecheck = t0;
      duration = d;
    }

    public void run() {
      while (timecheck+duration > millis()) {
        float amt = ((float)millis()-(float)timecheck)/(float)duration;
        if (value_initial instanceof PVector)
          uni.set(((PVector)value_initial).lerp((PVector)value_target, amt));          
        else if ( value_initial instanceof Float)
          uni.set(lerp((float)value_initial, (float)value_target, amt));
        
        try { Thread.sleep(20); }
        catch(Exception e) {}
      }
      i = null;
    }
  };
};

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
  if (getName(m).equals("global")) {
    if (m.checkTypetag("sf"))
    {
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg) {
      case "glitch":
        glitchLasttime = millis();
        glitchTime = val;
        break;
      case "strobe":
        strobeLasttime = millis();
        strobeTime = val;
        break;
      case "randMask":
        randomMaskLasttime = millis();
        randomMaskTime = val;
        orientation = random(-1, 1);
        rand_x = random(1);
        rand_width = random(1);
        rand_y = random(1);
        rand_height = random(1);
        break;
      case "preset":
        presetNumber = PApplet.parseInt(val);
        break;
      case "shake":
        isshake = !isshake;
        if (isshake) toggledFilters.add(shake);
        else toggledFilters.remove(shake);
        break;
      case "rgbShift":
        isrgbShift = !isrgbShift;
        if (isrgbShift) toggledFilters.add(rgbShift);
        else toggledFilters.remove(rgbShift);
        break;
      case "hueSaturation":
        ishueSaturation = !ishueSaturation;
        if (ishueSaturation) toggledFilters.add(hueSaturation);
        else toggledFilters.remove(hueSaturation);
        break;
      case "brightContrast":
        isbrightContrast = !isbrightContrast;
        if (isbrightContrast) toggledFilters.add(brightContrast);
        else toggledFilters.remove(brightContrast);
        break;
      case "barrelBlur":
        isbarrelBlur = !isbarrelBlur;
        if (isbarrelBlur) toggledFilters.add(barrelBlur);
        else toggledFilters.remove(barrelBlur);
        break;
      case "glow":
        isglow = !isglow;
        if (isglow) toggledFilters.add(glow);
        else toggledFilters.remove(glow);
        break;
      case "halftone":
        ishalftone = !ishalftone;
        if (ishalftone) toggledFilters.add(halftone);
        else toggledFilters.remove(halftone);
        break;
      case "pixelate":
        ispixelate = !ispixelate;
        if (ispixelate) toggledFilters.add(pixelate);
        else toggledFilters.remove(pixelate);
        break;
      case "pixelRolls":
        ispixelRolls = !ispixelRolls;
        if (ispixelRolls) toggledFilters.add(pixelRolls);
        else toggledFilters.remove(pixelRolls);
        break;
      case "patches":
        ispatches = !ispatches;
        if (ispatches) toggledFilters.add(patches);
        else toggledFilters.remove(patches);
        break;
      case "edge":
        isedge = !isedge;
        if (isedge) toggledFilters.add(edge);
        else toggledFilters.remove(edge);
        break;
      case "mirror":
        ismirror = !ismirror;
        if (ismirror) toggledFilters.add(mirror);
        else toggledFilters.remove(mirror);
        break;
      default:
        break;
      }
    }
  } else if (getName(m).equals("object")) {
    if (m.checkTypetag("sf"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg) {
      case "shaders":
        shaderNumber = (int)val;
        break;
      default:
        break;
      }
    }
  } else if (getName(m).equals("tree")) {
    println(m.get(1).stringValue());
    if (m.checkTypetag("ss"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      String val = m.get(1).stringValue();


      println("==tree OSC== \nname:"+arg+" value: "+val);
    }
  }
  else // per filter modification
  {
    // sendOSC `channel` $ Message "FilterName" [string "AttrName", Float AttrValue]

    // Instant modification
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

      if (index >= 0) {
        filters.get(index).set(arg, val);
      }
    }
    // Delayed modification
    else if (m.checkTypetag("sff")){

      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();
      float dur = m.get(2).floatValue();

      // Get filter index
      int index = -1;
      for (int i = 0; i < filterNames.size(); ++i) {
        if (filterNames.get(i).equals(getName(m))) {
          index = i;
        }
      }

      if (index >= 0) {
        filters.get(index).set(arg, val, (long)dur);
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
GShader blobby;
GShader drip;
GShader bands;
GShader sine;
GShader noise;
GShader bits;

public void initShaders() {
  s_init_Bands();
  s_init_Bits();
  s_init_Blobby();
  s_init_Drip();
  s_init_Noise();
  s_init_Sine();
}

public void updateUniforms_Shaders(){
  blobby.update();
  drip.update();
  bands.update();
  sine.update();
  noise.update();
  bits.update();
}

public void s_init_Bands(){
  bands = new GShader("color/bands.glsl");

  bands.addUniform("noiseFactor", 20.0f, 5, 100); // 5-100
  bands.addUniform("stripes", 50.0f, 0, 100);     // 0-100
  bands.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

public void s_init_Bits(){
  bits = new GShader("color/bits.glsl");

  bits.addUniform("mx", .5f, 0, 1); // 0-1
  bits.addUniform("my", .5f, 0, 1); // 0-1
  bits.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

public void s_init_Blobby(){
  blobby = new GShader("color/blobby.glsl");

  blobby.addUniform("depth", 1.0f, 0, 2); //0-2
  blobby.addUniform("rate", 1.0f, 0,2);  //0-2
  blobby.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

public void s_init_Drip(){
  drip = new GShader("color/drip.glsl");

  drip.addUniform("intense", .5f,0,1); // 0-1
  drip.addUniform("speed", .5f,0,1);   // 0-1
  drip.addUniform("graininess", new PVector(.5f, .5f), new PVector(0, 0), new PVector(1, 1)); // vec2(0-1, 0-1
  drip.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

public void s_init_Noise(){
  noise = new GShader("color/noisy.glsl");

  noise.addUniform("noiseFactor", new PVector(5, 5), new PVector(0, 0), new PVector(10, 10)); // vec2(0-10, 0-10)
  noise.addUniform("noiseFactorTime", 1.0f, 0, 2);  // 0-2
  noise.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
}

public void s_init_Sine(){
  sine = new GShader("color/sinewave.glsl");

  sine.addUniform("colorMult", new PVector(2, 1.25f), new PVector(.5f, .5f), new PVector(5, 2)); // vec2(.5-5, .5-2)
  sine.addUniform("coeffx", 20.f, 10, 50); // 10-50
  sine.addUniform("coeffy", 40.f, 0, 90);  // 0-90
  sine.addUniform("coeffz", 50.f, 1, 200); // 1-200
  sine.addUniform("resolution", new PVector(width, height), new PVector(width/2, height/2), new PVector(width, height));
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
  sh.beginShape(POINTS);
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
      pg.shader(blobby.shader);
    else if(shaderNumber == 2)
      pg.shader(bits.shader);
    else if(shaderNumber == 3)
      pg.shader(bands.shader);
    else if(shaderNumber == 4)
      pg.shader(noise.shader);
    else if(shaderNumber == 5)
      pg.shader(sine.shader);
    else if(shaderNumber == 6)
      pg.shader(drip.shader);
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
ArrayList<GShader> toggledFilters = new ArrayList<GShader>();

// Glitch Effect
public void glitchFx(){
  if(glitchLasttime+glitchTime > millis()){
    pixelate.set("pixels", new PVector(random(1, 0.1f * width), random(1, 0.1f * height)));

    glow.set("mask_c", new PVector(0,0));
    glow.set("mask_d", new PVector(1,1));
    pixelate.set("mask_c", new PVector(0,0));
    pixelate.set("mask_d", new PVector(1,1));

    filter(glow.shader);
    filter(pixelate.shader);
  }
}

// Strobe effect
public void strobeFx(){
  if(strobeLasttime + strobeTime > millis()){
    brightContrast.set("brightness", random(-5, 5));
    brightContrast.set("contrast", random(-5, 5));

    brightContrast.set("mask_c", new PVector(0,0));
    brightContrast.set("mask_d", new PVector(1,1));

    filter(brightContrast.shader);
  }
}

// Masks effects randomly
public void randomMasksFx(){
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
public void toggleFilters() {
  for(int i = 0; i < toggledFilters.size(); i++) {
    filter(toggledFilters.get(i).shader);
  }
}

// Saved filter sequences
public void presets(){
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
  public void settings() {  size(1280, 720, P3D); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "shader_trial" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
