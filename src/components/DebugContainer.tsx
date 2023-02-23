import styled from "styled-components";
import React, { useCallback } from "react";
import { Viewer3DConfiguration } from "../config";
import { IUniverseData } from "@formant/universe-core";
import { UniverseDataContext } from "../layers/common/UniverseDataContext";
import { Universe } from "../layers/common/Universe";
import getUuidByString from "uuid-by-string";
import { buildScene } from "../buildScene";


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

interface IDebugContainer {
    config?: Viewer3DConfiguration;
    universeData: IUniverseData;
}

const defaultConfig = `
    {
	"devices":[
		{
			"name":"debug-device",
			
			"mapLayers":[
				{
					"name":"ground-debug",
					"mapType": "Ground Plane",
					"positioning":{
						"positioningType": "fixed",
						"x":0.0,
						"y":0.0,
						"z":0.0
					}
				}
			]
		}
	]
}
`;

const DebugContainer = (props: IDebugContainer) => {
    const [showJSONEditor, setShowJSONEditor] = React.useState(false);
    const [config, setConfig] = React.useState<Viewer3DConfiguration>(JSON.parse(defaultConfig));
    const [editorContent, setEditorContent] = React.useState(defaultConfig);
    const [isJSONValid, setIsJSONValid] = React.useState(true);

    const copyConfigToEditor = () => {
        setEditorContent(JSON.stringify(props.config, null, 2));
    };

    const handleJSONEditorChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditorContent(event.target.value);
        try {
            JSON.parse(event.target.value);
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
                <Universe configHash={getUuidByString(JSON.stringify(config))}>
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
                <button onClick={() => setShowJSONEditor(!showJSONEditor)}>Toggle JSON Editor</button>
                <button onClick={copyConfigToEditor}>Copy Config to Editor</button>

            </ButtonsContainer>
            {showJSONEditor && <JSONContainer isJSONValid={isJSONValid}>
                <textarea value={editorContent} onChange={handleJSONEditorChange} />
                <div>
                    <button disabled={!isJSONValid} onClick={saveJSONEditor}>Save</button>
                    <button onClick={() => setShowJSONEditor(!showJSONEditor)}>Close JSON Editor</button>
                </div>
            </JSONContainer>
            }
        </DebugWrapper >

    )
}

export default DebugContainer;