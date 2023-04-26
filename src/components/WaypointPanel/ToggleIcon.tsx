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
  sending: SENDING_STATUS;
}

export function ToggleIcon({ controlsStates, sending }: Props) {
  const {
    state: { hasPointCloud, hasPath, hasWaypointsPath, isWaypointPanelVisible },
    updateState,
  } = controlsStates;

  return (
    <ToggleIconContainer hasPointCloud={hasPointCloud}>
      {!isWaypointPanelVisible && (
        <div
          onClick={() => {
            updateState({
              isWaypointPanelVisible: !isWaypointPanelVisible,
              isWaypointEditing: !isWaypointPanelVisible,
              hasPath: false,
              hasWaypointsPath: true,
            });
          }}
        >
          <WaypointToggleIcon />
        </div>
      )}

      {sending === SENDING_STATUS.SUCCESS && (
        <>
          <div
            onClick={() => {
              updateState({ hasWaypointsPath: !hasWaypointsPath });
            }}
          >
            {hasWaypointsPath ? <WaypointsPathToggleIcon /> : <PathEyeIcon />}
          </div>

          <div
            onClick={() => {
              updateState({ hasPath: !hasPath });
            }}
          >
            {hasPath ? <PathToggleIcon /> : <PathEyeIcon />}
          </div>
        </>
      )}
    </ToggleIconContainer>
  );
}
