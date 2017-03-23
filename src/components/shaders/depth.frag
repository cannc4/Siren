varying vec2 vUV;

vec4 pack_depth( const in float depth ) {
  const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
  const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
  vec4 res = fract( depth * bit_shift );
  res -= res.xxyz * bit_mask;

  return res;
}

void main() {
  vec4 pixel = vec4(vUV, 0, 1);

  if ( pixel.a < 0.5 ) discard;

  gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );
}
