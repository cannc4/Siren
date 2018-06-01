import { GLSL, Shaders } from "gl-react";

export const shaders = Shaders.create({
  lines: {
    frag: GLSL`
    precision highp float;

    uniform sampler2D texture;
    varying vec2 uv;

    uniform float lineStrength;
    uniform float lineSize;
    uniform float lineTilt;

    void main() {
      vec2 vUv = uv.st;

      vec4 col = texture2D(texture, vUv);
      col += sin(vUv.x*lineSize*(1.0-lineTilt)+
                 vUv.y*lineSize*lineTilt)*lineStrength;

      gl_FragColor = col;
    }
    `
  },
  barrelBlur: {
    frag: GLSL`
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform float time;
    uniform float amount;

    const int num_iter = 16;
    const float reci_num_iter_f = 1.0 / float(num_iter);
    const float GAMMA = 2.2;
    const float MAX_DIST_PX = 200.0;

    float sat( float t ) {
      return clamp( t, 0.0, 1.0 );
    }

    float linterp( float t ) {
      return sat( 1.0 - abs( 2.0*t - 1.0 ) );
    }

    float remap( float t, float a, float b ) {
      return sat( (t - a) / (b - a) );
    }

    vec3 spectrum_offset( float t ) {
      vec3 ret;
      float lo = step(t,0.5);
      float hi = 1.0-lo;
      float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
      ret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);

      return pow( ret, vec3(1.0/2.2) );
    }

    float nrand( vec2 n ) {
      return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
    }

    vec3 lin2srgb( vec3 c ) {
      return pow( c, vec3(GAMMA) );
    }

    vec3 srgb2lin( vec3 c ) {
      return pow( c, vec3(1.0/GAMMA));
    }

    vec2 barrelDistortion( vec2 p, vec2 amt )
    {
      p = 2.0*p-1.0;
      //float BarrelPower = 1.125;
      const float maxBarrelPower = 3.0;
      float theta  = atan(p.y, p.x);
      float radius = length(p);
      radius = pow(radius, 1.0 + maxBarrelPower * amt.x);
      p.x = radius * cos(theta);
      p.y = radius * sin(theta);
      return 0.5 * ( p + 1.0 );
    }

    void main(void) {
      vec2 uv = uv.st;
      vec2 max_distort = vec2(amount);

      vec2 oversiz = barrelDistortion( vec2(1,1), max_distort );
      uv = 2.0 * uv - 1.0;
      uv = uv / (oversiz*oversiz);
      uv = 0.5 * uv + 0.5;

      vec3 sumcol = vec3(0.0);
      vec3 sumw = vec3(0.0);
      float rnd = nrand( uv + fract(time) );
      for ( int i=0; i<num_iter;++i ){
        float t = (float(i)+rnd) * reci_num_iter_f;
        vec3 w = spectrum_offset( t );
        sumw += w;
        sumcol += w * srgb2lin(texture2D( texture, barrelDistortion(uv, max_distort*t ) ).rgb);
      }

      sumcol.rgb /= sumw;
      vec3 outcol = lin2srgb(sumcol.rgb);
      outcol += rnd/255.0;
      gl_FragColor = vec4( outcol, 1.0);
    }
    `
  },
  brightnessContrast: {
    frag: GLSL`
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform float brightness;
    uniform float contrast;

    void main(void) {
      vec3 texColor = texture2D(texture, uv.st).rgb;

      const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
      vec3 AvgLumin = vec3(0.5, 0.5, 0.5);
      vec3 intensity = vec3(dot(texColor, LumCoeff));

      vec3 satColor = mix(intensity, texColor, 0.0);
      vec3 conColor = mix(AvgLumin, satColor, contrast);

      gl_FragColor = vec4(brightness * conColor, 1.0);
    }`
  },
  edge: {
      frag: GLSL`
      precision mediump float;

      varying vec2 uv;
      uniform sampler2D texture;

      void main(void) {
        vec2 texOffset = vec2(0.001,0.001);
        vec2 tc0 = uv.st + vec2(-texOffset.s, -texOffset.t);
        vec2 tc1 = uv.st + vec2(         0.0, -texOffset.t);
        vec2 tc2 = uv.st + vec2(+texOffset.s, -texOffset.t);
        vec2 tc3 = uv.st + vec2(-texOffset.s,          0.0);
        vec2 tc4 = uv.st + vec2(         0.0,          0.0);
        vec2 tc5 = uv.st + vec2(+texOffset.s,          0.0);
        vec2 tc6 = uv.st + vec2(-texOffset.s, +texOffset.t);
        vec2 tc7 = uv.st + vec2(         0.0, +texOffset.t);
        vec2 tc8 = uv.st + vec2(+texOffset.s, +texOffset.t);

        vec4 col0 = texture2D(texture, tc0);
        vec4 col1 = texture2D(texture, tc1);
        vec4 col2 = texture2D(texture, tc2);
        vec4 col3 = texture2D(texture, tc3);
        vec4 col4 = texture2D(texture, tc4);
        vec4 col5 = texture2D(texture, tc5);
        vec4 col6 = texture2D(texture, tc6);
        vec4 col7 = texture2D(texture, tc7);
        vec4 col8 = texture2D(texture, tc8);

        vec4 sum = 8.0 * col4 - (col0 + col1 + col2 + col3 + col5 + col6 + col7 + col8);
        gl_FragColor = vec4(sum.rgb, 1.0);
      }
      `
  },
  glow: {
    frag: GLSL `
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform float brightness;
    const int radius = 2;

    void main(void) {
    	  int i = 0;
    	  int j = 0;
    	  vec4 sum = vec4(0.0);
        vec2 texOffset = vec2(0.001,0.001);

    	  for( int i= -radius; i<radius; i++) {
      		for( int j= -radius; j<radius; j++) {
      			sum += texture2D( texture, uv.st + vec2(j,i)*texOffset.st)*brightness;
      		}
    	  }

    	  gl_FragColor = sum*sum+ vec4(texture2D( texture, uv.st).rgb, 1.0);
    }
    `
  },
  shake: {
      frag: GLSL`
      precision mediump float;

      varying vec2 uv;
      uniform sampler2D texture;

      uniform float time;
      uniform float amount;

      float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main(void) {
          vec2 p = uv.st;

          vec2 offset = vec2((rand(vec2(time,time)) - 0.5)*amount, (rand(vec2(time + 999.0,time + 999.0))- 0.5) *amount);
          p += offset;
          gl_FragColor = texture2D(texture, p);
      }
      `
  },
  rgbShift: {
      frag: GLSL`
      precision mediump float;

      varying vec2 uv;
      uniform sampler2D texture;

      uniform float amount;
      uniform float angle;

      void main(void) {
          vec2 vUv = uv.st;

          vec2 offset = amount * vec2( cos(angle), sin(angle));
          vec4 cr = texture2D(texture, vUv + offset);
          vec4 cga = texture2D(texture, vUv);
          vec4 cb = texture2D(texture, vUv - offset);

          gl_FragColor = vec4(cr.r, cga.g, cb.b, 1.0);
      }
      `
  },
  halftone: {
    frag: GLSL`
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform int pixelsPerRow;

    void main(void) {
      vec2 p = uv.st;
      float pixelSize = 1.0 / float(pixelsPerRow);

      float dx = mod(p.x, pixelSize) - pixelSize*0.5;
      float dy = mod(p.y, pixelSize) - pixelSize*0.5;

      p.x -= dx;
      p.y -= dy;
      vec3 col = texture2D(texture, p).rgb;
      float bright = 0.3333*(col.r+col.g+col.b);

      float dist = sqrt(dx*dx + dy*dy);
      float rad = bright * pixelSize * 0.8;
      float m = step(dist, rad);

      vec3 col2 = mix(vec3(0.0), vec3(1.0), m);
      gl_FragColor = vec4(col2, 1.0);

    }

    `
  },
  mirror: {
    frag: GLSL`
      precision mediump float;

      varying vec2 uv;
      uniform sampler2D texture;

      uniform float dir;

      void main(void) {
        vec2 vUv = uv.st;

        vec4 color = texture2D(texture, vUv);
        if(vUv.x  > .5 && dir <= 0.){
          color = texture2D(texture, vec2(1.-vUv.x, vUv.y));
        }
        else if(vUv.y > .5 && dir > 0.){
          color = texture2D(texture, vec2(vUv.x, 1.-vUv.y));
        }
        gl_FragColor = color;
      }
    `
  },
  patches: {
    frag: GLSL`
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform float row;
    uniform float col;

    void main(void) {
      vec2 p1 = vec2(uv.x, row);
      vec2 p2 = vec2(col, uv.y);

      float r = texture2D(texture, p1).r * texture2D(texture, p2).r;
      float g = texture2D(texture, p1).g * texture2D(texture, p2).g;
      float b = texture2D(texture, p1).b * texture2D(texture, p2).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
    `
  },
  pixelate: {
    frag: GLSL`

    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;

    uniform vec2 pixels;

    void main(void) {
      vec2 p = uv.st;

      p.x -= mod(p.x, 1.0 / pixels.x);
      p.y -= mod(p.y, 1.0 / pixels.y);

      gl_FragColor = vec4(texture2D(texture, p).rgb, 1.0);
    }
    `
  },
  rolls: {
    frag: GLSL`
    precision mediump float;

    varying vec2 uv;
    uniform sampler2D texture;
    uniform float time;

    uniform vec2 pixels;
    uniform float rollRate;
    uniform float rollAmount;

    void main(void) {
    	vec2 p = uv.st;
    	p.x -= mod(p.x, 1.0 / pixels.x);
    	p.y -= mod(p.y, 1.0 / pixels.y);
    	p.y = mod(p.y + rollAmount * sin(rollRate * time * p.x + p.x), 1.0);
    	gl_FragColor = texture2D(texture, p);
    }

    `
  },
  marchGL: {
      frag: GLSL`
      #define AO_STEPS 2
      #define SS_STEPS 32
      #define FAR 30.

      precision mediump float;

      uniform vec2 res;
      uniform float time;

      // channel-wise evolution matrix (hard coded)
      uniform mat4 evolutions[4];

      // current sample name in ascii
      uniform float nameAscii[5];

      // the active scene id
      uniform int activeSceneId;

      const int MAX_MARCHING_STEPS = 255;
      const float MIN_DIST = 0.0;
      const float MAX_DIST = 100.0;
      const float EPSILON = 0.0001;

      const vec3 LIGHT = vec3(4.0, 2.0, 4.0);

      vec3 foregroundColor = vec3(1., 1., 1.);
      vec3 backgroundColor = vec3(0.1, 0.1, 0.1);

      // Supershape globals
      vec4 S1, S2;

      vec4 SetupSupershape(float t)
      {
          t = mod(t, 10.0);
          if (t < 1.0)      return vec4(3.0, 0.5, 1.7, 1.7);
          else if (t < 2.0) return vec4(2.6, 11.2, 1.5, 8.982);
          else if (t < 3.0) return vec4(2.0, 7.3, 5.01, 2.2);
          else if (t < 4.0) return vec4(4.0, 2.4, 4.2, 1.2);
          else if (t < 5.0) return vec4(3.6, 2.4, 1.2, 5.45);
          else if (t < 6.0) return vec4(2.0, 2.3, 2.0, 2.2);
          else if (t < 7.0) return vec4(5.1, 11.5, 1.51, 2.0);
          else if (t < 8.0) return vec4(4.75, 2.0, 6.0, 3.45);
          else if (t < 9.0) return vec4(3.0, 4.5, 10.0, -1.74);
          else              return vec4(2., 10., 10., 10.);
      }
      vec3 SetupCamera(float t)
      {
          t = mod(t, 10.0);
          if (t < 1.0)      return vec3(8.0, 2.0, 7.0);
          else if (t < 2.0) return vec3(11.2, 1.5, 4.982);
          else if (t < 3.0) return vec3(10.0, 10.0, 10.0);
          else if (t < 4.0) return vec3(6.4, 15.2, 11.2);
          else if (t < 5.0) return vec3(-8.2, 1.2, 9.2);
          else if (t < 6.0) return vec3(-6.4, -2.3, 10.2);
          else if (t < 7.0) return vec3(-9, 1.2, -9.74);
          else if (t < 8.0) return vec3(6.4, 2.3, -10.9);
          else if (t < 9.0) return vec3(12.4, 5.13, 5.5);
          else              return vec3(9.4, 3.5, 9.2);
      }

      // ---------------------------- //
      //          NOISE FROM Xyptonjtroz
      // ---------------------------- //
      float tri(in float x){return abs(fract(x)-.5);}
      vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}
      mat2 m2 = mat2(0.970,  0.242, -0.242,  0.970);
      float triNoise3d(in vec3 p, in float spd) {
        float z = 1.4;
        float rz = 0.;
        vec3 bp = p;
      	for (float i=0.; i<=3.; i++ )
      	{
          vec3 dg = tri3(bp*2.);
          p += (dg+time*spd);

          bp *= 1.8;
      		z *= 1.5;
      		p *= 1.2;

          rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
          bp += 0.14;
      	}
      	return rz;
      }
      float bnoise(in vec3 p) {
          float n = sin(triNoise3d(p*.3,0.0)*11.)*0.6+0.4;
          n += sin(triNoise3d(p*1.,0.05)*40.)*0.1+0.9;
          return (n*n)*0.003;
      }

      // ---------------------------- //
      //          UTILITY
      // ---------------------------- //
      float map(float value,  float istart,  float iend,  float ostart,  float oend) {
          return clamp( ((value-istart) / (iend-istart) * (oend-ostart) ) + ostart, ostart, oend);
      }
      vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
          vec2 xy = fragCoord - size / 2.0;
          float z = size.y / tan(radians(fieldOfView) / 2.0);
          return normalize(vec3(xy, -z));
      }
      vec2 hash22(vec2 p) {
      	p  = fract(p * vec2(5.3983, 5.4427));
        p += dot(p.yx, p.xy +  vec2(21.5351, 14.3137));
      	return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
      }

      // ---------------------------- //
      //          MODELVIEW
      // ---------------------------- //
      mat3 rotateX(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat3(
              vec3(1, 0, 0),
              vec3(0, c, -s),
              vec3(0, s, c)
          );
      }
      mat3 rotateY(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat3(
              vec3(c, 0, s),
              vec3(0, 1, 0),
              vec3(-s, 0, c)
          );
      }
      mat3 rotateZ(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat3(
              vec3(c, -s, 0),
              vec3(s, c, 0),
              vec3(0, 0, 1)
          );
      }

      mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
          vec3 f = normalize(center - eye);
          vec3 s = normalize(cross(f, up));
          vec3 u = cross(s, f);
          return mat3(s, u, -f);
      }

      // ---------------------------- //
      //          OPERATIONS
      // ---------------------------- //
      float intersect(float distA, float distB) {
          return max(distA, distB);
      }
      float unite(float distA, float distB) {
          return min(distA, distB);
      }
      float blend( float a, float b) {
          float k = 0.7 + sin(time)*0.253;
          float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
          return mix( b, a, h ) - k*h*(1.0-h);
      }
      float difference(float distA, float distB) {
          return max(distA, -distB);
      }
      // return vector needs to used with a primitive
      vec3 repeat(vec3 p, vec3 c) {
          return mod(p, c) - 0.5 * c;
      }

      // ---------------------------- //
      //      PRIMITIVE SHAPES
      // ---------------------------- //
      float sphere(vec3 p, float r) {
          return length(p) - r;
      }
      float box(vec3 p, vec3 size) {
          vec3 d = abs(p) - (size / 2.0);

          // inside distance + outside distance
          return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
      }
      float cylinder(vec3 p, float h, float r) {
          float inOutRadius = length(p.xy) - r;
          float inOutHeight = abs(p.z) - h/2.0;
          float insideDistance = min(max(inOutRadius, inOutHeight), 0.0);
          float outsideDistance = length(max(vec2(inOutRadius, inOutHeight), 0.0));
          return insideDistance + outsideDistance;
      }
      // from Xyptonjtroz
      float height(vec2 p) {
        p *= 0.2;
        return sin(p.y)*0.4 + sin(p.x)*0.4;
      }
      float vine(vec3 p, in float c, in float h) {
          p.y += sin(p.z*0.2625)*2.5;
          p.x += cos(p.z*0.1575)*3.;
          vec2 q = vec2(mod(p.x, c)-c/2., p.y);
          return length(q) - h -sin(p.z*2.+sin(p.x*7.)*0.5+time*0.5)*0.13;
      }
      float plane(vec3 p) {
        p.y += height(p.zx);

        vec3 bp = p;
        vec2 hs = hash22(floor(p.zx/4.));
        p.zx = mod(p.zx, 4.) - 2.;

        float d = p.y+0.5;
        p.y -= hs.x*0.4 - 0.15;
        p.zx += hs*1.34;
        d = blend(d, sphere(p - (hs.y * evolutions[0][0].x), hs.x*0.4));

        d = blend(d, vine(bp+vec3(1.8,0.,0), 30.,.8) );
        d = blend(d, vine(bp.zyx+vec3(0.,0,17.), 40.,0.75) );
        return d;
      }

      // ---------------------------- //
      //          SUPERSHAPE
      // ---------------------------- //
      float superformula( float phi, float a, float b, float m, float n1, float n2, float n3) {
          return pow((pow(abs(cos(m * phi / 4.0) / a), n2) + pow(abs(sin(m * phi / 4.0) / b), n3)), -(1.0 / n1));
      }
      float supershape3d( vec3 p) {
          float d = length(p);

          //the sine of rho (the angle between z and xy)
          float sn = p.z / d;

          //the angles to feed the formula
          float phi = atan(p.y, p.x);
          float rho = asin(sn);

          float r1 = superformula(phi, 1.0 + EPSILON, 1.0,
            S1.x + evolutions[0][2][1] * 10.,         // begin 0 / 1
            S1.y + evolutions[0][2][3] * 10.,         // end   0 / 1
            S1.z + evolutions[0][2][3] * 10.,         // hall  0 / 1
            S1.w + evolutions[0][3][0] * 10.);         // shape 0 / 1
          float r2 = superformula(rho, 1.0, 1.0,
            S2.x + evolutions[0][1][0],             // coarse 1 / 64
            S2.y + evolutions[0][1][1] * 5.,        // speed -10 / 10
            S2.z + evolutions[0][1][2] * 10.,       // gain   0 / 1
            S2.w + evolutions[0][1][3] * 10.);      // sustain 0 / 1

          //same as above but optimized a bit
          d -= r2 * sqrt(r1 * r1 * (1.0 - sn * sn) + sn * sn);

          return d;
      }
      float supershape( vec3 p, vec3 rd) {
          float d = supershape3d(p), s = d * 0.5;
          float dr = (d - supershape3d(p + rd * s)) / s;
          return d / (1.0 + max(dr, 0.0));
      }

      // ---------------------------- //
      //          THE SCENE
      // ---------------------------- //
      float scene(vec3 p, vec3 rd) {
          // p = rotateY(time / 2.0) * p;

          // goes to 0 as it goes to silence
          float inv_delta = (1. - evolutions[0][0].x);

          float tim = time * (0.05 * inv_delta);
          S1 = mix(SetupSupershape(tim - 1.0), SetupSupershape(tim), smoothstep(0.0, 1.0, fract(tim)));
          tim = tim * (0.09 * inv_delta) + 2.5;
          S2 = mix(SetupSupershape(tim - 1.0), SetupSupershape(tim), smoothstep(0.0, 1.0, fract(tim)));

          return supershape(p + vec3(map(evolutions[0][0][1], 0., 1., -3.28, 3.28), 0., 0.), rd);
      }


      // ---------------------------- //
      //          DISTANCE
      // ---------------------------- //
      float shortestDistanceToSurface(vec3 p, vec3 rd, float start, float end) {
          float depth = start;
          for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
              float dist = scene(p + depth * rd, rd);
              if (dist < EPSILON) {
                  return depth;
              }
              depth += dist;
              if (depth >= end) {
                  return end;
              }
          }
          return end;
      }
      vec3 estimateNormal(vec3 p, vec3 rd) {
          return normalize(vec3(
              scene(vec3(p.x + EPSILON, p.y, p.z), rd) - scene(vec3(p.x - EPSILON, p.y, p.z),rd),
              scene(vec3(p.x, p.y + EPSILON, p.z), rd) - scene(vec3(p.x, p.y - EPSILON, p.z),rd),
              scene(vec3(p.x, p.y, p.z + EPSILON), rd) - scene(vec3(p.x, p.y, p.z - EPSILON),rd)
          ));
      }

      // ---------------------------- //
      //          RENDER
      // ---------------------------- //
      float curv(vec3 p, float w, vec3 rd) {
          vec2 e = vec2(-1., 1.)*w;

          float t1 = scene(p + e.yxx, rd), t2 = scene(p + e.xxy, rd);
          float t3 = scene(p + e.xyx, rd), t4 = scene(p + e.yyy, rd);

          return .125/(e.x*e.x) *(t1 + t2 + t3 + t4 - 4. * scene(p, rd));
      }
      float calcSoftShadow(vec3 p, vec3 rd, float mint, float tmax) {
        float res = 1.0;
        float t = mint;
        for( int i=0; i<SS_STEPS; i++ )
        {
    		    float h = scene(p + rd*t, rd);
            res = min( res, 4.*h/t );
            t += clamp( h, 0.05, .5 );
            if(h<0.001 || t>tmax) break;
        }
        return clamp( res, 0.0, 1.0 );
      }
      vec3 render(vec3 p, vec3 rd) {
          vec3 lig = normalize(LIGHT),
               nor = estimateNormal(p, rd),
               ref = reflect(rd, nor);

          // Material color (based on scene ID
          if (activeSceneId == 0)
            foregroundColor = vec3(nor * .34 + .55);
          else if (activeSceneId == 1)
            foregroundColor = vec3(normalize(p) * .34 + .5);
          else if (activeSceneId == 2)
            foregroundColor = vec3(0.8, 0.3, 0.4);
          else if (activeSceneId == 3)
            foregroundColor = vec3(0.8, 0.7, 0.4);
          else if (activeSceneId == 4)
            foregroundColor = vec3(0.2, 0.33, 0.72);
          else
            foregroundColor = vec3(nor * .5 + .55);


          float crv = clamp(curv(p, .4, rd),.0,10.);
          float shd = calcSoftShadow(p,lig,0.1,3.);
          float dif = clamp( dot( nor, lig ), 0.0, 1.0 )*shd;
          float spe = pow(clamp( dot( reflect(rd,nor), lig ), 0.0, 1.0 ),50.)*shd;
          float fre = pow( clamp(1.0+dot(nor,rd),0.0,1.0), 1.5 );

          vec3 innerGlow = vec3(
            map(nameAscii[0], 97., 122., 0., 1.),
            map(nameAscii[1], 97., 122., 0., 1.),
            map(nameAscii[2], 97., 122., 0., 1.)
          );

          vec3 brdf = evolutions[1][2].xyz;//vec3(0.10,0.11,0.13);
          brdf += 1.5*dif*evolutions[1][0 ].xyz;//vec3(1.00,0.90,0.7);
          foregroundColor = mix(foregroundColor, innerGlow, p.y*.5)*0.2+.1;
          foregroundColor *= (nor * sin(bnoise(p)*evolutions[1][0].z*200.)*0.2 + evolutions[1][0].x);
          foregroundColor = foregroundColor*brdf + foregroundColor*spe*.5 + fre*innerGlow*.3*crv;

          return foregroundColor;
      }

      void main ()
      {
          // setup camera
          // silence (0, 1) dense
          // float inv_delta = (1. - evolutions[2][0].x) * 0.5;

          float tim = time * (0.05);
          vec3 eye = mix(SetupCamera(tim - 1.0), SetupCamera(tim), smoothstep(0.0, 1.0, fract(tim)));

          vec3 viewDir = rayDirection(45.0, res.xy, gl_FragCoord.xy);
          mat3 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
          vec3 worldDir = viewToWorld * viewDir;

          float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

          if (dist > MAX_DIST - EPSILON) {
              // Didn't hit anything
              // vec3 outColor;
              // outColor.x = map(nameAscii[0], 97., 122., 0., 1.);
              // outColor.y = map(nameAscii[1], 97., 122., 0., 1.);
              // outColor.z = map(nameAscii[2], 97., 122., 0., 1.);

              gl_FragColor = vec4(backgroundColor, 1.);
              return;
          }

          // The closest point on the surface to the eyepoint along the view ray
          vec3 p = eye + dist * worldDir;

          // Render final color
          vec3 color = render(p, worldDir);

          //-----------------------------------------------------
        	// postprocessing
          //-----------------------------------------------------
          // gamma
        	color = pow( color, vec3(0.45) );

          // desat
          color = mix( color, vec3(dot(color,vec3(0.333))), 0.2 );

          // tint
        	color *= vec3( 1.0, 1.0, 1.0*0.9);

        	// vigneting
          vec2 q = gl_FragCoord.xy / res.xy;
          color *= 0.2 + 0.8*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.1 );

          // fade in
        	color *= smoothstep( 0.0, 2.0, time );

          gl_FragColor = vec4(color, 1.0);
      }
      `
  }
});
