import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { PathToggleIcon, PathEyeIcon, WaypointsPathToggleIcon } from "../icons";
import { ToggleIconContainer } from "./style";

interface Props {
  controlsStates: ControlsContextProps;
  hasPathLayer: boolean;
}

export function ToggleIcon({ controlsStates, hasPathLayer }: Props) {
  const {
    state: { hasPointCloud, hasPath, hasWaypointsPath, isWaypointPanelVisible },
    updateState,
  } = controlsStates;

  return (
    <ToggleIconContainer hasPointCloud={hasPointCloud}>
      {isWaypointPanelVisible && (
        <>
          <div
            onClick={() => {
              updateState({ hasWaypointsPath: !hasWaypointsPath });
            }}
          >
            {hasWaypointsPath ? <WaypointsPathToggleIcon /> : <PathEyeIcon />}
          </div>

          {hasPathLayer && (
            <div
              onClick={() => {
                updateState({ hasPath: !hasPath });
              }}
            >
              {hasPath ? <PathToggleIcon /> : <PathEyeIcon />}
            </div>
          )}
        </>
      )}
    </ToggleIconContainer>
  );
}
