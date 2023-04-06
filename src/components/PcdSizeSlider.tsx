import styled from "styled-components";
import { ControlsContextProps } from "../layers/common/ControlsContext";

const Controls = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-direction: column;
  position: absolute;
  top: 100px;
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

  /* overflow: hidden; */

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 3.75rem;
    width: 1.6rem;

    will-change: opacity;

    & > div {
      width: 100%;
      height: 3.75rem;
      order: 2;
      margin: 0.625rem 0;
      position: relative;

      display: flex;
      align-items: center;
      justify-content: center;

      & > div {
        position: absolute;
        width: 3.75rem;
        height: 1.875rem;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;

        input {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: 0;

          appearance: none;
          background: transparent;
          cursor: pointer;

          ::-webkit-slider-runnable-track {
            background: #bac4e2;
            height: 0.05rem;
          }
          ::-webkit-slider-thumb {
            -webkit-appearance: none; /* Override default look */
            margin-top: -12px; /* Centers thumb on the track */
            background-color: #f0f7fe;
            height: 1rem;
            width: 1rem;
            border-radius: 50%;
            margin-top: -0.5rem;
          }

          ::-moz-range-track {
            background: #bac4e2;
            height: 0.5rem;
          }
          ::-moz-range-thumb {
            -moz-appearance: none;
            margin-top: -12px; /* Centers thumb on the track */
            background-color: #f0f7fe;
            height: 1rem;
            width: 1rem;
            border-radius: 50%;
            margin-top: -0.5rem;
          }

          /* background: rgba(0, 0, 0, 0); */
          width: 100%;
          cursor: pointer;
        }
      }
    }
  }
`;

interface Props {
  controlsStates: ControlsContextProps;
}
export const PointSizeSlider: React.FC<Props> = ({ controlsStates }) => {
  const {
    state: { pointSize, hasPointCloud },
    updateState,
  } = controlsStates;
  if (!hasPointCloud) return null;
  return (
    <Controls>
      <ControlGroup>
        <div>
          <div>
            <div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.05"
                value={pointSize}
                onChange={(e) => {
                  updateState({ pointSize: parseFloat(e.target.value) });
                }}
              />
            </div>
          </div>
        </div>
      </ControlGroup>
    </Controls>
  );
};
