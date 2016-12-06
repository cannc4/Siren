#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float dir;

uniform vec2 mask_c;
uniform vec2 mask_d;

void main(void) {
  if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
	vec2 vUv = vertTexCoord.st;
	
	vec4 color = texture2D(texture, vUv);
	if(vUv.x  > .5 && dir == 0.){
		color = texture2D(texture, vec2(1.-vUv.x, vUv.y));
	}
	else if(vUv.y > .5 && dir == 1.){
		color = texture2D(texture, vec2(vUv.x, 1.-vUv.y));
	}
	  
	gl_FragColor = color;  
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
