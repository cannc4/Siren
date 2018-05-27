import { GLSL, Shaders } from "gl-react";

export const shaders = Shaders.create({
    helloGL: {
        frag: GLSL`
        precision highp float;
        uniform float time;
        varying vec2 uv; // This variable vary in all pixel position (normalized from vec2(0.0,0.0) to vec2(1.0,1.0))

        void main () { // This function is called FOR EACH PIXEL
            gl_FragColor = vec4(uv.x, uv.y, mod(time, 1.0), 1.0); // red vary over X, green vary over Y, blue is 50%, alpha is 100%.
        }
      `
    },
    shake: {
        frag: GLSL`
        precision mediump float;

        uniform sampler2D texture;
        
        uniform float time;
        uniform float amount;

        varying vec2 uv;

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
        precision highp float;  

        varying vec2 uv;
        uniform sampler2D texture;
        //uniform vec2 texOffset;

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
    marchGL: {
        frag: GLSL`
        precision highp float;

        uniform vec2 res;
        uniform float time;

        // channel-wise evolution matrix
        ////// 4 channels max ////
        uniform mat4 evolutions[4];

        // rms values
        uniform float rmss[2];
        
        // sample parameters
        uniform float nameAscii[5];
        uniform float n;
        uniform float cps;
        uniform float delta;
        uniform float cycle;
        uniform float note;
        uniform float sustain;
        uniform float begin;
        uniform float end;
        uniform float room; 
        uniform float gain; 
        uniform float channel;

        const int MAX_MARCHING_STEPS = 255;
        const float MIN_DIST = 0.0;
        const float MAX_DIST = 100.0;
        const float EPSILON = 0.001;

        ////////////////
        vec4 S1, S2;
        ////////////////

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

        float map(float value,  float istart,  float iend,  float ostart,  float oend) {
            return ( (value-istart) / (iend-istart) * (oend-ostart) ) + ostart;
        }

        float intersectSDF(float distA, float distB) {
            return max(distA, distB);
        }
        float unionSDF(float distA, float distB) {
            return min(distA, distB);
        }
        float differenceSDF(float distA, float distB) {
            return max(distA, -distB);
        }

        float boxSDF(vec3 p, vec3 size) {
            vec3 d = abs(p) - (size / 2.0);
            
            // Assuming p is inside the cube, how far is it from the surface?
            // Result will be negative or zero.
            float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
            
            // Assuming p is outside the cube, how far is it from the surface?
            // Result will be positive or zero.
            float outsideDistance = length(max(d, 0.0));
            
            return insideDistance + outsideDistance;
        }
        float sphereSDF(vec3 p, float r) {
            return length(p) - r;
        }
        float cylinderSDF(vec3 p, float h, float r) {
            // How far inside or outside the cylinder the point is, radially
            float inOutRadius = length(p.xy) - r;
            
            // How far inside or outside the cylinder is, axially aligned with the cylinder
            float inOutHeight = abs(p.z) - h/2.0;
            
            // Assuming p is inside the cylinder, how far is it from the surface?
            // Result will be negative or zero.
            float insideDistance = min(max(inOutRadius, inOutHeight), 0.0);

            // Assuming p is outside the cylinder, how far is it from the surface?
            // Result will be positive or zero.
            float outsideDistance = length(max(vec2(inOutRadius, inOutHeight), 0.0));
            
            return insideDistance + outsideDistance;
        }

        float superformula(in float phi, in float a, in float b, in float m, in float n1, in float n2, in float n3) {
            return pow((pow(abs(cos(m * phi / 4.0) / a), n2) + pow(abs(sin(m * phi / 4.0) / b), n3)), -(1.0 / n1));
        }
        float supershape(in vec3 p) {
            //the distance to the center of the shape
            float d = length(p);

            //the sine of rho (the angle between z and xy)
            float sn = p.z/d;

            //the angles to feed the formula
            float phi = atan(p.y,p.x);
            float rho = asin(sn);
            
            float r1 = superformula(phi, 1.0 + EPSILON, 1.0, S1.x, S1.y, S1.z, S1.w);
            float r2 = superformula(rho, 1.0, 1.0, S2.x, S2.y, S2.z, S2.w); 
            
            //reconstituted point
            // vec3 np = r2 * vec3(r1 * cos(rho) * vec2(cos(phi), sin(phi)), sin(rho));
            // d -= length(np); //the distance to this point
            
            //same as above but optimized a bit
            d -= r2 * sqrt(r1 * r1 * (1.0 - sn * sn) + sn * sn);

            return d;
        }
        float DDE( in vec3 p, in vec3 rd) {
            float d = supershape(p), s = d * 0.5;
            float dr = (d - supershape(p + rd * s)) / s;
            return d / (1.0 + max(dr, 0.0));
        }

        vec4 Setup(in float t)
        {
            t = mod(t, 8.0);
            if (t < 1.0)      return vec4(7.75, 15.0, 12.0, 17.0);
            else if (t < 2.0) return vec4(-2.0, 13.0, 1.0, 8.0);
            else if (t < 3.0) return vec4(5.0, 2.0, 6.0, 6.0);
            else if (t < 4.0) return vec4(-1.0, 1.0, 6.0, 0.2);
            else if (t < 5.0) return vec4(4.0, 2.0, 1.0, 8.0);
            else if (t < 6.0) return vec4(2.0, 2.3, 2.0, 2.2);
            else if (t < 7.0) return vec4(5.1, 1.5, 1.0, 1.0);
            else              return vec4(3.0, 4.5, 10.0, 1.0);
        }

        float sceneSDF(vec3 samplePoint, vec3 marchingDirection) {    
            // Slowly spin the whole scene
            // samplePoint = rotateY(time / 2.0) * samplePoint;
            
            // Infinity
            // samplePoint = mod(samplePoint, 4.0) - 0.5 * 2.0;

            // float cylinderRadius = 0.4 + (1.0 - 0.4) * (1.0 + sin(1.7 * time)) / 2.0;
            // float cylinder1 = cylinderSDF(samplePoint, 2.0, cylinderRadius);
            // float cylinder2 = cylinderSDF(rotateX(radians(90.0)) * samplePoint, 2.0, cylinderRadius);
            // float cylinder3 = cylinderSDF(rotateY(radians(90.0)) * samplePoint, 2.0, cylinderRadius);
            
            // float cube = boxSDF(samplePoint, vec3(1.8, 1.8, 1.8));
            
            float sphere = sphereSDF(samplePoint, 1.2);
            
            float ballOffset = 0.4 + 1.0 + sin(1.7 * time);
            // float ballRadius = 0.3;
            // float balls = sphereSDF(samplePoint - vec3(ballOffset, 0.0, 0.0), ballRadius);
            // balls = unionSDF(balls, sphereSDF(samplePoint + vec3(ballOffset, 0.0, 0.0), ballRadius));
            // balls = unionSDF(balls, sphereSDF(samplePoint - vec3(0.0, ballOffset, 0.0), ballRadius));
            // balls = unionSDF(balls, sphereSDF(samplePoint + vec3(0.0, ballOffset, 0.0), ballRadius));
            // balls = unionSDF(balls, sphereSDF(samplePoint - vec3(0.0, 0.0, ballOffset), ballRadius));
            // balls = unionSDF(balls, sphereSDF(samplePoint + vec3(0.0, 0.0, ballOffset), ballRadius));
            
            // float csgNut = differenceSDF(intersectSDF(cube, sphere),
            //                     unionSDF(cylinder1, unionSDF(cylinder2, cylinder3)));
            
            // return unionSDF(balls, csgNut);
            
            ///////////////////////////

            float tim = time * 0.3;
            S1 = mix(Setup(tim - 1.0), Setup(tim), smoothstep(0.0, 1.0, fract(tim) * 2.0));
            tim = tim * 0.9 + 2.5;
            S2 = mix(Setup(tim - 1.0), Setup(tim), smoothstep(0.0, 1.0, fract(tim) * 2.0));

            return DDE(samplePoint, marchingDirection);
        }

        float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
            float depth = start;
            for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
                float dist = sceneSDF(eye + depth * marchingDirection, marchingDirection);
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
                    
        vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
            vec2 xy = fragCoord - size / 2.0;
            float z = size.y / tan(radians(fieldOfView) / 2.0);
            return normalize(vec3(xy, -z));
        }

        vec3 estimateNormal(in vec3 p, in vec3 rd) {
            return normalize(vec3(
                sceneSDF(vec3(p.x + EPSILON, p.y, p.z), rd) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z),rd),
                sceneSDF(vec3(p.x, p.y + EPSILON, p.z), rd) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z),rd),
                sceneSDF(vec3(p.x, p.y, p.z + EPSILON), rd) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON),rd)
            ));
        }

        vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye,
                                vec3 lightPos, vec3 lightIntensity) {
            vec3 N = estimateNormal(p, vec3(1));
            vec3 L = normalize(lightPos - p);
            vec3 V = normalize(eye - p);
            vec3 R = normalize(reflect(-L, N));
            
            float dotLN = dot(L, N);
            float dotRV = dot(R, V);
            
            if (dotLN < 0.0) {
                // Light not visible from this point on the surface
                return vec3(0.0, 0.0, 0.0);
            } 
            
            if (dotRV < 0.0) {
                // Light reflection in opposite direction as viewer, apply only diffuse
                // component
                return lightIntensity * (k_d * dotLN);
            }
            return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
        }

        vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
            const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
            vec3 color = ambientLight * k_a;
            
            vec3 light1Pos = vec3(4.0,
                                2.0,
                                4.0);
            vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
            
            color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                        light1Pos,
                                        light1Intensity);
            
            // vec3 light2Pos = vec3(2.0 * sin(0.37 * time),
            //                     2.0 * cos(0.37 * time),
            //                     2.0);
            // vec3 light2Intensity = vec3(0.4, 0.4, 0.4);
            
            // color += phongContribForLight(k_d, k_s, alpha, p, eye,
            //                             light2Pos,
            //                             light2Intensity);    
            return color;
        }

        float calcSSS(vec3 pos, vec3 lig, vec3 rd) {
            float sss = 0.0, sca = 1.0;
            for (int i = 0; i < 5; i++) {
                float delta = 0.01 + 0.03 * float(i);
                vec3 sspos = pos + lig * delta;
                float dist = DDE(sspos, vec3(1));
                sss += -(dist - delta) * sca;
                sca *= 0.95;
            }
            return clamp(1. - 3.0 * sss, 0., 1.);
        }

        float calcAO( in vec3 pos, in vec3 nor, vec3 rd) {
            float occ = 0.0, sca = 1.0;
            for (int i = 0; i < 4; i++) {
                float hr = 0.01 + 0.03 * float(i);
                vec3 aopos = nor * hr + pos;
                float dd = DDE(aopos, vec3(1));
                occ += -(dd - hr) * sca;
                sca *= 0.97;
            }
            return clamp(1. - 3. * occ, 0., 1.);
        }

        float calcSoftShadow(vec3 ro, vec3 rd, float mint, float tmax, int samples) {
            float res = 1.0, t = mint, stepDist = (tmax - mint) / float(samples);
            for (int i = 0; i < 64; i++) {
                float h = DDE(ro + rd * t, rd);
                res = min(res, 8.0 * h / t);
                t += clamp(h, stepDist, 1e10);
                if (h < 0.001 || t > tmax) break;
            }
            return clamp(res, 0., 1.);
        }

        vec3 render(in vec3 p, in vec3 rd) {

            vec3 lig = normalize(vec3(4.0, 2.0, 4.0)),
                 nor = estimateNormal(p, rd),
                 ref = reflect(rd, nor);

            // Normal shading 
            vec3 col = vec3(nor * .5 + .55);

            float dif = clamp(dot(nor, lig), 0., 1.),
                spe = pow(clamp(dot(reflect(-lig, nor), -rd), 0., 1.), 25.),
                fre = pow(clamp(1.0 + dot(nor, rd), 0., 1.), 5.),
                dom = smoothstep(-0.15, 0.15, ref.y),
                amb = 1.0,
                occ = calcAO(p, nor, rd),
                sss = calcSSS(p, lig, rd);
            
            dif *= calcSoftShadow(p, lig, .001, 3.1, 40);

            vec3 brdf = vec3(0);
            brdf += 0.8 * dif;
            brdf += 1.0 * spe * dif;
            brdf += 0.3 * amb * occ;
            brdf += 0.1 * fre * occ;
            brdf += 0.1 * dom * occ;
            brdf += 0.2 * sss * occ;
            col *= brdf;

            return col;
        }

        mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
            // Based on gluLookAt man page
            vec3 f = normalize(center - eye);
            vec3 s = normalize(cross(f, up));
            vec3 u = cross(s, f);
            return mat3(s, u, -f);
        }

        void main ()
        {
            vec3 viewDir = rayDirection(45.0, res.xy, gl_FragCoord.xy);
            
            vec3 eye = rotateX(cos(time)) * rotateY(sin(time)) * vec3(8.0 + sin(time) * 10., 5.0, 7.0);
            // vec3 eye = rotateY((sin(time)+1.)*3.) * vec3(8.0 + sin(time) * 10., 5.0, 7.0);
            
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
            
            // Use the surface normal as the ambient color of the material
            vec3 K_a = (estimateNormal(p, worldDir) / 2.0);
            vec3 K_d = K_a;
            vec3 K_s = vec3(1.0, 1.0, 1.0);
            float shininess = 10.0;

            vec3 color = render(p, worldDir);
            // vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
            
            gl_FragColor = vec4(color, 1.0);
        }
        `
    }
});