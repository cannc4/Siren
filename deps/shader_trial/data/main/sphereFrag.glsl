varying vec4 vertColor;
varying vec4 vertTexCoord;

void main() {
    gl_FragColor = vec4(vec3(vertTexCoord.s*0.5+.45), 1.0);
}
