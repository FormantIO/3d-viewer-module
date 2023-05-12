import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { SENDING_STATUS } from "../../lib";
import {
  PathToggleIcon,
  WaypointToggleIcon,
  PathEyeIcon,
  WaypointsPathToggleIcon,
} from "../icons";
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
      {!isWaypointPanelVisible ? (
        <div
          onClick={() => {
            updateState({
              isWaypointPanelVisible: !isWaypointPanelVisible,
              isWaypointEditing: !isWaypointPanelVisible,
              hasPath: true,
              hasWaypointsPath: true,
            });
          }}
        >
          <WaypointToggleIcon />
        </div>
      ) : (
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
