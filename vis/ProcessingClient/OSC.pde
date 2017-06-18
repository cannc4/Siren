import oscP5.*;
OscP5 oscP5;

String message = "";

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage m)
{
  m.print();
  
  // element retrieval example
  if(getName(m).equals("/unity_osc")){
    if (m.checkTypetag("fsffff"))
    {
      float val0 = m.get(0).floatValue();
      String val1 = m.get(1).stringValue();
      float val2 = m.get(2).floatValue();
      float val3 = m.get(3).floatValue();
      float val4 = m.get(4).floatValue();
      float val5 = m.get(5).floatValue();

      message = "UNITY " +
                str(val0) + " " + 
                val1 + " " + 
                str(val2) + " " + 
                str(val3) + " " + 
                str(val4) + " " + 
                str(val5) + " ";
    }
    else{
      message = "not fsffff";
    }
  }
  else if(getName(m).equals("/processing_osc")){
    if (m.checkTypetag("fsffff"))
    {
      float val0 = m.get(0).floatValue();
      String val1 = m.get(1).stringValue();
      float val2 = m.get(2).floatValue();
      float val3 = m.get(3).floatValue();
      float val4 = m.get(4).floatValue();
      float val5 = m.get(5).floatValue();

      message = "PROCESSING " + 
                str(val0) + " " + 
                val1 + " " + 
                str(val2) + " " + 
                str(val3) + " " + 
                str(val4) + " " + 
                str(val5) + " ";
    }
    else{
      message = "not fsffff";
    }
  }
  else{
    message = "not /unity_osc";
  }
}

String getName(OscMessage m) {
  String s = "";
  for (int i = 0; i < m.getAddrPatternAsBytes().length; i++) {
    if ((char) m.getAddrPatternAsBytes()[i] != 0)
      s += (char) m.getAddrPatternAsBytes()[i];
  }
  return s;
}