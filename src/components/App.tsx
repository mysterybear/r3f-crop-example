import { Canvas } from "@react-three/fiber"
import { Fragment, Suspense, useState } from "react"
import CropImage from "./CropImage"
import { State } from "../types"
import { EXECUTE_CROP_EVENT, RESET_INSET_EVENT } from "../events"

const initialState: State = {
  src: "https://images.unsplash.com/photo-1613910117442-b7ef140b37f5",
  width: 8,
  height: 6,
}

const App = () => {
  const [state, set] = useState(initialState)
  return (
    <Fragment>
      <div className="full-screen">
        <Canvas>
          <Suspense fallback={null}>
            <CropImage {...state} set={set} />
          </Suspense>
        </Canvas>
      </div>
      <div className="overlay">
        <button
          onClick={() =>
            void dispatchEvent(new CustomEvent(EXECUTE_CROP_EVENT))
          }
        >
          Crop
        </button>
        <button
          onClick={() => void dispatchEvent(new CustomEvent(RESET_INSET_EVENT))}
        >
          Reset
        </button>
      </div>
    </Fragment>
  )
}

export default App
