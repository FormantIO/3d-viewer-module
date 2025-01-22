import {
  IQuaternion,
  IVector3,
  IColorRGBA,
  IMarker3DArray,
} from "@formant/data-sdk";

export type BaseGeometry = {
  id: string;
  position: IVector3;
  rotation: IQuaternion;
  scale: IVector3;
  color: IColorRGBA;
  dirty: boolean;
};

export type LineList = BaseGeometry & {
  type: "line_list";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type Arrow = BaseGeometry & {
  type: "arrow";
  points: IVector3[];
};

export type Cube = BaseGeometry & {
  type: "cube";
};

export type Sphere = BaseGeometry & {
  type: "sphere";
};

export type Text = BaseGeometry & {
  type: "text";
  text: string;
};

export type Cylinder = BaseGeometry & {
  type: "cylinder";
};

export type Points = BaseGeometry & {
  type: "points";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type TriangleList = BaseGeometry & {
  type: "triangle_list";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type CubeList = BaseGeometry & {
  type: "cube_list";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type SphereList = BaseGeometry & {
  type: "sphere_list";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type LineStrip = BaseGeometry & {
  type: "line_strip";
  points: IVector3[];
  colors?: IColorRGBA[];
};

export type Geometry =
  | Arrow
  | Cube
  | Sphere
  | Text
  | LineList
  | Cylinder
  | Points
  | TriangleList
  | CubeList
  | SphereList
  | LineStrip;

function reifyVector3(v: IVector3) {
  if (v.x === undefined) {
    v.x = 0;
  }
  if (v.y === undefined) {
    v.y = 0;
  }
  if (v.z === undefined) {
    v.z = 0;
  }
}

function reifyQuaternion(v: IQuaternion) {
  if (v.x === undefined) {
    v.x = 0;
  }
  if (v.y === undefined) {
    v.y = 0;
  }
  if (v.z === undefined) {
    v.z = 0;
  }
  if (v.w === undefined) {
    v.w = 1;
  }
}

function reifyColor(v: IColorRGBA) {
  if (v.r === undefined) {
    v.r = 0;
  }
  if (v.g === undefined) {
    v.g = 0;
  }
  if (v.b === undefined) {
    v.b = 0;
  }
  if (v.a === undefined) {
    v.a = 1;
  }
}

export class GeometryWorld {
  geometry: Map<string, Map<number, Geometry>> = new Map();

  deleteAll() {
    this.geometry = new Map();
  }

  processMarkers(markers: IMarker3DArray) {
    markers.markers.forEach((marker) => {
      let ns = this.geometry.get(marker.ns);
      if (ns === undefined) {
        ns = new Map();
        this.geometry.set(marker.ns, ns);
      }
      const { action, type } = marker;
      const isAddOrModify = action === 0;
      const isDelete = action === 2;
      const isDeleteAll = action === 3;
      if (isDeleteAll) {
        this.geometry = new Map();
      } else {
        if (marker.id === undefined) {
          marker.id = 0;
        }
        // position can be called translation
        // orientation can be called rotation
        const position = marker.pose.position || marker.pose.translation;
        const orientation = marker.pose.orientation || marker.pose.rotation;
        reifyVector3(position || { x: 0, y: 0, z: 0 });
        reifyQuaternion(orientation || { x: 0, y: 0, z: 0, w: 1 });
        reifyVector3(marker.scale);
        reifyColor(marker.color);
        if (marker.points) {
          marker.points.forEach((p) => {
            reifyVector3(p);
          });
        }

        const typeIdMap = {
          0: "arrow",
          1: "cube",
          2: "sphere",
          3: "cylinder",
          4: "line_strip",
          5: "line_list",
          6: "cube_list",
          7: "sphere_list",
          8: "points",
          9: "text",
          10: "mesh_resource",
          11: "triangle_list",
        };

        const typeName = typeIdMap[type as keyof typeof typeIdMap];
        if (typeName === "mesh_resource") {
          console.warn("Mesh resource markers are not supported");
          return;
        }
        if (typeName && !isDeleteAll) {
          const geometry: Geometry = {
            id: `${marker.ns}_${marker.id}`,
            type: typeName as any,
            position: marker.pose.position ||
              marker.pose.translation || { x: 0, y: 0, z: 0 },
            rotation: marker.pose.orientation ||
              marker.pose.rotation || { x: 0, y: 0, z: 0, w: 1 },
            scale: marker.scale,
            color: marker.color,
            dirty: true,
          };
          if (marker.points) {
            (geometry as any).points = marker.points;
          }
          if (marker.text) {
            (geometry as any).text = marker.text;
          }
          if (marker.colors) {
            (geometry as any).colors = marker.colors;
          }
          ns.set(marker.id, geometry);

          if (isDelete) {
            ns.delete(marker.id);
          }
        }
      }
    });
  }

  getAllGeometry() {
    const result: Geometry[] = [];
    this.geometry.forEach((ns) => {
      ns.forEach((marker) => {
        result.push(marker);
      });
    });
    return result;
  }
}
