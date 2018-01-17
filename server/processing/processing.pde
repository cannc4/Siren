float prevTime = millis();
float time = 0;
float deltaTime = 0;
float timeCoefficient = 1;

PianoRoll canvas;

void setup() {
  size(1200, 600);
  frameRate(60);
  noSmooth();
  
  //printArray(subset(PFont.list(), 200, 400));
  textFont(createFont("Courier New Bold", 12));
  
  canvas = new PianoRoll();
  
  initNetwork();
  initControls();
  
  surface.setResizable(true);
}

void draw() {
  background(50);
  deltaTime = millis() - prevTime;
 
  // App drawing
  
  prevTime = millis();
  
  // title
  String txt_fps = String.format("Siren Editor [fps %6.2f] [speed %6.2f]", frameRate, timeCoefficient);
  surface.setTitle(txt_fps);
}