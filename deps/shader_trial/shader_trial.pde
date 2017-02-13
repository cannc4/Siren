PGraphics pg;

PShape ph;
PShader ps;

float angle = 0;
float scale = 0;

void setup() {

  size(1280, 720, P3D);
  //fullScreen(P3D, 1);

  pg = createGraphics(width, height, P3D);

  ph = createSphere();
  ps = loadShader("main/sphereFrag.glsl", "main/sphereVert.glsl");

  /* start oscP5, listening for incoming messages at port 12000
   IP = 127.0.0.1 */
  oscP5 = new OscP5(this, 12000);

  initFilters();
  initShaders();
  
  for(GShader g : filters){
    g.print();
  }
  
   blobby.print();
   drip.print();
   bands.print();
   sine.print();
   noise.print();
   bits.print();
  
}

void keyPressed(){
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

void draw() {
  background(20);

  updateUniforms_Filters();
  updateUniforms_Shaders();

  // Main object drawn
  drawShaders();
  pushMatrix();
  angle+= 0.02;
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