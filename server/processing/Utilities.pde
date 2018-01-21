// File
static String[] listFileNames(String dir) {
  File file = new File(dir);
  if (file.isDirectory()) {
    String names[] = file.list();
    return names;
  } else {
    // If it's not a directory
    return null;
  }
}

// Class getter
Object getField(Object obj, String field) {
  try{
    return obj.getClass().getDeclaredField(field).get(obj);
  }catch(Exception e) {
    println("No \"" + field+"\" field in "+obj.getClass().getName());
  }
  return null;
}

// Math
static float log10 (float x) {
  return (log(x) / log(10));
}
static float cmap(float v, float x1, float y1, float x2, float y2) {
  return constrain(map(v, x1, y1, x2, y2), min(x2, y2), max(x2, y2));
}
static int icmap(float v, float x1, float y1, float x2, float y2) {
  return int(constrain(map(v, x1, y1, x2, y2), min(x2, y2), max(x2, y2)));
}

// Save current window
void saveJSON () {
  JSONObject json = new JSONObject();
  json.setFloat("speed", timeCoefficient);
  json.setFloat("resolution", canvas.cycleResolution);
  json.setFloat("start", 0);
  json.setFloat("end", canvas.numberOfCycles);
  json.setFloat("loop", 1);
  
  int i = 0;
  JSONArray messages = new JSONArray();
  for(SampleContainer s : canvas.sampleList) {
    for(NoteContainer n : s.notes) {
      for(Message m : n.messages) {
        JSONObject message = new JSONObject();
        
        message.setString("s", m.s);
        message.setInt("n", m.n);
        message.setInt("orbit", m.orbit);
        message.setFloat("cycle", m.cycle);
        message.setInt("t_index", m.t_index);
        //message.setFloat("time", m.time);
        message.setFloat("cps", m.cps);
        message.setFloat("delta", m.delta);
        
        String fieldString = "";
        for(Map.Entry field : m.fields.entrySet()) {
          fieldString += (String)field.getKey()+','+str((float)field.getValue())+',';
        }
        if(!fieldString.equals("")) 
          message.setString("fields", fieldString.substring(0, fieldString.length()-1));
        
        messages.setJSONObject(i++, message);
      }
    } 
  }
  json.setJSONArray("messages", messages);
  
  saveJSONObject(json, "export/exp~~~"+
                       (String)cp5.get(Textfield.class,"cp5_rollname").getText()+"~~~"+
                       hour()+minute()+second()+millis()+".json");
}
void loadJSON (String filename) {
  canvas.startCycle = 0;
  
  JSONObject json = loadJSONObject(filename);
  
  timeCoefficient = json.getFloat("speed");
  canvas.cycleResolution = int(json.getFloat("resolution"));
  canvas.numberOfCycles = int(json.getFloat("end"));
  //json.getFloat("start");
  //json.getFloat("loop");
  
  
  JSONArray msgs = json.getJSONArray("messages");
  for (int i = 0; i < msgs.size(); i++) {
    Message m = new Message();
    JSONObject msg = msgs.getJSONObject(i);
    
    m.s = msg.getString("s");
    m.n = msg.getInt("n");
    m.orbit = msg.getInt("orbit");
    m.t_index = msg.getInt("t_index");
    //m.time = msg.getFloat("time");
    m.cps = msg.getFloat("cps");
    m.delta = msg.getFloat("delta");
    m.cycle = msg.getFloat("cycle");
    
    // fields
    String fields = msg.getString("fields");
    if (fields != null && !fields.equals("")) {
      String[] s = fields.split(",");
      for(int j=0; j < s.length; j+=2) {
        m.addField(s[j], parseFloat(s[j+1]));
      }
    }
    m.assignUpdate(m.s, m.n, m.cycle);
    canvas.addNote(m.s, m.n, m);
  }
}

//// Audio functions
//static public float mtof(float m) {
//  return 8.175799f * (float)pow(2.0f, m / 12.0f);
//}
//static public float ftom(float f){
//  return 12.0f * log(f / (float)8.175799);
//}
//static public float dbtoa(float db) {
//  return 1.0f * pow(10.0f, db / 20.0f);
//}
//public float atodb(float a) {
//  return 20.0f * log10(a / 1.0f);
//}

//// Float indexing
//static float getFloatIndex(float arr[], float index) {
//  int lo = floor(index);
//  int hi = lo+1;
//  float t = index % 1.0;
//  if(lo >= 0 && hi < arr.length) {
//    return arr[lo]*(1-t) + arr[hi]*t;
//  }
//  return 0;
//}