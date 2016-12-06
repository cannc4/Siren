#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float time;
uniform float amount;

uniform vec2 mask_c;
uniform vec2 mask_d;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
	vec2 p = vertTexCoord.st;

	vec2 offset = vec2((rand(vec2(time,time)) - 0.5)*amount, (rand(vec2(time + 999.0,time + 999.0))- 0.5) *amount);
	p += offset;
	gl_FragColor = texture2D(texture, p);
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
