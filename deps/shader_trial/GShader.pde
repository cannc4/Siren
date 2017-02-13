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

    mask_c = new Uniform<PVector>(this, "mask_c", new PVector(.0, .0), new PVector(.0, .0), new PVector(1., 1.));
    mask_d = new Uniform<PVector>(this, "mask_d", new PVector(1., 1.), new PVector(.0, .0), new PVector(1., 1.));
    time = new Uniform<Float>(this, "time", (float)millis()/1000.0, 0., Float.MAX_VALUE);
  }
  
  void update() {
    time.set((float)millis()/1000.0);
  }
  
  void addUniform(String name, float val){
    f_uniforms.add(new Uniform<Float>(this, name, val));
  }
  void addUniform(String name, PVector val){
    p_uniforms.add(new Uniform<PVector>(this, name, val));
  }
  void addUniform(String name, float val, float min, float max){
    f_uniforms.add(new Uniform<Float>(this, name, val, min, max));
  }
  void addUniform(String name, PVector val, PVector min, PVector max){
    p_uniforms.add(new Uniform<PVector>(this, name, val, min, max));
  }
  
  float getF(String n){
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
  PVector getV(String n){
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
  boolean set(String n, float v){
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
  boolean set(String n, PVector v){
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
  boolean set(String n, float v, long d){
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
  boolean set(String n, PVector v, long d){
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
  void print(){
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

  void setMinMax(T min, T max){
    minValue = min;
    maxValue = max;
  }

  void set(T v) { 
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
  void set(T v, long duration) {
    if (i == null) {
      i = new Interpolater(this, get(), v, millis(), duration);
      i.start();
    }
  }
  T get() {
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