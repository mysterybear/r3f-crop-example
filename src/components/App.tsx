import "../materials/BasicShaderMaterial"

const App = () => {
  return (
    <mesh>
      <planeBufferGeometry args={[4, 4]} />
      <basicShaderMaterial />
    </mesh>
  )
}

export default App
