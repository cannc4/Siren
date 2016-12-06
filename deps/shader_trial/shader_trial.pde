PGraphics pg;

void setup() {
  //fullScreen(P3D, 1);
  size(500, 500, P3D);
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

  pushMatrix();
  translate(width/2, height/2, 0);
  rotateZ(map(millis(), 0, 5000, 0, TWO_PI)%TWO_PI);
  drawSphere(5, new PVector(-100, -100, 0), color(0,0,255));
  drawSphere(5, new PVector(0, 0, 0), color(255,0,0));
  drawSphere(5, new PVector(100, 100, 0), color(0, 255,0));
  drawSphere(5, new PVector(-100, 100, 0), color(200));
  drawSphere(5, new PVector(100, -100, 0), color(50));
  popMatrix();

  if(key == 'q' || key == 'w' || key == 'e' || key == 'r' || key == 't' || key == 'y'){
    pg.beginDraw();
    if(key == 'q')
      pg.shader(blobby);
    else if(key == 'w')
      pg.shader(bits);
    else if(key == 'e')
      pg.shader(bands);
    else if(key == 'r')
      pg.shader(noise);
    else if(key == 't')
      pg.shader(sine);
    else if(key == 'y')
      pg.shader(drip);
    pg.rect(0,0,pg.width, pg.height);
    pg.endDraw();

    image(pg, 0, 0);
  }

  // post-processing effects
  glitchFx();
  strobeFx();
  randomMasksFx();
  toggleFilters();
  presets();

  // Overall subtle line pattern
  filter(lines);

  // Debugging texts
  fill(255);
  textSize(25);
  text(frameRate, 5, 30);
}

void drawSphere(float detail, PVector pos, color fill){
  pushMatrix();
  noStroke();
  fill(fill);
  translate(pos.x, pos.y, pos.z);
  scale(3);
  sphere(detail);
  popMatrix();
}