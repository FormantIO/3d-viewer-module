import { IQuaternion, IVector3, IColorRGBA } from "@formant/data-sdk";
import { IMarker3DArray } from "@formant/universe-core";

export type BaseGeometry = {
  id: string;
  position: IVector3;
  rotation: IVector3;
  scale: IVector3;
  color: IColorRGBA;
  dirty: boolean;
};

export type LineList = BaseGeometry & {
  type: "line_list";
  points: IVector3[];
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

export type Geometry = Arrow | Cube | Sphere | Text | LineList;

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
        reifyVector3(marker.pose.position);
        reifyQuaternion(marker.pose.orientation);
        reifyVector3(marker.scale);
        reifyColor(marker.color);
        if (marker.points) {
          marker.points.forEach((p) => {
            reifyVector3(p);
          });
        }

        if (type === 5) {
          if (isAddOrModify) {
            ns.set(marker.id, {
              id: `${marker.ns}_${marker.id}`,
              type: "line_list",
              position: marker.pose.position,
              rotation: marker.pose.orientation,
              scale: marker.scale,
              color: marker.color,
              points: marker.points,
              dirty: true,
            });
          } else if (isDelete) {
            ns.delete(marker.id);
          }
        } else if (type === 1) {
          if (isAddOrModify) {
            ns.set(marker.id, {
              id: `${marker.ns}_${marker.id}`,
              type: "cube",
              position: marker.pose.position,
              rotation: marker.pose.orientation,
              scale: marker.scale,
              color: marker.color,
              dirty: true,
            });
          } else if (isDelete) {
            ns.delete(marker.id);
          }
        } else if (type === 2) {
          if (isAddOrModify) {
            ns.set(marker.id, {
              id: `${marker.ns}_${marker.id}`,
              type: "sphere",
              position: marker.pose.position,
              rotation: marker.pose.orientation,
              scale: marker.scale,
              color: marker.color,
              dirty: true,
            });
          } else if (isDelete) {
            ns.delete(marker.id);
          }
        } else if (type === 0) {
          if (isAddOrModify) {
            ns.set(marker.id, {
              id: `${marker.ns}_${marker.id}`,
              type: "arrow",
              position: marker.pose.position,
              rotation: marker.pose.orientation,
              scale: marker.scale,
              color: marker.color,
              points: marker.points,
              dirty: true,
            });
          } else if (isDelete) {
            ns.delete(marker.id);
          }
        } else if (type === 9) {
          if (isAddOrModify) {
            ns.set(marker.id, {
              id: `${marker.ns}_${marker.id}`,
              type: "text",
              position: marker.pose.position,
              rotation: marker.pose.orientation,
              scale: marker.scale,
              color: marker.color,
              text: marker.text || "",
              dirty: true,
            });
          } else if (isDelete) {
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
