void setup(){
  size (512, 512);
  textAlign(CENTER, CENTER);
  
  /* start oscP5, listening for incoming messages at port XXX
     IP = 127.0.0.1 */
  int PORT = 5000;
  oscP5 = new OscP5(this, PORT);
}

void draw(){
  background(30);
 
  text(message, width/2, height/2);
}