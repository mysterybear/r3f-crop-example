// clang-format off
#pragma glslify: toLinear = require('glsl-gamma/in')
#pragma glslify: toGamma = require('glsl-gamma/out')
// clang-format on

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec4 u_inset;
uniform vec3 u_handle_color;
uniform float u_handle_length;
uniform vec2 u_handle_thickness;

float rect(vec2 xy, vec2 wh, vec2 st) {
  vec2 mask = step(xy, st);
  mask *= 1.0 - step(xy + wh, st);
  return mask.x * mask.y;
}

mat2 scale(vec2 _scale) { return mat2(_scale.x, 0.0, 0.0, _scale.y); }

float top(vec2 st) {
  vec2 xy = vec2(0.0, 1.0 - u_handle_thickness.y);
  vec2 wh = vec2(1.0, u_handle_thickness.y);
  wh *= scale(vec2(u_handle_length, 1.0)) *
        scale(vec2(1.0 - (u_inset.y + u_inset.w), 1.0));
  xy += vec2((wh.x / 2.0) + u_inset.w, -u_inset.x);
  return rect(xy, wh, st);
}

float right(vec2 st) {
  vec2 xy = vec2(1.0 - u_handle_thickness.x, 0.0);
  vec2 wh = vec2(u_handle_thickness.x, 1.0);
  wh *= scale(vec2(1.0, u_handle_length)) *
        scale(vec2(1.0, 1.0 - (u_inset.x + u_inset.z)));
  xy += vec2(-u_inset.y, (wh.y / 2.0) + u_inset.z);
  return rect(xy, wh, st);
}

float bottom(vec2 st) {
  vec2 xy = vec2(0.0, 0.0);
  vec2 wh = vec2(1.0, u_handle_thickness.y);
  wh *= scale(vec2(u_handle_length, 1.0)) *
        scale(vec2(1.0 - (u_inset.y + u_inset.w), 1.0));
  xy += vec2((wh.x / 2.0) + u_inset.w, u_inset.z);
  return rect(xy, wh, st);
}

float left(vec2 st) {
  vec2 xy = vec2(0.0, 0.0);
  vec2 wh = vec2(u_handle_thickness.x, 1.0);
  wh *= scale(vec2(1.0, u_handle_length)) *
        scale(vec2(1.0, 1.0 - (u_inset.x + u_inset.z)));
  xy += vec2(u_inset.w, (wh.y / 2.0) + u_inset.z);
  return rect(xy, wh, st);
}

void main() {
  vec4 texture = toLinear(texture2D(u_texture, vUv));
  vec2 st = vUv;

  float handle_mask = max(max(top(st), bottom(st)), max(left(st), right(st)));
  float dim_mask_x = step(st.x, 1.0 - u_inset.y) * step(u_inset.w, st.x);
  float dim_mask_y = step(st.y, 1.0 - u_inset.x) * step(u_inset.z, st.y);
  float dim_mask = min(dim_mask_x, dim_mask_y);

  vec4 black = vec4(vec3(0.0), 1.0);
  vec4 gray = vec4(vec3(0.3), 1.0);
  vec4 color = toGamma(mix(mix(black, gray, texture), texture, dim_mask));

  vec4 border_color = vec4(u_handle_color, 1.0);
  color = mix(color, border_color, handle_mask);

  gl_FragColor = color;
}