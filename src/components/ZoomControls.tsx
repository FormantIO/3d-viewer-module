import { Icon } from "@formant/ui-sdk";
import styled from "styled-components";

const Controls = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  pointer-events: none;
`;

const ControlGroup = styled.div`
  box-shadow: 0 0 1.25rem #0a0b10;
  display: flex;
  flex-direction: column;
  margin: 0.625rem;
  margin-bottom: 0;
  background: #1c1e2d;
  border: 0.078125rem solid #3b4668;
  border-radius: 1rem;
  box-sizing: border-box;
  pointer-events: all;
  overflow: hidden;

  button {
    padding: 0;
    margin: 0;
    background: transparent;
    color: inherit;
    border: none;
    text-decoration: none;
    position: relative;
    line-height: normal;

    &:not([disabled]) {
      cursor: pointer;
    }

    & + button {
      border-top: 0.039375rem solid #3b4668;
    }

    & > svg {
      vertical-align: middle;
      fill: #BAC4E2
    }
  }
`;

interface IZoomControls {
    zoomIn: () => void;
    zoomOut: () => void;
    recenter: () => void;
    stopZoom: () => void;
};

const ZoomControls = (props: IZoomControls) => {
    const { zoomIn, zoomOut, recenter, stopZoom } = props;
    return (
        <Controls>
            <ControlGroup>
                <button type="button" onMouseDown={zoomIn} onMouseUp={stopZoom}>
                    <Icon name="plus" />
                </button>
                <button
                    type="button"
                    onMouseDown={zoomOut}
                    onMouseUp={stopZoom}
                >
                    <Icon name="minus" />
                </button>
            </ControlGroup>
            <ControlGroup onClick={recenter}>
                <button type="button">
                    <Icon name="recenter" />
                </button>
            </ControlGroup>
        </Controls>
    );
};

export default ZoomControls;