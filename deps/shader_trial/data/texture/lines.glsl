#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform vec2 texOffset;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float lineStrength;
uniform float lineSize;
uniform float lineTilt;

void main() {
	vec2 vUv = vertTexCoord.st;

	vec4 col = texture2D(texture, vUv);
	col += sin(vUv.x*lineSize*(1.0-lineTilt)+
			   vUv.y*lineSize*lineTilt)*lineStrength;
			   
	gl_FragColor = col;
}