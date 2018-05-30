import { GLSL, Shaders } from "gl-react";

export const shaders = Shaders.create({

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

      vec3 col = texture2D(texture, p).rgb;
      gl_FragColor = vec4(col, 1.0);
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
      #define AO_STEPS 4
      #define SS_STEPS 32

      precision highp float;

      uniform vec2 res;
      uniform float time;

      // channel-wise evolution matrix (hard coded)
      uniform mat4 evolutions[4];

      // rms values for each orbit (hard coded)
      // uniform float rmss[2];

      // sample name in ascii
      uniform float nameAscii[5];

      const int MAX_MARCHING_STEPS = 255;
      const float MIN_DIST = 0.0;
      const float MAX_DIST = 100.0;
      const float EPSILON = 0.001;

      ////////////////
      // Supershape globals
      vec4 S1, S2;

      vec4 Setup(float t)
      {
          t = mod(t, 8.0);
          if (t < 1.0)       return vec4(7.75, 15.0, 12.0, 16.0);
          else if (t < 2.0)  return vec4(-2.6, 11.2, 1.5, 8.982);
          else if (t < 3.0)  return vec4(5.6, 2.5, 6.1, 6.4);
          else if (t < 4.0)  return vec4(-1.0, 1.0, 6.0, 0.2);
          else if (t < 5.0) return vec4(3.6, 2.4, 1.2, 5.45);
          else if (t < 6.0) return vec4(2.0, 2.3, 2.0, 2.2);
          else if (t < 7.0) return vec4(5.1, 11.5, 1.51, 2.0);
          else                return vec4(3.0, 4.5, 10.0, -1.74);
      }
      ////////////////


      // ---------------------------- //
      //          UTILITY
      // ---------------------------- //
      float map(float value,  float istart,  float iend,  float ostart,  float oend) {
          return ( (value-istart) / (iend-istart) * (oend-ostart) ) + ostart;
      }
      vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
          vec2 xy = fragCoord - size / 2.0;
          float z = size.y / tan(radians(fieldOfView) / 2.0);
          return normalize(vec3(xy, -z));
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
          float k = 0.2; // might be parameter
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
      float plane(vec3 p) {
          return p.y;
      }
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
            S1.x + evolutions[0][1][3],
            S1.y + evolutions[0][2][0],
            S1.z + evolutions[0][2][1],
            S1.w + evolutions[0][2][2]);
          float r2 = superformula(rho, 1.0, 1.0,
            S2.x + evolutions[0][1][0],
            S2.y + evolutions[0][1][1],
            S2.z + evolutions[0][1][2],
            S2.w + evolutions[0][1][3]);

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
          // Slowly spin the whole scene
          // p = rotateY(time / 2.0) * p;

          // float cylinderRadius = 0.4 + (1.0 - 0.4) * (1.0) / 2.0;
          // float cylinder1 = cylinder(p, 2.0, cylinderRadius);
          // float cylinder2 = cylinder(rotateX(radians(90.0)) * p, 2.0, cylinderRadius);
          // float cylinder3 = cylinder(rotateY(radians(90.0)) * p, 2.0, cylinderRadius);
          //
          // float cube = box(p, vec3(1.8, 1.8, 1.8) );
          //
          // float sp = sphere(p, 1.2);
          //
          // float ballOffset = 0.4 + 1.0 + sin(1.7 * time);
          // float ballRadius = 0.3;
          // float balls = sphere(p - vec3(ballOffset, 0.0, 0.0), ballRadius);
          // balls = unite(balls, sphere(p + vec3(ballOffset, 0.0, 0.0), ballRadius));
          // balls = unite(balls, sphere(p - vec3(0.0, ballOffset, 0.0), ballRadius));
          // balls = unite(balls, sphere(p + vec3(0.0, ballOffset, 0.0), ballRadius));
          // balls = unite(balls, sphere(p - vec3(0.0, 0.0, ballOffset), ballRadius));
          // balls = unite(balls, sphere(p + vec3(0.0, 0.0, ballOffset), ballRadius));
          //
          // // float csgNut = difference(intersect(cube, sp),
          // //                     unite(cylinder1, unite(cylinder2, cylinder3)));
          // float csgNut = intersect(cube, sp);
          //
          // return unite(sphere(repeat(p + vec3(1.5, 0, 0), vec3(4.0)), 0.7), blend(balls, csgNut));


          ///////////////////////////
          // S1 = (evolutions[0][1].xyzw + vec4(0.24)) * (evolutions[0][0].y + 5.);
          // S2 = (evolutions[0][2].xyzw + vec4(evolutions[0][0].x)) * 10.;

          // S1 = (vec4 (1.) + vec4 (1.0)) * 2.2;
          // S2 = (vec4 (1., 0., 1., 0.) + vec4(0.5)) * 10.;

          // goes to 0
          float inv_delta = (1. - evolutions[0][0].x);

          float tim = time * (0.05) ;
          S1 = mix(Setup(tim - 1.0), Setup(tim), smoothstep(0.0, 1.0, fract(tim)));
          tim = tim * (0.09) + 2.5;
          S2 = mix(Setup(tim - 1.0), Setup(tim), smoothstep(0.0, 1.0, fract(tim)));


          return supershape(p, rd);
          // return blend(
          //   sphere(
          //     repeat(sin(20.*p) + vec3(evolutions[0][1].y, evolutions[0][2].z, evolutions[0][3].x), vec3(4.0)),
          //     0.3),
          //   blend(balls, cube));
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
      float calcAO( vec3 p, vec3 n, vec3 rd) {
          float occ = 0.0, sca = 1.0;
          for (int i = 0; i < AO_STEPS; i++) {
              float hr = 0.01 + 0.03 * float(i);
              vec3 aop = n * hr + p;
              float dd = scene(aop, rd);
              occ += -(dd - hr) * sca;
              sca *= 0.97;
          }
          return clamp(1. - 3. * occ, 0., 1.);
      }
      float calcSoftShadow(vec3 p, vec3 rd, float mint, float tmax, int samples) {
          float res = 1.0, t = mint, stepDist = (tmax - mint) / float(samples);
          for (int i = 0; i < SS_STEPS; i++) {
              float h = scene(p + rd * t, rd);
              res = min(res, 8.0 * h / t);
              t += clamp(h, stepDist, 1e10);
              if (h < mint || t > tmax) break;
          }
          return clamp(res, 0., 1.);
      }
      vec3 render(vec3 p, vec3 rd) {
          vec3 lig = normalize(vec3(4.0, 2.0, 4.0)),
               nor = estimateNormal(p, rd),
               ref = reflect(rd, nor);

          // Material color
          vec3 col = vec3(nor * .5 + .55);

          float dif = clamp(dot(nor, lig), 0., 1.),
              spe = pow(clamp(dot(reflect(-lig, nor), -rd), 0., 1.), 5.),
              fre = pow(clamp(1.0 + dot(nor, rd), 0., 1.), 5.),
              dom = smoothstep(-0.15, 0.15, ref.y),
              amb = 1.0,
              occ = calcAO(p, nor, rd);

          dif *= calcSoftShadow(p, lig, .001, 3.1, 40);

          vec3 brdf = vec3(0);
          brdf += 0.8 * dif;
          brdf += 1.0 * spe * dif;
          brdf += 0.3 * amb * occ;
          brdf += 0.1 * fre * occ;
          brdf += 0.1 * dom * occ;
          col *= brdf;

          return col;
      }

      void main ()
      {
          vec3 eye = rotateY(map(evolutions[0][0][1], 0., 1., -6.28, 6.28)) * vec3(8.0, 5.0, 7.0);
          // vec3 eye = vec3 (-8., 3.0, -10.);
          vec3 viewDir = rayDirection(60.0, res.xy, gl_FragCoord.xy);
          mat3 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
          vec3 worldDir = viewToWorld * viewDir;

          float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

          if (dist > MAX_DIST - EPSILON) {
              // Didn't hit anything
              vec3 outColor;
              outColor.x = map(nameAscii[0], 97., 122., 0., 1.);
              outColor.y = map(nameAscii[1], 97., 122., 0., 1.);
              outColor.z = map(nameAscii[2], 97., 122., 0., 1.);

              gl_FragColor = vec4(outColor, 1.0);
              return;
          }

          // The closest point on the surface to the eyepoint along the view ray
          vec3 p = eye + dist * worldDir;

          // Render final color
          vec3 color = render(p, worldDir);

          // color *= evolutions[0][0].x;

          gl_FragColor = vec4(color, 1.0);
      }
      `
  }
});
