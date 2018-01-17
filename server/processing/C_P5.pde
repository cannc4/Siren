import controlP5.*;
import java.util.*;

ControlP5 cp5;
Canvas gc;
Group createPattern;

int marginx = 10;
int marginy = 10;

PVector pos = new PVector(marginx, marginy);
PVector size = new PVector(100, height-2*marginy);

HashMap<String, String> fields = new HashMap<String, String>();

void initControls() {
  cp5 = new ControlP5(this);
  cp5.setAutoDraw(true);
  cp5.setColorForeground(color(0, 200));
  cp5.setColorBackground(color(255, 50));
  cp5.setColorActive(color(255, 150));
  
  // Canvas
  gc = new SirenEditorCanvas(100+4*marginx, marginy, 
                       width-5*marginx-100, height-2*marginy);
  gc.pre();
  cp5.addCanvas(gc);
  
  initWindow();
  
  //// RightClickMenu
  //contextMenu = cp5.addGroup("g1")
  //                  .setPosition(0,0)
  //                  .setBackgroundHeight(100)
  //                  .setBackgroundColor(color(255,50))
  //                  ;
  //contextMenu.setVisible(false);
}

void initWindow() {
  createPattern = cp5.addGroup("createPattern")
                            .setPosition(pos.x, pos.y)
                            .setWidth(int(size.x))
                            .setBackgroundHeight(int(size.y))
                            .setBackgroundColor(color(20, 50))
                            .disableCollapse();
  createPattern.hideBar();
 
  cp5.addTextfield("cp5_rollname")
     .setCaptionLabel("Editor Name")
     .setPosition(marginx, marginy)
     .setSize(int(size.x-2*marginx), 20)
     .setAutoClear(false)
     .setGroup(createPattern)
     .setText(canvas.name);
 
  String[] filenames = listFileNames("/Users/canince/Dropbox/~siren/pool1/");
  cp5.addScrollableList("cp5_samples")
     .setCaptionLabel("Samples")
     .setPosition(marginx, 20+4*marginy)
     .setSize(int(size.x-2*marginx), 100)
     .setBarHeight(20)
     .setItemHeight(20)
     .addItems(Arrays.asList(filenames))
     .setType(ControlP5.LIST)
     .setGroup(createPattern);
  
  cp5.addTextfield("cp5_note")
     .setCaptionLabel("n")
     .setPosition(marginx, 100+2*marginy + 20+3*marginy)
     .setSize(int(size.x-5*marginx), 20)
     .setAutoClear(false)
     .setGroup(createPattern);
  
  cp5.addBang("cp5_addField")
     .setCaptionLabel("+")
     .setPosition(int(size.x-3*marginx), 100+2*marginy + 20+3*marginy)
     .setSize(int(2*marginx), 20)
     .setGroup(createPattern);
     
  cp5.addBang("cp5_add")
     .setCaptionLabel("add")
     .setPosition(marginx, 500+2*marginy)
     .setSize(int(size.x-2*marginx), 20)
     .setGroup(createPattern);
}