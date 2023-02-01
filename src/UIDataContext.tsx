import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { Device } from "@formant/data-sdk";

interface LayerData {
    name: string;
    id: string;
    visible: boolean;
}

interface UIContextData {
    layers: LayerData[];
    register: (name: string, id: string) => void;
    toggleVisibility: (id: string) => void;
}


export const UIDataContext =
    React.createContext<UIContextData>(
        {
            layers: [],
            register: (name: string, id: string) => { },
            toggleVisibility: (id: string) => { }
        }
    );


export function useUI(): UIContextData {
    const [layers, setLayers] = React.useState<LayerData[]>([]);

    const register = (name: string, id: string) => {
        console.log('registering', name, id, layers)
        setLayers((prevState) => [...prevState, { name, id, visible: true }]);
    }

    const toggleVisibility = (id: string) => {
        setLayers(layers.map((c) => {
            if (c.id === id) {
                return { ...c, visible: !c.visible };
            }
            return c;
        }));
    }

    return { layers, register, toggleVisibility };
}
