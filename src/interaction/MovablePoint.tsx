import { useDrag } from "@use-gesture/react"
import React, { useMemo, useRef, useState } from "react"
import invariant from "tiny-invariant"
import { theme } from "../display/Theme"
import vec, { Matrix } from "../vec"
import { matrixInvert, range, Vector2 } from "../math"
import { useScaleContext } from "../view/ScaleContext"

export type ConstraintFunction = (position: Vector2) => Vector2

export interface MovablePointProps {
  /** The current position (`[x, y]`) of the point. */
  point: Vector2
  /** A callback that is called as the user moves the point. */
  onMove: (point: Vector2) => void
  /**
   * Transform the point's movement and constraints by a transformation matrix. You can use `vec-la`
   * to build up such a matrix.
   */
  transform?: Matrix
  /**
   * Constrain the point to only horizontal movement, vertical movement, or mapped movement.
   *
   * In mapped movement mode, you must provide a function that maps the user's attempted position
   * (x, y) to the position the point should "snap" to.
   */
  constrain?: ConstraintFunction
  color?: string
}

const MovablePoint: React.VFC<MovablePointProps> = ({
  point,
  onMove,
  constrain = (point) => point,
  color = theme.pink,
  transform = vec.identity,
}) => {
  const { xSpan, ySpan, pixelMatrix, inversePixelMatrix } = useScaleContext()
  const inverseTransform = useMemo(() => getInverseTransform(transform), [transform])

  const [dragging, setDragging] = useState(false)
  const [displayX, displayY] = vec.trans(vec.trans(point, transform), pixelMatrix)

  const pickup = useRef<Vector2>([0, 0])

  const bind = useDrag(({ event, down, movement: pixelMovement, first }) => {
    event?.stopPropagation()
    setDragging(down)

    if (first) pickup.current = vec.trans(point, transform)
    if (vec.mag(pixelMovement) === 0) return

    const movement = vec.trans(pixelMovement, inversePixelMatrix)
    const newPoint = constrain(vec.trans(vec.add(pickup.current, movement), inverseTransform))

    onMove(newPoint)
  })

  function handleKeyDown(event: React.KeyboardEvent) {
    const small = event.altKey || event.metaKey || event.shiftKey

    let span: number
    let testDir: Vector2

    switch (event.key) {
      case "ArrowLeft":
        span = xSpan
        testDir = [-1, 0]
        event.preventDefault()
        break
      case "ArrowRight":
        span = xSpan
        testDir = [1, 0]
        event.preventDefault()
        break
      case "ArrowUp":
        span = ySpan
        testDir = [0, 1]
        event.preventDefault()
        break
      case "ArrowDown":
        span = ySpan
        testDir = [0, -1]
        event.preventDefault()
        break
      default:
        return
    }

    const divisions = small ? 200 : 50
    const min = span / (divisions * 2)
    const tests = range(span / divisions, span / 2, span / divisions)

    for (const dx of tests) {
      // Transform the test back into the point's coordinate system
      const testMovement = vec.scale(testDir, dx)
      const testPoint = constrain(
        vec.trans(vec.add(vec.trans(point, transform), testMovement), inverseTransform)
      )

      if (vec.dist(testPoint, point) > min) {
        onMove(testPoint)
        break
      }
    }
  }

  return (
    <g {...bind()} className="draggable-hitbox">
      <circle cx={displayX} cy={displayY} r={30} fill="transparent"></circle>
      <circle
        cx={displayX}
        cy={displayY}
        r={6}
        fill={color}
        stroke={color}
        strokeOpacity={0.25}
        className={`draggable ${dragging ? "dragging" : ""}`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      ></circle>
    </g>
  )
}

function getInverseTransform(transform: Matrix) {
  const invert = matrixInvert(transform)
  invariant(
    invert !== null,
    "Could not invert transform matrix. Your movable point's transformation matrix might be degenerative (mapping 2D space to a line)."
  )
  return invert
}

export default MovablePoint
