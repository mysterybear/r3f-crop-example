import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import glsl from "glslify"
import * as THREE from "three"
import fragmentShader from "../shaders/fragment.glsl"
import vertexShader from "../shaders/vertex.glsl"
import { animated } from "@react-spring/three"
import { forwardRef } from "react"

export const BasicShaderMaterial = shaderMaterial(
  {
    u_texture: new THREE.Texture(),
  },
  glsl(vertexShader),
  glsl(fragmentShader)
)

export type BasicShaderMaterialImpl = {
  u_texture?: { value: THREE.Texture }
} & JSX.IntrinsicElements["shaderMaterial"]

extend({ BasicShaderMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      basicShaderMaterial: BasicShaderMaterialImpl
    }
  }
}

export const AnimatedBasicShaderMaterial = animated(
  forwardRef<BasicShaderMaterialImpl, any>((props, ref) => (
    <basicShaderMaterial ref={ref} {...props} />
  ))
)
