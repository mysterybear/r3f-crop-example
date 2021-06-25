import { Canvas } from "@react-three/fiber"
import { Fragment, Suspense, useState } from "react"
import Image from "./Image"
import { State } from "../types"

const initialState: State = {
  src: "https://images.unsplash.com/photo-1613910117442-b7ef140b37f5",
  width: 8,
  height: 6,
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
