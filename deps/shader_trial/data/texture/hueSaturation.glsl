#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float hue;
uniform float saturation;
uniform float brightness;
uniform float contrast;

uniform vec2 mask_c;
uniform vec2 mask_d;

void main(void) {
  if(vertTexCoord.s > mask_c.s &&
	 vertTexCoord.s < mask_c.s + mask_d.s &&
	 vertTexCoord.t > mask_c.t &&
	 vertTexCoord.t < mask_c.t + mask_d.t){
	vec2 vUv = vertTexCoord.st;

	gl_FragColor = texture2D( texture, vUv );

	// hue
	float angle = hue * 3.14159265;
	float s = sin(angle), c = cos(angle);
	vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
	float len = length(gl_FragColor.rgb);
	gl_FragColor.rgb = vec3(
		dot(gl_FragColor.rgb, weights.xyz),
		dot(gl_FragColor.rgb, weights.zxy),
		dot(gl_FragColor.rgb, weights.yzx)
	);

	// saturation
	float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
	if (saturation > 0.0) {
		gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));
	} else {
		gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);
	}
  }
  else{
	gl_FragColor = texture2D(texture, vertTexCoord.st);
  }
}
