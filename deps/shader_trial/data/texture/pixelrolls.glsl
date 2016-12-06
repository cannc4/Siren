#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform float time;
uniform vec2 pixels;
uniform float rollRate;
uniform float rollAmount;

uniform vec2 mask_c;
uniform vec2 mask_d;

void main(void) {

if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
  	vec2 p = vertTexCoord.st;
	p.x -= mod(p.x, 1.0 / pixels.x);
	p.y -= mod(p.y, 1.0 / pixels.y);
	p.y = mod(p.y + rollAmount * sin(rollRate * time * p.x + p.x), 1.0);
  	gl_FragColor = texture2D(texture, p);
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
