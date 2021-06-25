import { Canvas, useLoader } from "@react-three/fiber"
import { Fragment, Suspense, useState } from "react"
import "../materials/BasicShaderMaterial"
import * as THREE from "three"

export type State = {
  src: string
  width: number
  height: number
}

const initialState: State = {
  src: "https://images.unsplash.com/photo-1613910117442-b7ef140b37f5",
  width: 8,
  height: 6,
}

const Image = ({ src, width, height }: State) => {
  const texture = useLoader(THREE.TextureLoader, src)
  return (
    <mesh>
      <planeBufferGeometry args={[width, height]} />
      <basicShaderMaterial uniforms-u_texture-value={texture} />
    </mesh>
  )
}

const App = () => {
  const [state] = useState(initialState)
  return (
    <Fragment>
      <div className="full-screen">
        <Canvas>
          <Suspense fallback={null}>
            <Image {...state} />
          </Suspense>
        </Canvas>
      </div>
    </Fragment>
  )
}

export default App
