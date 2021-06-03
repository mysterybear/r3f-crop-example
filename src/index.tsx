import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./components/App"
import { Canvas } from "@react-three/fiber"

ReactDOM.render(
  <React.StrictMode>
    <div className="full-screen">
      <Canvas>
        <App />
      </Canvas>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
)
