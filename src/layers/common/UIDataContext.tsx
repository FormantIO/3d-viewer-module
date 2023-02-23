import React, { useEffect } from "react";
import { LayerType } from "./LayerTypes";

export interface LayerData {
  name: string;
  id: string;
  type: LayerType;
  iconUrl?: string;
  visible: boolean;
  treePath?: number[];
}

interface UIContextData {
  layers: LayerData[];
  register: (
    name: string,
    id: string,
    type: LayerType,
    iconUrl?: string,
    treePath?: number[]
  ) => LayerData;
  toggleVisibility: (id: string) => void;
  cameraTargetId: string;
  setCameraTargetId: (id: string) => void;
  reset: () => void;
  toggleEditMode: () => void;
  isEditing: boolean;
}

export const UIDataContext = React.createContext<UIContextData>({
  layers: [],
  register: (
    name: string,
    id: string,
    type: LayerType,
    iconUrl?: string,
    treePath?: number[]
  ) => {
    return { name, id, type, visible: true, treePath };
  },
  toggleVisibility: (id: string) => {},
  cameraTargetId: "",
  setCameraTargetId: (id: string) => {},
  reset: () => {},
  toggleEditMode: () => {},
  isEditing: false,
});

export function useUI(): UIContextData {
  const [layers, setLayers] = React.useState<LayerData[]>([]);
  const [cameraTargetId, setCameraTargetId] = React.useState<string>("");
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const register = (
    name: string,
    id: string,
    type: LayerType,
    iconUrl?: string,
    treePath?: number[]
  ) => {
    const visible = JSON.parse(
      sessionStorage.getItem(`${id}-visible`) || "true"
    );
    const layer = { name, id, visible, type, treePath, iconUrl };
    if (layers.some((c) => c.id === id)) {
      return layer;
    }

    setLayers((prevState) => [...prevState, layer]);
    return layer;
  };

  const reset = () => {
    setLayers([]);
  };

  const toggleVisibility = (id: string) => {
    setLayers((prevState) => {
      return prevState.map((c) => {
        if (c.id === id) {
          const newVisibility = !c.visible;
          sessionStorage.setItem(`${c.id}-visible`, newVisibility.toString());
          if (c.treePath && c.treePath.length > 0) {
            const children = prevState.filter(
              (layer) =>
                layer.treePath &&
                c.treePath &&
                layer.treePath[0] === c.treePath[0] &&
                layer.treePath.length > c.treePath.length
            );
            if (!newVisibility) {
              children.forEach((child) => {
                sessionStorage.setItem(
                  `${child.id}-visible`,
                  child.visible.toString()
                );
                child.visible = false;
              });
            } else {
              children.forEach((child) => {
                child.visible = JSON.parse(
                  sessionStorage.getItem(`${child.id}-visible`) || "true"
                );
              });
            }
          }
          return { ...c, visible: newVisibility };
        }
        return c;
      });
    });
  };

  const toggleEditMode = () => {
    setIsEditing((prevState) => !prevState);
  };

  return {
    layers,
    register,
    toggleVisibility,
    cameraTargetId,
    setCameraTargetId,
    reset,
    toggleEditMode,
    isEditing,
  };
}
