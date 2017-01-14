uniform mat4 transform;       // projection * view * model
uniform mat4 texMatrix;
uniform float u_time;         // Time

attribute vec4 color;         // color
attribute vec3 position;      // Position
attribute vec2 texCoord;      // Texture

varying vec4 vertColor;
varying vec4 vertTexCoord;

vec2 random2(vec2 st){
  st = vec2( dot(st,vec2(127.1,311.7)),
            dot(st,vec2(269.5,183.3)) );
  return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 u = f*f*(3.0-2.0*f);
  return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                   dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x)*st.y,
              mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                   dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x)*st.y, u.y);
}

void main() {
  vec3 temp = vec3(position.x*(noise(texCoord*sin(u_time)*3.5)+1.),
                   position.y*(noise(texCoord*cos(u_time)*2.1)+1.),
                   position.z*(noise(texCoord*cos(u_time)*2.8)+1.));

  gl_Position = transform * vec4(temp, 1.0);

  vertColor = color;
  vertTexCoord = texMatrix * vec4(texCoord, 1.0, 1.0);
}
