import { animated } from "@react-spring/three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import glsl from "glslify"
import * as THREE from "three"
import fragmentShader from "../shaders/fragment.glsl"
import vertexShader from "../shaders/vertex.glsl"

const ImageMaterial = shaderMaterial(
  {
    u_texture: new THREE.Texture(),
    u_inset: new THREE.Vector4(0, 0, 0, 0),
    u_handle_color: new THREE.Color(),
    u_handle_length: 0.5,
    u_handle_thickness: new THREE.Vector2(0, 0),
  },
  glsl(vertexShader),
  glsl(fragmentShader)
)
export type ImageMaterialImpl = {
  u_texture?: { value: THREE.Texture }
  u_inset?: { value: THREE.Vector4 }
  u_border_color?: { value: THREE.Color }
  u_handle_length?: { value: number }
  u_border_thickness?: { value: THREE.Vector2 }
} & JSX.IntrinsicElements["shaderMaterial"]

extend({ ImageMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      imageMaterial: ImageMaterialImpl
    }
  }
}

export const AnimatedImageMaterial = animated((props: ImageMaterialImpl) => (
  <imageMaterial {...props} />
))
