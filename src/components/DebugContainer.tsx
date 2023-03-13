import styled from "styled-components";
import React, { useCallback } from "react";
import { Viewer3DConfiguration } from "../config";
import { IUniverseData } from "@formant/universe-core";
import { UniverseDataContext } from "../layers/common/UniverseDataContext";
import { Universe } from "../layers/common/Universe";
import getUuidByString from "uuid-by-string";
import { buildScene } from "../buildScene";
import HighlightedTextarea from "./HighlightedTextArea";


const DebugWrapper = styled.div`
    height: 100%;
    width: 100%;
    position: relative;

    marquee {
        color: white;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
    }
`;

const ButtonsContainer = styled.div`

    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.2);
    width: 100%;

    button {
        background-color: rgba(255, 255, 255, 0.7);
        border: 1px solid #000;
        border-radius: 5px;
        padding: 5px;
        cursor: pointer;
    }
`;

interface IJSONContainer {
    isJSONValid: boolean;
}

const JSONContainer = styled.div<IJSONContainer>`

    position: absolute;
    top: 0;
    right: 0;
    z-index: 11;
    display: flex;
    width: 50%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.8);

    textarea {
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 5px;
        padding: 5px;
        font-family: monospace;
        white-space: nowrap;
        tab-size: 1;

        &:focus-visible {
            outline: ${props => props.isJSONValid ? '2px solid #00ff00aa' : '2px solid #ff0000aa'};
        }
    }
`;

const AddMenuContainer = styled.div`
    position: absolute;
    bottom: 47px;
    left: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.2);

    label {
        color: white;
    }
`;

interface IDebugContainer {
    config?: Viewer3DConfiguration;
    universeData: IUniverseData;
}

const defaultConfig = `
    {
  "maps": [
    {
      "mapType": "Ground Plane",
      "name": "ground"
    }
  ],
  "visualizations": [
    
  ]
}
`;

const DebugContainer = (props: IDebugContainer) => {
    const [showJSONEditor, setShowJSONEditor] = React.useState(false);
    const [showAddMenu, setShowAddMenu] = React.useState(false);
    const [config, setConfig] = React.useState<Viewer3DConfiguration>(JSON.parse(defaultConfig));
    const [editorContent, setEditorContent] = React.useState(defaultConfig);
    const [isJSONValid, setIsJSONValid] = React.useState(true);
    const [highlightedText, setHighlightedText] = React.useState('');
    const [layerType, setLayerType] = React.useState('map');
    const [positioningType, setPositioningType] = React.useState('fixed');
    const [useDatasource, setUseDatasource] = React.useState(false);

    const addNewLayer = (type: string, positioning: string, useDatasource: boolean) => {
        setShowAddMenu(false);
        const newConfig = JSON.parse(JSON.stringify(config));
        let positioningObj = {};
        let newLayer = {};
        switch (positioning) {
            case 'fixed':
                positioningObj = {
                    positioningType: 'fixed',
                    x: 0,
                    y: 0,
                    z: 0
                };
                break;
            case 'gps':
                positioningObj = {
                    positioningType: 'gps',
                    latitude: 0,
                    longitude: 0,
                    altitude: 0
                };
                break;
            case 'odometry':
                positioningObj = {
                    localizationWorldToLocal: true,
                    positioningType: "Odometry",
                    localizationStream: "localizationStream"
                };
                break;
            default:
                break;
        };

        switch (type) {
            case 'map':
                newLayer = {
                    name: 'new-map-layer',
                    mapType: 'World Map',
                    longitude: "-90",
                    latitude: "40",
                    mapSize: "150",
                    positioning: positioningObj,
                    datasource: useDatasource ? {
                        latestDataPoint: false,
                        telemetryStreamName: 'telemetryStream'
                    } : undefined
                }
                newConfig.devices[0].mapLayers.push(newLayer);
                break;
            case 'ground':
                newLayer = {
                    name: 'new-ground-layer',
                    mapType: 'Ground Plane',
                    positioning: positioningObj
                }
                newConfig.maps.push(newLayer);
                break;
            default:

                break;
        }
        //setHighlightedText(JSON.stringify(newLayer, null, 2));
        setConfig(newConfig);
        setEditorContent(JSON.stringify(newConfig, null, 2));
        setShowJSONEditor(true);
    };


    const copyConfigToEditor = () => {
        setEditorContent(JSON.stringify(props.config, null, 2));
    };

    const handleJSONEditorChange = (value: string) => {
        setEditorContent(value);
        try {
            JSON.parse(value);
            setIsJSONValid(true);
        } catch (e) {
            setIsJSONValid(false);
        }
    };

    const saveJSONEditor = () => {
        try {
            const parsedConfig = JSON.parse(editorContent);
            setConfig(parsedConfig);
            setShowJSONEditor(false);
        } catch (e) {
            console.error(e);
        }
    };

    const scene = useCallback(
        (config: Viewer3DConfiguration) => (
            <UniverseDataContext.Provider value={props.universeData}>
                <Universe configHash={getUuidByString(JSON.stringify(config))} key={getUuidByString(JSON.stringify(config))} >
                    <ambientLight />
                    {buildScene(config, 'debug-device')};
                </Universe>
            </UniverseDataContext.Provider>
        ),
        [props.universeData, config]
    );

    return (
        <DebugWrapper>
            {/* @ts-ignore*/}
            <marquee>Debug mode!</marquee>
            {scene(config)}
            <ButtonsContainer>
                <button onClick={() => setShowAddMenu(!showAddMenu)}>Add new...</button>
                <button onClick={() => setShowJSONEditor(!showJSONEditor)}>Toggle JSON Editor</button>
                <button onClick={copyConfigToEditor}>Copy Device Config to Editor</button>
                <button onClick={() => { setConfig(JSON.parse(defaultConfig)); setEditorContent(defaultConfig) }}>Reset Config</button>
                <button onClick={() => { }} >Toggle bounding boxes</button>
            </ButtonsContainer>
            {showJSONEditor && <JSONContainer isJSONValid={isJSONValid}>
                <HighlightedTextarea value={editorContent} highlight={highlightedText} onChange={handleJSONEditorChange} isValidJSON={isJSONValid} />
                <div>
                    <button disabled={!isJSONValid} onClick={saveJSONEditor}>Save</button>
                    <button onClick={() => setShowJSONEditor(!showJSONEditor)}>Close JSON Editor</button>
                </div>
            </JSONContainer>
            }

            {showAddMenu && <AddMenuContainer>
                <select name="layer"
                    value={layerType}
                    onChange={(e) => setLayerType(e.target.value)}
                >
                    <option value="ground">groundlayer</option>
                    <option value="map">satmap</option>
                    {/* <option>markerArray</option>
                    <option>geolocation marker</option>
                    <option>device path</option>
                    <option>occupancy grid</option>
                    <option>point cloud</option> */}
                </select>
                <span>
                    <input type="checkbox" name="datasource"
                        checked={useDatasource}
                        onChange={(e) => setUseDatasource(e.target.checked)}
                    />
                    <label htmlFor="datasource" >use Datasource</label>
                </span>
                <label htmlFor="positioning">Positioning</label>
                <select name="positioning"
                    value={positioningType}
                    onChange={(e) => setPositioningType(e.target.value)}
                >
                    <option value="fixed">Fixed</option>
                    <option value="gps">Gps</option>
                    <option value="odometry">Odometry</option>
                </select>
                <button onClick={() => addNewLayer(layerType, positioningType, useDatasource)}>Add Layer</button>
                <button onClick={() => setShowAddMenu(!showAddMenu)}>Close</button>
            </AddMenuContainer>}
        </DebugWrapper >

    )
}

export default DebugContainer;