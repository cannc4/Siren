#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float amount;
uniform float angle;

uniform vec2 mask_c;
uniform vec2 mask_d;

void main(void) {
  if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
	vec2 vUv = vertTexCoord.st;

	vec2 offset = amount * vec2( cos(angle), sin(angle));
	vec4 cr = texture2D(texture, vUv + offset);
	vec4 cga = texture2D(texture, vUv);
	vec4 cb = texture2D(texture, vUv - offset);

	gl_FragColor = vec4(cr.r, cga.g, cb.b, 1.0);
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
