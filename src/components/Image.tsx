import { to, useSpring } from "@react-spring/three"
import { useLoader, useThree } from "@react-three/fiber"
import { FullGestureState, useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/function"
import { Ord } from "fp-ts/number"
import { clamp as fpClamp } from "fp-ts/Ord"
import produce from "immer"
import { useEffect, useState } from "react"
import * as THREE from "three"
import "../materials/BasicShaderMaterial"
import { State } from "../types"
import Handle from "./Handle"

const clamp = fpClamp(Ord)
const { PI: pi } = Math

const Image = ({ src, width, height }: State) => {
  const texture = useLoader(THREE.TextureLoader, src)
  const cropHandleLength = 0.5
  const [_inset, _setInset] = useState([0, 0, 0, 0])
  const [dragging, setDragging] = useState(-1)

  const [{ inset }, spring] = useSpring(
    () => ({
      inset: _inset,
    }),
    [_inset]
  )

  const factor = useThree((three) => three.viewport.factor)

  const handleBind = useDrag(
    (state) =>
      // @ts-ignore
      void pipe(state, ...state.args),
    { transform: ([x, y]: [number, number]) => [x / factor, -y / factor] }
  )

  const handleOp =
    (ord: number) =>
    async ({ movement, event, down }: FullGestureState<"drag">) => {
      event?.stopPropagation()
      if (dragging !== -1 && dragging !== ord) return
      setDragging(ord)

      const d = pipe(movement, ([x, y]) => [x / width, y / height] as const)
      const s = ord < 2 ? -1 : 1
      const next = produce(inset.get(), (draft) => {
        draft[ord] = clamp(0, 1)(_inset[ord] + s * d[(ord + 1) % 2])
      })
      if (down) {
        spring.start({ inset: next })
      } else {
        await spring.start({ inset: next })
        _setInset(next)
        setDragging(-1)
      }
    }

  const [hovered, setHovered] = useState(false)
  const hoverProps = {
    onPointerOver: (e: React.SyntheticEvent) => {
      e.stopPropagation()
      setHovered(true)
    },
    onPointerOut: () => setHovered(false),
  }
  useEffect(
    () => void (document.body.style.cursor = hovered ? "grab" : "auto"),
    [hovered]
  )

  return (
    <mesh>
      <planeBufferGeometry args={[width, height]} />
      <basicShaderMaterial uniforms-u_texture-value={texture} />
      <Handle
        radius={width / 2}
        position-x={to(
          [inset],
          ([_t, r, _b, l]) => (l * width - r * width) / 2
        )}
        position-y={to([inset], ([t]) => height / 2 - height * t)}
        position-z={0}
        scale-x={to([inset], ([t, r, b, l]) => cropHandleLength - (l + r) / 2)}
        scale-y={to([inset], ([t, r, b, l]) => cropHandleLength - (t + b) / 2)}
        thetaStart={pi}
        {...(handleBind(handleOp(0)) as any)}
        {...hoverProps}
      />
      <Handle
        radius={height / 2}
        position-x={to([inset], ([t, r]) => width / 2 - width * r)}
        position-y={to(
          [inset],
          ([t, r, b, l]) => (b * height - t * height) / 2
        )}
        position-z={0}
        thetaStart={pi / 2}
        scale-x={to([inset], ([t, r, b, l]) => cropHandleLength - (l + r) / 2)}
        scale-y={to([inset], ([t, r, b, l]) => cropHandleLength - (t + b) / 2)}
        {...(handleBind(handleOp(1)) as any)}
        {...hoverProps}
      />
      <Handle
        radius={width / 2}
        position-x={to(
          [inset],
          ([_t, r, _b, l]) => (l * width - r * width) / 2
        )}
        position-y={to([inset], ([t, r, b]) => -height / 2 + height * b)}
        position-z={0}
        scale-x={to([inset], ([t, r, b, l]) => cropHandleLength - (l + r) / 2)}
        scale-y={to([inset], ([t, r, b, l]) => cropHandleLength - (t + b) / 2)}
        thetaStart={0}
        {...(handleBind(handleOp(2)) as any)}
        {...hoverProps}
      />
      <Handle
        radius={height / 2}
        position-x={to([inset], ([t, r, b, l]) => -width / 2 + width * l)}
        position-y={to(
          [inset],
          ([t, r, b, l]) => (b * height - t * height) / 2
        )}
        position-z={0}
        thetaStart={(pi / 2) * 3}
        scale-x={to([inset], ([t, r, b, l]) => cropHandleLength - (l + r) / 2)}
        scale-y={to([inset], ([t, r, b, l]) => cropHandleLength - (t + b) / 2)}
        {...(handleBind(handleOp(3)) as any)}
        {...hoverProps}
      />
    </mesh>
  )
}

export default Image
