public class PianoRoll {
  public ArrayList<SampleContainer> sampleList;
  
  public String name = "";
  
  public int numberOfCycles = 8;
  public int cycleResolution = 12;
  
  public int numberOfSamples = 0;
  
  public int maxTime = numberOfCycles*1000;
  public int startCycle = -1;
  
  public PianoRoll() {
    this.sampleList = new ArrayList<SampleContainer>();
    
    // creates a default random name for the scene
    int randomLength = int(random(3, 6));
    for(int i = 0; i < randomLength; i++) {
      name += (char)random(97, 122);
    }
  }
  public ArrayList<Message> getMessagesAt(int x) {
    ArrayList<Message> _msg = new ArrayList<Message>();
    for(SampleContainer s : sampleList) {
      for(NoteContainer n : s.notes) {
        Message _m = n.getMessageAt(x);
        if(_m != null) _msg.add(_m);
      }
    }
    return _msg;
  }

  public void restructureMessages() {
    for(SampleContainer s : sampleList) {
      for(NoteContainer n : s.notes) {
        for(Message m : n.messages) {
          m.assignUpdate(m.s, m.n, m.cycle);
        }  
      }
    }
    renewGrid = true;
  }
  public void addNote (String s, int n, Message m) {   
    SampleContainer _sample = isExist(s);
    
    if(_sample != null) {
      if(m == null) _sample.addNote(n);
      else          _sample.addNote(n,m);
    } 
    else {
      this.sampleList.add(new SampleContainer(s, n));
      this.sampleList.sort(new Comparator<SampleContainer>() {
          @Override
          public int compare(SampleContainer one, SampleContainer other) {
            return one.s.compareTo(other.s);
          }
      });
      renewGrid = true;
      this.numberOfSamples++;
    }
  }
  public Message getNote(int s_i, int n_i, int t_i) {
    NoteContainer n = sampleList.get(s_i).notes.get(n_i);
    for(Message m : n.messages) {
      if(m.t_index == t_i) {
        return m;
      }
    }
    return null;
  }
  public void removeNote(int s_i, int n_i, int t_i) {
    NoteContainer n = sampleList.get(s_i).notes.get(n_i);
    for(Message m : n.messages) {
      if(m.t_index == t_i) {
        n.messages.remove(m);
        break;
      }
    }
  }
  
  public void nuke(int cycleNumber) {
    sampleList.clear();
    numberOfSamples = 0;
    renewGrid = true;
    startCycle = cycleNumber;
  }
  
  public SampleContainer isExist(String s) {
    for(SampleContainer sample : sampleList) {
      if(s.equalsIgnoreCase(sample.s)){
        return sample;
      }
    }
    return null;
  }
}

public class SampleContainer {
  public ArrayList<NoteContainer> notes;
  public String s;
  
  public SampleContainer (String s, int n) {
    this.s = s;
    this.notes = new ArrayList<NoteContainer>();
    this.notes.add(new NoteContainer(s, n));
  }
  
  public void addNote(int n) {   
    NoteContainer _node = isExist(n);
    if(_node == null)
      notes.add(new NoteContainer(s, n));
  }
  public void addNote (int n, Message m) {   
    NoteContainer _node = isExist(n);
    if(_node != null)
      _node.messages.add(m);
    else
      notes.add(new NoteContainer(s, n, m));
  }
  public NoteContainer isExist (int n) {
    for(NoteContainer node : notes)
      if(node.n == n && s.equalsIgnoreCase(node.s)) return node;
    return null;
  }
}

public class NoteContainer {
  public String s = "";
  public int n = 0; 
  public ArrayList<Message> messages;
  
  public NoteContainer (String s, int n) {
    this.s = s; 
    this.n = n;
    this.messages = new ArrayList<Message>();
  }
  public NoteContainer (String s, int n, Message m) {
    this.s = s; 
    this.n = n;
    this.messages = new ArrayList<Message>();
    this.messages.add(m);
  }
  public Message getMessageAt(int x) {
    for(Message m : messages)
      if(m.t_index == x)
        return m;
    return null;
  }
}

public class Message {
  public float time = 0;
  public float cps = 1;
  public float cycle = 0;
  public float delta = 0;
  public String s = "";
  public int n = 1;
  public int orbit = 0;
  
  public int t_index = 0;
  public HashMap<String, Float> fields = new HashMap(); 
  
  public Message() {}  
  public boolean addField(String key, float value) {
    if(!fields.containsKey(key)) {
      fields.put(key, value);
      return true;
    }
    return false;
  }
  public void assignUpdate(String s, int n, float c) {
    this.s = s;
    this.n = n;
    this.cycle = c;
    this.t_index = icmap(c, 
                         canvas.startCycle, canvas.startCycle+canvas.numberOfCycles, 
                         0, canvas.numberOfCycles*canvas.cycleResolution);
  }
  
  public String toString() {
    return s+":"+n+" "+cycle+" "+time+" "+orbit + " " + fields.toString();
  }
}

// 'latency', 'cps', 'sound', 'offset', 'begin', 'end', 'speed', 
// 'pan', 'velocity', 'vowel', 'cutoff', 'resonance', 'accelerate', 
// 'shape', 'krio', 'gain', 'cut', 'delay', 'delaytime', 
// 'delayfeedback', 'crush', 'coarse', 'hcutoff', 'hresonance', 'bandqf', 'bandq', 'unit' ]

//orbit, cycle, s, n
//sound
// begin
// end

// legato
// sustain

//length
//accelerate
//cps
//unit
//loop
// delta
//amp
//gain
//channel
//pan
//note
//freq
//midinote
//octave
//latency
//lag
//offset
// cut