import React from "react";
import { LayerType } from "./LayerTypes";

interface LayerData {
    name: string;
    id: string;
    type: LayerType;
    visible: boolean;
    treePath?: number[];
}

interface UIContextData {
    layers: LayerData[];
    register: (name: string, id: string, type: LayerType, treePath?: number[]) => void;
    toggleVisibility: (id: string) => void;
    cameraTargetId: string;
    setCameraTargetId: (id: string) => void;
}


export const UIDataContext =
    React.createContext<UIContextData>(
        {
            layers: [],
            register: (name: string, id: string, type: LayerType, treePath?: number[]) => { },
            toggleVisibility: (id: string) => { },
            cameraTargetId: '',
            setCameraTargetId: (id: string) => { }
        }
    );


export function useUI(): UIContextData {
    const [layers, setLayers] = React.useState<LayerData[]>([]);
    const [cameraTargetId, setCameraTargetId] = React.useState<string>('');

    const register = (name: string, id: string, type: LayerType, treePath?: number[]) => {
        console.log('registering', name, id, treePath, layers)
        setLayers((prevState) => [...prevState, { name, id, visible: true, type, treePath }]);
    }

    const toggleVisibility = (id: string) => {
        setLayers(prevState => {
            return prevState.map(c => {
                if (c.id === id) {
                    const newVisibility = !c.visible;
                    if (c.treePath && c.treePath.length > 0) {
                        const children = prevState.filter(layer => layer.treePath && c.treePath && layer.treePath[0] === c.treePath[0] && layer.treePath.length > c.treePath.length);
                        if (!newVisibility) {
                            children.forEach(child => {
                                sessionStorage.setItem(`${child.id}-visible`, child.visible.toString());
                                child.visible = false;
                            });
                        } else {
                            children.forEach(child => {
                                child.visible = JSON.parse(sessionStorage.getItem(`${child.id}-visible`) || 'true');
                            });
                        }
                    }
                    return { ...c, visible: newVisibility };
                }
                return c;
            });
        });
    }

    return { layers, register, toggleVisibility, cameraTargetId, setCameraTargetId };
}
