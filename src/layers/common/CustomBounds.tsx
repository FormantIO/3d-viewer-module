import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsProps } from '@react-three/drei'

export type SizeProps = {
  box: THREE.Box3
  size: THREE.Vector3
  center: THREE.Vector3
  distance: number
}

export type BoundsApi = {
  getSize: () => SizeProps
  refresh(object?: THREE.Object3D | THREE.Box3): any
  clip(): any
  fit(): any
  to: ({ position, target }: { position: [number, number, number]; target?: [number, number, number] }) => any
}

export type BoundsProps = JSX.IntrinsicElements['group'] & {
  damping?: number
  fit?: boolean
  clip?: boolean
  observe?: boolean
  margin?: number
  eps?: number
  onFit?: (data: SizeProps) => void
}

type ControlsProto = {
  update(): void
  target: THREE.Vector3
  maxDistance: number
  addEventListener: (event: string, callback: (event: any) => void) => void
  removeEventListener: (event: string, callback: (event: any) => void) => void
}

const isOrthographic = (def: THREE.Camera): def is THREE.OrthographicCamera =>
  def && (def as THREE.OrthographicCamera).isOrthographicCamera
const isBox3 = (def: any): def is THREE.Box3 => def && (def as THREE.Box3).isBox3
const compareBox3 = (box1: THREE.Box3, box2: THREE.Box3): boolean => {
  const tolerance = 0.1
  const xDiff = Math.abs(box1.min.x - box2.min.x);
  const yDiff = Math.abs(box1.min.y - box2.min.y);
  const widthDiff = Math.abs(box1.max.x - box1.min.x - (box2.max.x - box2.min.x));
  const heightDiff = Math.abs(box1.max.y - box1.min.y - (box2.max.y - box2.min.y));

  return xDiff <= tolerance && yDiff <= tolerance && widthDiff <= tolerance && heightDiff <= tolerance;
};

const context = React.createContext<BoundsApi>(null!)
export function Bounds({ children, damping = 6, fit, clip, observe, margin = 1.2, eps = 0.01, onFit }: BoundsProps) {
  const ref = React.useRef<THREE.Group>(null!)
  const { camera, invalidate, size, controls: controlsImpl, scene } = useThree()
  const controls = controlsImpl as CameraControlsProps

  const onFitRef = React.useRef<((data: SizeProps) => void) | undefined>(onFit)
  onFitRef.current = onFit

  function equals(a: THREE.Vector3, b: THREE.Vector3) {
    return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps
  }

  function damp(v: THREE.Vector3, t: THREE.Vector3, lambda: number, delta: number) {
    v.x = THREE.MathUtils.damp(v.x, t.x, lambda, delta)
    v.y = THREE.MathUtils.damp(v.y, t.y, lambda, delta)
    v.z = THREE.MathUtils.damp(v.z, t.z, lambda, delta)
  }

  const [current] = React.useState(() => ({
    animating: false,
    focus: new THREE.Vector3(),
    camera: new THREE.Vector3(),
    zoom: 1,
  }))
  const [goal] = React.useState(() => ({ focus: new THREE.Vector3(), camera: new THREE.Vector3(), zoom: 1 }))

  const [box] = React.useState(() => new THREE.Box3())

  const [distance, setDistance] = React.useState(10)

  const api: BoundsApi = React.useMemo(() => {
    function getSize() {
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const fitHeightDistance = isOrthographic(camera)
        ? maxSize * 4
        : maxSize * margin / (2 * Math.tan((Math.PI * camera.fov) / 180))
      const fitWidthDistance = isOrthographic(camera) ? maxSize * 4 : fitHeightDistance / camera.aspect
      const distance = Math.max(fitHeightDistance, fitWidthDistance);
      return { box, size, center, distance }
    }

    return {
      getSize,
      refresh() {
        const oldBox = box.clone();
        const targetGroup = ref.current.children[0]; // target is a group containing everything, target.children[0] is the actual target
        const mapGroup = targetGroup.children[1];
        const visualizationsGroup = targetGroup.children[2];
        mapGroup.updateWorldMatrix(true, true);
        visualizationsGroup.updateWorldMatrix(true, true);
        const tempBox = new THREE.Box3();
        // traverse all children except axis and targetGroup
        [...mapGroup.children, ...visualizationsGroup.children].forEach((child: THREE.Object3D) => {
          if (child.name !== 'axis' && child.visible) {
            const childBox = new THREE.Box3();
            console.log(child);
            childBox.setFromObject(child);
            tempBox.union(childBox);

          }
        });
        box.copy(tempBox);
        if (box.isEmpty()) {
          box.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(1, 1, 0))
        }
        if (!compareBox3(box, oldBox)) {
          api.clip().fit();
        }
        return this
      },
      clip() {
        const { distance } = getSize();
        setDistance(distance);
        console.log("distance", distance);
        controls.maxDistance = distance * 10;
        controls.minDistance = distance / 100;
        console.log(controls);
        //camera.near = distance / 1000
        camera.far = distance * 100
        camera.updateProjectionMatrix()
        invalidate()
        return this
      },
      to({ position, target }: { position: [number, number, number]; target?: [number, number, number] }) {
        current.camera.copy(camera.position)
        const { center } = getSize()
        goal.camera.set(...position)

        if (target) {
          goal.focus.set(...target)
        } else {
          goal.focus.copy(center)
        }

        if (damping) {
          current.animating = true
        } else {
          camera.position.set(...position)
        }
        return this
      },
      fit() {
        if (controls) {
          console.log("fitting");
          const boxCenter = box.getCenter(new THREE.Vector3());
          const { distance } = getSize();
          const newBox = new THREE.Box3();
          newBox.copy(box);
          controls.moveTo?.(boxCenter.x, boxCenter.y, distance, true);
          controls.setTarget?.(boxCenter.x, boxCenter.y, 0, true);
          controls.rotateTo?.(0, -Math.PI, true);
          controls.fitToBox?.(newBox, true, { cover: false, paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.5, paddingRight: 0.5 });
        }
        return this;
      },
    }
  }, [box, camera, controls, margin, damping, invalidate])

  React.useLayoutEffect(() => {
    if (controls) {
      // Try to prevent drag hijacking
      const callback = () => (current.animating = false)
      controls.addEventListener('start', callback)
      return () => controls.removeEventListener('start', callback)
    }
  }, [controls])

  const reset = () => {
    const oldBox = new THREE.Box3()
    const newBox = new THREE.Box3()
    oldBox.copy(box);
    api.refresh();
    newBox.copy(box);
    console.log(oldBox, newBox);
    console.log(controls.getPosition?.(new THREE.Vector3()));
    console.log(box.getCenter(new THREE.Vector3()));
    if (!compareBox3(oldBox, newBox)) {
      console.warn("bounds changed due to reset");
      api.clip().fit()
    }
  }


  // Scale pointer on window resize
  const count = React.useRef(0)
  React.useLayoutEffect(() => {
    if (observe || count.current++ === 0) {
      reset();
    }
  }, [size, clip, fit, observe, camera, controls, distance])

  // run refresh when listens to "updatebounds" event
  React.useEffect(() => {
    scene.addEventListener("updateBounds", () => {
      console.log("updateBounds event!!!!!");
      api.refresh();
    });
    scene.addEventListener("recenter", () => {
      api.fit();
    })
    return () => {
      scene.removeEventListener("updateBounds", reset);
    }
  }, []);

  // manually refresh after 5 seconds
  React.useEffect(() => {
    const timeout = setTimeout(reset, 5000)
    return () => clearTimeout(timeout)
  }, [api])

  return (
    <>
      <group ref={ref} onUpdate={() => { console.log(" alskdjaslkdjaskldj") }}>
        <context.Provider value={api}>{children}</context.Provider>
      </group>
      <box3Helper args={[box]} />
    </>
  )
}

export function useBounds() {
  return React.useContext(context)
}