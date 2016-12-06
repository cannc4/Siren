boolean isSpheres = false;
int shaderNumber = 0;

void drawSingleSphere(float detail, PVector pos, color fill){
  pushMatrix();
  noStroke();
  fill(fill);
  translate(pos.x, pos.y, pos.z);
  scale(3);
  sphere(detail);
  popMatrix();
}

void drawSpheres(){
  pushMatrix();
  translate(width/2, height/2, 0);
  rotateZ(map(millis(), 0, 5000, 0, TWO_PI)%TWO_PI);
  drawSingleSphere(5, new PVector(-100, -100, 0), color(64,88,190));
  drawSingleSphere(5, new PVector(0, 0, 0), color(200,150,50));
  drawSingleSphere(5, new PVector(100, 100, 0), color(82, 200, 50));
  drawSingleSphere(5, new PVector(-100, 100, 0), color(200));
  drawSingleSphere(5, new PVector(100, -100, 0), color(50));
  popMatrix();
}

void drawShaders(){
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
