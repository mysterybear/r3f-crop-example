#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform vec2 u_offset;
uniform float u_time;

// clang-format off
#pragma glslify: planet = require('glsl-earth')
// clang-format on

void main() {
  vec2 resolution = vec2(640, 640);
  float size = 0.75;
  vec2 rot = vec2(u_time * 0.03 + u_offset.x, u_time * 0.01 + u_offset.y);

  vec3 color = planet(vUv, resolution, size, rot);

  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}