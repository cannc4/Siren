#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform vec2 texOffset;

uniform float brightness;
uniform int radius;

uniform vec2 mask_c;
uniform vec2 mask_d;

void main(void) {
  if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
	  int i = 0;
	  int j = 0;
	  vec4 sum = vec4(0.0);
	  
	  for( i=-radius; i<radius; i++) {
		for( j=-radius; j<radius; j++) {
			sum += texture2D( texture, vertTexCoord.st + vec2(j,i)*texOffset.st)*brightness;
		}
	  }

	  gl_FragColor = sum*sum+ vec4(texture2D( texture, vertTexCoord.st).rgba);
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
