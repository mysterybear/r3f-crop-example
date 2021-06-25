import { to, useSpring } from "@react-spring/three"
import { useLoader, useThree } from "@react-three/fiber"
import { FullGestureState, useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/function"
import { Ord } from "fp-ts/number"
import { clamp as fpClamp } from "fp-ts/Ord"
import produce from "immer"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { AnimatedImageMaterial } from "../materials/ImageMaterial"
import { State } from "../types"
import Handle from "./Handle"
import useEventListener from "@use-it/event-listener"
import { EXECUTE_CROP_EVENT, RESET_INSET_EVENT } from "../events"

const clamp = fpClamp(Ord)
const { PI: pi } = Math

type Props = State & { set: Dispatch<SetStateAction<State>> }

const CropImage = ({ src, width, height, set }: Props) => {
  const texture = useLoader(THREE.TextureLoader, src)
  const htmlImage = useRef(new Image())
  const cropHandleProps = {
    color: new THREE.Color("green"),
    length: 0.5,
    thickness: 0.1,
  }
  const [_inset, _setInset] = useState([0, 0, 0, 0])
  const [dragging, setDragging] = useState(-1)

  const [{ inset }, spring] = useSpring(() => ({
    inset: _inset,
  }))

  useEffect(() => {
    htmlImage.current.crossOrigin = "anonymous"
    htmlImage.current.src = src
    spring.start({ inset: [0, 0, 0, 0], immediate: true })
  }, [src, spring])

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
        spring.start({ inset: next, immediate: false })
      } else {
        await spring.start({ inset: next, immediate: false })
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
  function executeCrop() {
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Couldn't get a 2D canvas")

    const [t, r, b, l] = inset.get()
    const img = htmlImage.current

    const crop = {
      width: img.width - (l * img.width + r * img.width),
      height: img.height - (t * img.height + b * img.height),
      left: l * img.width,
      top: t * img.height,
    }

    ctx.canvas.width = crop.width
    ctx.canvas.height = crop.height
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = {
      sx: l * img.width,
      sy: t * img.height,
      sWidth: crop.width,
      sHeight: crop.height,
      dx: 0,
      dy: 0,
      dWidth: crop.width,
      dHeight: crop.height,
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    const nextImageSrc = ctx.canvas.toDataURL("image/png")
    const nextImage = new Image(crop.width, crop.height)
    nextImage.src = nextImageSrc

    set({
      src: nextImageSrc,
      width: width * (1 - (l + r)),
      height: height * (1 - (t + b)),
    })
  }

  useEventListener(EXECUTE_CROP_EVENT, executeCrop)
  useEventListener(
    RESET_INSET_EVENT,
    () => void spring.start({ inset: [0, 0, 0, 0] })
  )

  return (
    <mesh>
      <planeBufferGeometry args={[width, height]} />
      <AnimatedImageMaterial
        uniforms-u_texture-value={texture}
        uniforms-u_inset-value={inset}
        uniforms-u_handle_color-value={cropHandleProps.color}
        uniforms-u_handle_thickness-value={[
          cropHandleProps.thickness / width,
          cropHandleProps.thickness / height,
        ]}
        uniforms-u_handle_length-value={cropHandleProps.length}
      />
      <Handle
        radius={width / 2}
        position-x={to(
          [inset],
          ([_t, r, _b, l]) => (l * width - r * width) / 2
        )}
        position-y={to([inset], ([t]) => height / 2 - height * t)}
        position-z={0}
        scale-x={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (l + r) / 2
        )}
        scale-y={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (t + b) / 2
        )}
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
        scale-x={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (l + r) / 2
        )}
        scale-y={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (t + b) / 2
        )}
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
        scale-x={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (l + r) / 2
        )}
        scale-y={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (t + b) / 2
        )}
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
        scale-x={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (l + r) / 2
        )}
        scale-y={to(
          [inset],
          ([t, r, b, l]) => cropHandleProps.length - (t + b) / 2
        )}
        {...(handleBind(handleOp(3)) as any)}
        {...hoverProps}
      />
    </mesh>
  )
}

export default CropImage
