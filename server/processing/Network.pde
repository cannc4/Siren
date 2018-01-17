import netP5.*;
import oscP5.*;

OscP5 oscP5;
NetAddress myRemoteLocation;

void initNetwork() {
  oscP5 = new OscP5(this, 3007);
  myRemoteLocation = new NetAddress("127.0.0.1", 57120);
}

void oscEvent(OscMessage theOscMessage) {
  if(theOscMessage.checkAddrPattern("/siren")) {
    if(theOscMessage.checkTypetag("s")) {
      String[] splitMessage = split(theOscMessage.get(0).stringValue(), ',');
      
      Message m = new Message();
      m.time = float(splitMessage[0]);
      for(int i = 1; i < splitMessage.length; i+=2) {
        switch(splitMessage[i]) {
          case "s":
            m.s = splitMessage[i+1];            
            break;
          case "n":
            m.n = int(splitMessage[i+1]);
            break;
          case "cycle":
            m.cycle = float(splitMessage[i+1]);
            break;
          case "cps":
            m.cps = int(splitMessage[i+1]);
            break;  
          case "orbit":
            m.orbit = int(splitMessage[i+1]);
            break;
          case "delta":
            m.delta = float(splitMessage[i+1]);
            break;
          default:
            m.addField(splitMessage[i], float(splitMessage[i+1]));
            break;
        }
      }
      
      // Reset
      if(m.cycle > canvas.startCycle + canvas.numberOfCycles || canvas.startCycle < 0) {
        canvas.nuke(int(m.cycle)+1);  
      }
      
      // Keep sample
      m.assignUpdate(m.s, m.n, m.cycle);
      canvas.addNote(m.s, m.n, m); 
     
      return;
    }  
  }
}

// Sends message to SC
void sendSCMessage(Message m) {
   OscMessage myMessage = new OscMessage("/play2");
   myMessage.add("cycle");
   myMessage.add(m.cycle);
   myMessage.add("delta");
   myMessage.add(m.delta);
   myMessage.add("cps");
   myMessage.add(m.cps);
   myMessage.add("s");
   myMessage.add(m.s);
   myMessage.add("n");
   myMessage.add(m.n);
   myMessage.add("orbit");
   myMessage.add(m.orbit);
   for(Map.Entry f : m.fields.entrySet()){
     myMessage.add((String)f.getKey());
     myMessage.add((float)f.getValue());
   }
   oscP5.send(myMessage, myRemoteLocation); 
}