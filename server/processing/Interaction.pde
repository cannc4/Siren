boolean isLabels = true;
boolean renewGrid = true;

int selectableIndex = 0;

void keyPressed(KeyEvent e) {
  // toogle playing 
  if(key == ' ') {
    isPlaying = !isPlaying;
  }
  // clears canvas 
  else if(key == 'c') {
    canvas.nuke(-1);
  }
  // toggle labels
  else if(key == 'l') {
    isLabels = !isLabels;
    renewGrid = true;
  }
  
  if (keyCode == UP) {
    timeCoefficient += 0.2;  
  } else if (keyCode == DOWN) {
    timeCoefficient -= 0.2;
  }
  
  
  // CTRL + SHIFT + S
  if (e.isShiftDown() && e.isControlDown() && int(e.getKey()) == 's'-'a'+1) {
    println("SAVE");
    saveJSON();
  }
  // CTRL + SHIFT + O
  // TODO: make filename generic
  if (e.isShiftDown() && e.isControlDown() && int(e.getKey()) == 'o'-'a'+1) {
    println("LOAD");
    loadJSON("export/exp~~~pmy~~~14568100010.json");
  }
  
  // Change cycle resolution and total cycles
  if(key == '=' || key == '-' || key == '[' || key == ']') {
    switch(key) {
      case '=':
        canvas.numberOfCycles++;
        break;
      case '-':
        canvas.numberOfCycles--; 
        break;
      case '[':
        canvas.cycleResolution--;
        break;
      case ']':
        canvas.cycleResolution++;
        break;
      default:
        break;
    }
    canvas.maxTime = canvas.numberOfCycles * 1000;
    canvas.restructureMessages();
  }
  
  
  // Scrubbing right and left 
  if(keyCode == LEFT) {
    int coeff = e.isShiftDown() ? 8 : 1;
    coeff *= isPlaying ? 2 : 1;
    time -= coeff*deltaTime;
    time = constrain(time, 0, canvas.maxTime);
    current_timestamp = icmap(time, 0, canvas.maxTime, 0, canvas.cycleResolution*canvas.numberOfCycles);
  }
  else if(keyCode == RIGHT) {
    int coeff = e.isShiftDown() ? 8 : 1;
    time += coeff*deltaTime;
    time = constrain(time, 0, canvas.maxTime);
  }
}


//// CONTROL P5 EVENTS /////
int numberOfFieldTextfields = 0;
void cp5_samples(int n) {
  selectableIndex = n;
  println(selectableIndex);
}
public void cp5_add() {
  String selectedSample = (String)cp5.get(ScrollableList.class, "cp5_samples").getItem(selectableIndex).get("name");
  String selectedNote = (String)cp5.get(Textfield.class,"cp5_note").getText();
  
  canvas.addNote(selectedSample, int(selectedNote), null);
}
public void cp5_addField() {
  float offset = 100+2*marginy + 20+3*marginy+ (numberOfFieldTextfields+1)*40;
  cp5.addBang("cp5_tf"+numberOfFieldTextfields+"_delete")
     .setCaptionLabel("-")
     .setPosition(0, offset)
     .setSize(marginx, 20)
     .setGroup(createPattern);
  cp5.addTextfield("cp5_tf"+numberOfFieldTextfields+"_key")
     .setCaptionLabel("key")
     .setPosition(marginx, offset)
     .setSize(int(size.x-2*marginx)/2, 20)
     .setAutoClear(false)
     .setGroup(createPattern);
  cp5.addTextfield("cp5_tf"+numberOfFieldTextfields+"_value")
     .setCaptionLabel("value")
     .setPosition(int(size.x)/2, offset)
     .setSize(int(size.x-2*marginx)/2, 20)
     .setAutoClear(false)
     .setGroup(createPattern);
  numberOfFieldTextfields++;
}
public void remove_optional_fields() {
  for (int i=0; i < numberOfFieldTextfields; i++) {
    if(cp5.get(Textfield.class, "cp5_tf"+i+"_key") != null && 
       cp5.get(Textfield.class, "cp5_tf"+i+"_value") != null){
      cp5.get(Textfield.class, "cp5_tf"+i+"_key").remove();
      cp5.get(Textfield.class, "cp5_tf"+i+"_value").remove();
      cp5.get(Bang.class, "cp5_tf"+i+"_delete").remove();
    }
  }
  numberOfFieldTextfields = 0;
}
public void controlEvent(ControlEvent theEvent) {
  for (int i=0; i < numberOfFieldTextfields; i++) {
    if (theEvent.getController().getName().equals("cp5_tf"+i+"_delete")) {
      cp5.get(Textfield.class, "cp5_tf"+i+"_key").remove();
      cp5.get(Textfield.class, "cp5_tf"+i+"_value").remove();
      cp5.get(Bang.class, "cp5_tf"+i+"_delete").remove();
    }
  }
}
////////////////////////////