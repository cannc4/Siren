import oscP5.*;
OscP5 oscP5;

// global filter toggles
boolean isshake = false;
boolean isrgbShift = false;
boolean ishueSaturation = false;
boolean isbrightContrast = false;
boolean isfxaa = false;
boolean isbarrelBlur = false;
boolean isglow = false;
boolean ishalftone = false;
boolean ispixelate = false;
boolean ispixelRolls = false;
boolean ispatches = false;
boolean isedge = false;
boolean ismirror = false;

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage m)
{
  // sendOSC `channel` $ Message "global" [string "global", Float 1]
  if (getName(m).equals("global")) {
    if (m.checkTypetag("sf"))
    {
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg) {
      case "glitch":
        glitchLasttime = millis();
        glitchTime = val;
        break;
      case "strobe":
        strobeLasttime = millis();
        strobeTime = val;
        break;
      case "randMask":
        randomMaskLasttime = millis();
        randomMaskTime = val;
        orientation = random(-1, 1);
        rand_x = random(1);
        rand_width = random(1);
        rand_y = random(1);
        rand_height = random(1);
        break;
      case "preset":
        presetNumber = int(val);
        break;
      case "shake":
        isshake = !isshake;
        if (isshake) toggledFilters.add(shake);
        else toggledFilters.remove(shake);
        break;
      case "rgbShift":
        isrgbShift = !isrgbShift;
        if (isrgbShift) toggledFilters.add(rgbShift);
        else toggledFilters.remove(rgbShift);
        break;
      case "hueSaturation":
        ishueSaturation = !ishueSaturation;
        if (ishueSaturation) toggledFilters.add(hueSaturation);
        else toggledFilters.remove(hueSaturation);
        break;
      case "brightContrast":
        isbrightContrast = !isbrightContrast;
        if (isbrightContrast) toggledFilters.add(brightContrast);
        else toggledFilters.remove(brightContrast);
        break;
      case "barrelBlur":
        isbarrelBlur = !isbarrelBlur;
        if (isbarrelBlur) toggledFilters.add(barrelBlur);
        else toggledFilters.remove(barrelBlur);
        break;
      case "glow":
        isglow = !isglow;
        if (isglow) toggledFilters.add(glow);
        else toggledFilters.remove(glow);
        break;
      case "halftone":
        ishalftone = !ishalftone;
        if (ishalftone) toggledFilters.add(halftone);
        else toggledFilters.remove(halftone);
        break;
      case "pixelate":
        ispixelate = !ispixelate;
        if (ispixelate) toggledFilters.add(pixelate);
        else toggledFilters.remove(pixelate);
        break;
      case "pixelRolls":
        ispixelRolls = !ispixelRolls;
        if (ispixelRolls) toggledFilters.add(pixelRolls);
        else toggledFilters.remove(pixelRolls);
        break;
      case "patches":
        ispatches = !ispatches;
        if (ispatches) toggledFilters.add(patches);
        else toggledFilters.remove(patches);
        break;
      case "edge":
        isedge = !isedge;
        if (isedge) toggledFilters.add(edge);
        else toggledFilters.remove(edge);
        break;
      case "mirror":
        ismirror = !ismirror;
        if (ismirror) toggledFilters.add(mirror);
        else toggledFilters.remove(mirror);
        break;
      default:
        break;
      }
    }
  } else if (getName(m).equals("object")) {
    if (m.checkTypetag("sf"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      switch(arg) {
      case "shaders":
        shaderNumber = (int)val;
        break;
      default:
        break;
      }
    }
  } else if (getName(m).equals("tree")) {
    println(m.get(1).stringValue());
    if (m.checkTypetag("ss"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      String val = m.get(1).stringValue();


      println("==tree OSC== \nname:"+arg+" value: "+val);
    }
  }
  else // per filter modification
  {
    // sendOSC `channel` $ Message "FilterName" [string "AttrName", Float AttrValue]

    // Instant modification
    if (m.checkTypetag("sf"))
    {
      // get attr name and value
      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();

      // Get filter index
      int index = -1;
      for (int i = 0; i < filterNames.size(); ++i) {
        if (filterNames.get(i).equals(getName(m))) {
          index = i;
        }
      }

      if (index >= 0) {
        filters.get(index).set(arg, val);
      }
    }
    // Delayed modification
    else if (m.checkTypetag("sff")){

      String arg = m.get(0).stringValue();
      float val = m.get(1).floatValue();
      float dur = m.get(2).floatValue();

      // Get filter index
      int index = -1;
      for (int i = 0; i < filterNames.size(); ++i) {
        if (filterNames.get(i).equals(getName(m))) {
          index = i;
        }
      }

      if (index >= 0) {
        filters.get(index).set(arg, val, (long)dur);
      }
    }
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
