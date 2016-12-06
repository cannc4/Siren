#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float opacity;

void main() {
	vec4 texel = texture2D( texture, vertTexCoord.st );
	gl_FragColor = opacity * texel;
}