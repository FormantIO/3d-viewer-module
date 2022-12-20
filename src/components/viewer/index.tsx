import { Measure } from "@formant/ui-sdk";
import * as React from "react";
import { Component } from "react";
import { Howler } from "howler";
import * as THREE from "three";
import { IUniverseData } from "@formant/universe-core";
import {
  PointLight,
  Vector3,
  WebGLRenderer,
  HemisphereLight,
  Raycaster,
  Object3D,
  ACESFilmicToneMapping,
} from "three";
import styled from "styled-components";
import { RGBELoader } from "../../../three-utils/loaders/RGBELoader";
import { OrbitControls } from "../../../three-utils/controls/OrbitControls";
import { TransformControls } from "../../../three-utils/controls/TransformControls";
import { defined, definedAndNotNull } from "../../../common/defined";
import { LayerRegistry } from "../../layers/LayerRegistry";
import { TransformLayer } from "../../layers/TransformLayer";
import {
  injectLayerFieldValues,
  LayerFieldType,
  LayerFieldTypeMap,
} from "../../model/LayerField";
import {
  findSceneGraphElement,
  getSceneGraphElementParent,
  Positioning,
  SceneGraph,
} from "../../model/SceneGraph";
import { TreePath, treePathEquals } from "../../model/ITreeElement";
import { Color } from "../../../common/Color";

const MeasureContainer = styled.div`
  width: 100%;
  height: 100vh;

  background: #1c1e2c;

  > div {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
`;

export interface IUniverseViewerProps {
  universeData: IUniverseData;
  onSceneGraphElementEdited: (path: TreePath, transform: Vector3) => void;
}
export class UniverseViewer extends Component<IUniverseViewerProps> {
  private element: HTMLElement | null = null;

  private renderer: WebGLRenderer | undefined;

  private scene: THREE.Scene;

  private root: THREE.Object3D = new THREE.Object3D();

  private camera: THREE.PerspectiveCamera;

  private floor: THREE.Mesh;

  private pathToLayer: Map<string, TransformLayer> = new Map();

  private editControls: TransformControls | undefined;

  private orbitControls: OrbitControls | undefined;

  private attachedPath: TreePath | undefined;

  private raycaster = new Raycaster();

  private pointer = new THREE.Vector2();

  private pointerDirty = false;

  private clock = new THREE.Clock();

  constructor(props: IUniverseViewerProps) {
    super(props);
    Howler.volume(1);
    this.scene = new THREE.Scene();
    this.scene.add(this.root);
    this.root.rotateX(-Math.PI / 2);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 0;
    this.camera.position.x = 0;
    this.camera.position.y = 25;
    this.scene.add(this.camera);

    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000, 2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      })
    );
    this.root.add(this.floor);

    new RGBELoader().load(
      "https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr",
      (hdrEquirect: any) => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

        this.scene.environment = hdrEquirect;
      }
    );

    const accentColor1 = defined(Color.fromString("#18d2ff")).toString();
    const accentColor2 = defined(Color.fromString("#ea719d")).toString();
    const skyColor = defined(Color.fromString("#f8f9fc")).toString();
    const groundColor = defined(Color.fromString("#282f45")).toString();

    const d = 2.8;
    const o = new Object3D();
    const accentLight1 = new PointLight(accentColor1, 0.3 * d, 0, 0);
    accentLight1.position.set(1000, 1000, 1000);
    o.add(accentLight1);

    const accentLight2 = new PointLight(accentColor2, 0.7 * d, 0, 0);
    accentLight2.position.set(-1000, -1000, 1000);
    o.add(accentLight2);

    const ambientLight = new HemisphereLight(skyColor, groundColor, 0.5 * d);
    o.add(ambientLight);
    this.root.add(o);
  }

  public componentDidMount() {
    const { element } = this;
    if (element) {
      this.renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      this.renderer.sortObjects = false;
      this.renderer.xr.enabled = true;

      this.renderer.physicallyCorrectLights = true;
      this.renderer.toneMapping = ACESFilmicToneMapping;

      element.appendChild(this.renderer.domElement);

      element.addEventListener("pointermove", this.onPointerMove);
      element.addEventListener("pointerdown", this.onPointerDown);
      element.addEventListener("pointerup", this.onPointerUp);
      element.addEventListener("pointerenter", this.onPointerEnter);
      element.addEventListener("pointerleave", this.onPointerLeave);
      element.addEventListener("wheel", this.onPointerWheel);

      const { devicePixelRatio } = window;
      const { offsetWidth: width, offsetHeight: height } = element;
      this.renderer.setPixelRatio(devicePixelRatio);
      this.renderer.setSize(width, height);

      this.orbitControls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      this.orbitControls.update();
      this.editControls = new TransformControls(
        this.camera,
        this.renderer.domElement
      );
      window.addEventListener("keydown", this.onKeyDown);
      this.editControls.addEventListener("change", this.onEditControlsChange);
      this.editControls.addEventListener("dragging-changed", (event) => {
        if (this.orbitControls) this.orbitControls.enabled = !event.value;
      });
      this.scene.add(this.editControls);
      this.renderer.setAnimationLoop(() => {
        const renderer = defined(this.renderer);

        this.raycaster.setFromCamera(this.pointer, this.camera);
        if (this.pointerDirty) {
          this.notifyRaycasterChanged();
          this.pointerDirty = false;
        }
        if (this.orbitControls) {
          renderer.render(this.scene, this.camera);
          this.orbitControls.update();
        }

        this.notifyUpdate(this.clock.getDelta());

        Howler.pos(
          this.camera.position.x,
          this.camera.position.y,
          this.camera.position.z
        );
        let lookAt = new Vector3(0, 0, -1);
        let up = new Vector3(0, 1, 0);
        lookAt = lookAt.applyQuaternion(this.camera.quaternion);
        up = up.applyQuaternion(this.camera.quaternion);
        Howler.orientation(lookAt.x, lookAt.y, lookAt.z, up.x, up.y, up.z);
      });
    }
  }

  public componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  onPointerMove = (event: PointerEvent) => {
    if (this.renderer) {
      this.pointer.x =
        (event.offsetX / this.renderer.domElement.offsetWidth) * 2 - 1;
      this.pointer.y =
        -(event.offsetY / this.renderer.domElement.offsetHeight) * 2 + 1;
      this.pointerDirty = true;
    }
  };

  onPointerDown = (event: PointerEvent) => {
    const { button } = event;
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerDown(this.raycaster, button);
    });
  };

  onPointerUp = (event: PointerEvent) => {
    const { button } = event;
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerUp(this.raycaster, button);
    });
  };

  onPointerEnter = (_event: PointerEvent) => {
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerEnter(this.raycaster);
    });
  };

  onPointerLeave = (_event: PointerEvent) => {
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerLeave(this.raycaster);
    });
  };

  onPointerWheel = (event: WheelEvent) => {
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerWheel(this.raycaster, event.deltaY);
    });
  };

  onKeyDown = (event: KeyboardEvent) => {
    const c = defined(this.editControls);
    switch (event.key) {
      case "g":
        c.setMode("translate");
        break;
      case "r":
        c.setMode("rotate");
        break;
      case "s":
        c.setMode("scale");
        break;
      default:
        break;
    }
  };

  private onEditControlsChange = () => {
    const { editControls } = this;
    if (editControls) {
      const { attachedPath } = this;
      if (attachedPath) {
        const { object } = editControls;
        if (object) {
          const { position } = object;

          this.props.onSceneGraphElementEdited(attachedPath, position);
        }
      }
    }
  };

  getCurrentCamera = () => this.camera;

  getFloor = () => this.floor;

  getTransformLayerById = (layerId: string) => {
    const layer = this.pathToLayer.get(layerId);
    return defined(layer);
  };

  private onResize = (width: number, height: number) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.orbitControls) {
      this.orbitControls.update();
    }
    this.renderer?.setSize(width, height);
  };

  private notifyRaycasterChanged() {
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onPointerMove(this.raycaster);
    });
  }

  private notifyUpdate(delta: number) {
    Array.from(this.pathToLayer.values()).forEach((_) => {
      defined(_.contentNode).onUpdate(delta);
    });
  }


  public removeSceneGraphItem(sceneGraph: SceneGraph, path: TreePath) {
    if (this.attachedPath && treePathEquals(path, this.attachedPath)) {
      this.toggleEditing(sceneGraph, path, false);
    }
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));
    const layer = defined(this.pathToLayer.get(el.id));

    defined(layer.contentNode).destroy();
    definedAndNotNull(layer.parent).remove(layer);
    this.pathToLayer.delete(el.id);
  }

  public addSceneGraphItem(
    sceneGraph: SceneGraph,
    path: TreePath,
    deviceId?: string
  ) {
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));

    const fields = LayerRegistry.getFields(el.type);
    injectLayerFieldValues(fields, el.fieldValues);
    const layer = LayerRegistry.createDefaultLayer(
      el.id,
      el.type,
      this.props.universeData,
      deviceId,
      el.dataSources,
      fields,
      this.getCurrentCamera,
      this.getTransformLayerById,
      this.getFloor
    );
    if (el.position.type === "manual") {
      layer.position.set(el.position.x, el.position.y, el.position.z);
    }
    const parent = getSceneGraphElementParent(sceneGraph, path);
    if (parent) {
      const o = defined(this.pathToLayer.get(parent.id));
      o.add(layer);
    } else {
      this.root.add(layer);
    }
    this.pathToLayer.set(el.id, layer);
    this.toggleVisible(sceneGraph, path, el.visible);
  }

  public updateLayerVisibility(id: string, visible: boolean) {
    const layer = defined(this.pathToLayer.get(id));
    if (layer.visible !== visible) {
      layer.visible = visible;
      defined(layer.contentNode).onVisibilityChanged(visible);
    }
  }

  public recenter() {
    if (this.orbitControls) {
      this.orbitControls.reset();
    }
  }

  public notifyFieldChanged(
    sceneGraph: SceneGraph,
    path: TreePath,
    fieldId: string,
    value: LayerFieldTypeMap[LayerFieldType]
  ) {
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));
    const o = defined(this.pathToLayer.get(el.id));
    defined(o.contentNode).onFieldChanged(fieldId, value);
  }

  public toggleVisible(
    sceneGraph: SceneGraph,
    path: TreePath,
    visible: boolean
  ) {
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));
    const o = defined(this.pathToLayer.get(el.id));
    o.setLayerVisibility(visible);
  }

  public toggleEditing(
    sceneGraph: SceneGraph,
    path: TreePath,
    editing: boolean
  ) {
    const c = defined(this.editControls);
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));
    const o = defined(this.pathToLayer.get(el.id));
    if (editing) {
      c.setMode("translate");
      c.attach(o);
      this.attachedPath = path;
    } else {
      c.detach();
      this.attachedPath = undefined;
    }
  }

  public updatePositioning(
    sceneGraph: SceneGraph,
    path: TreePath,
    position: Positioning,
    scale?: { x: number; y: number; z: number }
  ) {
    const el = definedAndNotNull(findSceneGraphElement(sceneGraph, path));
    const o = defined(this.pathToLayer.get(el.id));
    o.setPositioning(this.props.universeData, position, scale);
  }

  public render() {
    return (
      <MeasureContainer>
        <Measure onResize={this.onResize}>
          <div
            ref={(_) => {
              this.element = defined(_);
            }}
          />
        </Measure>
      </MeasureContainer>
    );
  }
}
