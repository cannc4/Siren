import { GLSL, Shaders } from "gl-react";

export const shaders = Shaders.create({
    helloGL: {
        frag: GLSL`
        precision highp float;
        uniform float blue;
        varying vec2 uv; // This variable vary in all pixel position (normalized from vec2(0.0,0.0) to vec2(1.0,1.0))
        void main () { // This function is called FOR EACH PIXEL
            gl_FragColor = vec4(uv.x, uv.y, blue, 1.0); // red vary over X, green vary over Y, blue is 50%, alpha is 100%.
        }
      `
    },
    marchGL: {
        frag: GLSL`
        precision highp float;

        uniform vec2 resolution;

        const int MAX_MARCHING_STEPS = 255;
        const float MIN_DIST = 0.0;
        const float MAX_DIST = 100.0;
        const float EPSILON = 0.0001;
        
        float sphereSDF(vec3 samplePoint) {
            return length(samplePoint) - 1.0;
        }
        
        float sceneSDF(vec3 samplePoint) {
            return sphereSDF(samplePoint);
        }
       
        // Ray Marching 
        float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
            float depth = start;
            for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
                float dist = sceneSDF(eye + depth * marchingDirection);
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
        
        void main()
        {
            vec3 dir = rayDirection(45.0, resolution.xy, gl_FragCoord.xy);
            vec3 eye = vec3(0.0, 0.0, 5.0);
            float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);

            if (dist > MAX_DIST - EPSILON) {
                // Didn't hit anything
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }
            
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        `
    },
    blur1d: {
        frag: GLSL`
            precision highp float;
            varying vec2 uv;
            uniform sampler2D t;
            uniform vec2 dim;
            uniform vec2 dir;
            void main() {
                vec4 color = vec4(0.0);
                vec2 off1 = vec2(1.3846153846) * dir;
                vec2 off2 = vec2(3.2307692308) * dir;
                color += texture2D(t, uv) * 0.2270270270;
                color += texture2D(t, uv + (off1 / dim)) * 0.3162162162;
                color += texture2D(t, uv - (off1 / dim)) * 0.3162162162;
                color += texture2D(t, uv + (off2 / dim)) * 0.0702702703;
                color += texture2D(t, uv - (off2 / dim)) * 0.0702702703;
                gl_FragColor = color;
            }
            `
    },
    marchGL2: {
        frag: GLSL`
        precision highp float;

        uniform vec2 resolution;
        uniform float iTime;

        // sample parameters
        uniform float nameAscii[5];
        uniform float note;
        uniform float cps;
        uniform float delta;
        uniform float cycle;
        uniform float begin;
        uniform float end;
        uniform float room; 
        uniform float gain; 
        uniform float channel;

        const int MAX_MARCHING_STEPS = 255;
        const float MIN_DIST = 0.0;
        const float MAX_DIST = 100.0;
        const float EPSILON = 0.0001;

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
        // float supershapeSDF(vec3 samplePoint) {
        //     float r = 1;
        //     float t1 = 1, t2 = 1;
        //     float a = 1., b = 1.;

        //     t1 = cos(m * phi / 4.) / a;
        //     t1 = abs(t1);
        //     t1 = pow(t1, n2);

        //     t2 = sin(m * phi / 4.) / b;
        //     t2 = abs(t2);
        //     t2 = pow(t2, n3);
            
        //     r = pow(t1+t2, 1./n1);
        //     return r;
        // }
        float sceneSDF(vec3 samplePoint) {    
            // Slowly spin the whole scene
            // samplePoint = rotateY(iTime / 2.0) * samplePoint;
            
            samplePoint = mod(samplePoint, 7.0) - 0.5 * 2.0;

            float cylinderRadius = 0.4 + (1.0 - 0.4) * (1.0 + sin(1.7 * iTime)) / 2.0;
            float cylinder1 = cylinderSDF(samplePoint, 2.0, cylinderRadius);
            float cylinder2 = cylinderSDF(rotateX(radians(90.0)) * samplePoint, 2.0, cylinderRadius);
            float cylinder3 = cylinderSDF(rotateY(radians(90.0)) * samplePoint, 2.0, cylinderRadius);
            
            float cube = boxSDF(samplePoint, vec3(1.8, 1.8, 1.8));
            
            float sphere = sphereSDF(samplePoint, 1.2);
            
            float ballOffset = 0.4 + 1.0 + sin(1.7 * iTime);
            float ballRadius = 0.3;
            float balls = sphereSDF(samplePoint - vec3(ballOffset, 0.0, 0.0), ballRadius);
            balls = unionSDF(balls, sphereSDF(samplePoint + vec3(ballOffset, 0.0, 0.0), ballRadius));
            balls = unionSDF(balls, sphereSDF(samplePoint - vec3(0.0, ballOffset, 0.0), ballRadius));
            balls = unionSDF(balls, sphereSDF(samplePoint + vec3(0.0, ballOffset, 0.0), ballRadius));
            balls = unionSDF(balls, sphereSDF(samplePoint - vec3(0.0, 0.0, ballOffset), ballRadius));
            balls = unionSDF(balls, sphereSDF(samplePoint + vec3(0.0, 0.0, ballOffset), ballRadius));
            
            float csgNut = differenceSDF(intersectSDF(cube, sphere),
                                unionSDF(cylinder1, unionSDF(cylinder2, cylinder3)));
            
            return unionSDF(balls, csgNut);
        }

        float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
            float depth = start;
            for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
                float dist = sceneSDF(eye + depth * marchingDirection);
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

        vec3 estimateNormal(vec3 p) {
            return normalize(vec3(
                sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
                sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
                sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
            ));
        }

        vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye,
                                vec3 lightPos, vec3 lightIntensity) {
            vec3 N = estimateNormal(p);
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
            
            vec3 light1Pos = vec3(4.0 * sin(iTime),
                                2.0,
                                4.0 * cos(iTime));
            vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
            
            color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                        light1Pos,
                                        light1Intensity);
            
            // vec3 light2Pos = vec3(2.0 * sin(0.37 * iTime),
            //                     2.0 * cos(0.37 * iTime),
            //                     2.0);
            // vec3 light2Intensity = vec3(0.4, 0.4, 0.4);
            
            // color += phongContribForLight(k_d, k_s, alpha, p, eye,
            //                             light2Pos,
            //                             light2Intensity);    
            return color;
        }

        mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
            // Based on gluLookAt man page
            vec3 f = normalize(center - eye);
            vec3 s = normalize(cross(f, up));
            vec3 u = cross(s, f);
            return mat3(s, u, -f);
        }

        float map(float value,  float istart,  float iend,  float ostart,  float oend) {
            return ( (value-istart) / (iend-istart) * (oend-ostart) ) + ostart;
        }

        void main ()
        {
            vec3 viewDir = rayDirection(45.0, resolution.xy, gl_FragCoord.xy);
            vec3 eye = vec3(8.0, 5.0 * sin(0.2 * iTime), 7.0);
            // vec3 eye = vec3(end*10., begin*10. * sin(10. * delta * iTime), note);
            
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
            vec3 K_a = (estimateNormal(p) + vec3(1.0)) / 2.0;
            vec3 K_d = K_a;
            vec3 K_s = vec3(1.0, 1.0, 1.0);
            float shininess = 10.0;
            
            vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
            
            float fogFactor = smoothstep(10.0, 50.0, dist);
            gl_FragColor = vec4(mix(color, vec3(0.1), fogFactor), 1.0);

            gl_FragColor = vec4(color, 1.0);
        }
        `
    }

  });