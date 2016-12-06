/*if(key == '1' || key == '2' || key == '3' || key == '4' || key == '5')
{
  pushMatrix();
  translate(width/2, height/2, 0);
  rotateZ(map(millis(), 0, 5000, 0, TWO_PI)%TWO_PI);
  drawSphere(5, new PVector(-100, -100, 0), color(0,0,255));
  drawSphere(5, new PVector(0, 0, 0), color(255,0,0));
  drawSphere(5, new PVector(100, 100, 0), color(0, 255,0));
  drawSphere(5, new PVector(-100, 100, 0), color(200));
  drawSphere(5, new PVector(100, -100, 0), color(50));
  popMatrix();
}
else{
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
  pg.rect(0, 0, pg.width, pg.height);
  pg.endDraw();

  image(pg, 0, 0);
}

if(key == '1'){
  filter(shake);
  filter(rgbShift);
  filter(hueSaturation);
  filter(brightContrast);
  filter(fxaa);
  filter(barrelBlur);
  filter(glow);
  filter(lines);
  filter(halftone);
  filter(mirror);
}
else if(key == '2')
{
  filter(shake);
  filter(rgbShift);
  filter(hueSaturation);
  filter(brightContrast);
  filter(fxaa);
  filter(barrelBlur);
  filter(glow);
  filter(pixelRolls);
}
else if(key == '3')
{
  filter(shake);
  filter(rgbShift);
  filter(hueSaturation);
  filter(brightContrast);
  filter(fxaa);
  filter(barrelBlur);
  filter(glow);
  filter(patches);
}
else if(key == '4')
{
  filter(shake);
  filter(rgbShift);
  filter(hueSaturation);
  filter(brightContrast);
  filter(fxaa);
  filter(barrelBlur);
  filter(glow);
}
else if(key == '5')
{
  if(millis() % 2500 > 0 && millis() % 2500 < 1000){
    filter(shake);
    filter(rgbShift);
    filter(hueSaturation);
    filter(brightContrast);
    filter(fxaa);
    filter(barrelBlur);
    filter(glow);
    filter(patches);
    filter(edge);
    filter(halftone);
    filter(mirror);
    filter(rgbShift);
    filter(pixelate);
    filter(pixelRolls);
  }
}*/
