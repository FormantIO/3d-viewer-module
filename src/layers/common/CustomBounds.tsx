import * as React from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { CameraControlsProps } from '@react-three/drei'

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
  fit(boxToFit?: THREE.Box3 | undefined): any;
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
const TAU = Math.PI * 2;
const getAbsoluteAngle = (targetAngle: number, sourceAngle: number): number => {
  const angle = targetAngle - sourceAngle
  return THREE.MathUtils.euclideanModulo(angle + Math.PI, TAU) - Math.PI;
}

const context = React.createContext<BoundsApi>(null!)
export function Bounds({ children, damping = 6, fit, clip, observe, margin = 1.2, eps = 0.01, onFit }: BoundsProps) {
  const ref = React.useRef<THREE.Group>(null!)
  const { camera, invalidate, size, scene, get } = useThree()

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
        if (ref.current && ref.current.children.length > 0) {
          const targetGroup = ref.current.children[0]; // target is a group containing everything, target.children[0] is the actual target
          const mapGroup = targetGroup.children[1] || new THREE.Group();
          const visualizationsGroup = targetGroup.children[2] || new THREE.Group();
          mapGroup.updateWorldMatrix(true, true);
          visualizationsGroup.updateWorldMatrix(true, true);
          const tempBox = new THREE.Box3();
          // traverse all children except axis and targetGroup
          [...mapGroup.children, ...visualizationsGroup.children].forEach((child: THREE.Object3D) => {
            if (child.name !== 'axis' && child.visible) {
              const childBox = new THREE.Box3();
              childBox.setFromObject(child);
              tempBox.union(childBox);

            }
          });
          box.copy(tempBox);
        }
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
        const controls = get().controls as CameraControlsProps;
        setDistance(distance);
        if (controls) {
          controls.maxDistance = distance * 10;
          controls.minDistance = 0.5;
        }
        camera.far = Math.max(distance * 100, 100);
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
      fit(boxToFit?: THREE.Box3) {
        const controls = get().controls as CameraControlsProps;
        if (controls) {
          const newBox = new THREE.Box3();
          newBox.copy(box);
          if (boxToFit && !boxToFit.isEmpty()) {
            newBox.copy(boxToFit);
          }
          const boxCenter = newBox.getCenter(new THREE.Vector3());
          const { distance } = getSize();

          controls.moveTo?.(boxCenter.x, boxCenter.y, distance, true);
          controls.setTarget?.(boxCenter.x, boxCenter.y, 0, true);
          controls.rotate?.(getAbsoluteAngle(0, controls.azimuthAngle || 0), -getAbsoluteAngle(-Math.PI, controls.polarAngle || 0), true);

          controls.fitToBox?.(newBox, true, { cover: false, paddingTop: 0.3, paddingBottom: 0.3, paddingLeft: 0.3, paddingRight: 0.3 }).then(() => {
            // only save the state of scene boxes
            if (!boxToFit) {
              controls.saveState?.();
            }
          });
        }
        return this;
      },
    }
  }, [box, camera, margin, damping, invalidate])

  const reset = () => {
    const oldBox = new THREE.Box3()
    const newBox = new THREE.Box3()
    oldBox.copy(box);
    api.refresh();
    newBox.copy(box);
    if (!compareBox3(oldBox, newBox)) {
      api.clip().fit()
    }
  }

  const fitToBox = (elementId: string, isDevice = false) => {
    const group = ref.current;
    const target = group.getObjectByName(elementId);
    const boundingBox = new THREE.Box3();
    if (target) {
      boundingBox.expandByObject(target);
      if (isDevice) {
        boundingBox.setFromCenterAndSize(boundingBox.getCenter(new THREE.Vector3()), new THREE.Vector3(1.5, 1.5, 0));
      }
      api.fit(boundingBox);
    }
  }

  // Scale pointer on window resize
  const count = React.useRef(0)
  React.useLayoutEffect(() => {
    if (observe || count.current++ === 0) {
      // schedule for next render to sync everything, sorry for the hack
      invalidate()
      setTimeout(() => {
        reset();
      }, 250);
    }
  }, [size, clip, fit, observe, camera, distance])

  // run refresh when listens to "updatebounds" event
  React.useEffect(() => {
    scene.addEventListener("updateBounds", () => {
      api.refresh();
    });
    scene.addEventListener("recenter", () => {
      api.fit();
    })
    scene.addEventListener("lookAtTargetId", (e) => {
      fitToBox(e.message, e.isDevice)
    })
    return () => {
      scene.removeEventListener("updateBounds", api.refresh());
      scene.removeEventListener("recenter", () => { api.fit() });
      scene.removeEventListener("lookAtTargetId", (e) => {
        fitToBox(e.message);
      })
    }
  }, []);

  // manually refresh after 5 seconds
  React.useEffect(() => {
    const timeout = setTimeout(reset, 5000)
    return () => clearTimeout(timeout)
  }, [api])

  return (
    <>
      <group ref={ref}>
        <context.Provider value={api}>{children}</context.Provider>
      </group>
    </>
  )
}

export function useBounds() {
  return React.useContext(context)
}