import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { WaypointToggleIcon } from "../icons";
import { ToggleIconContainer } from "./style";

interface Props {
  controlsStates: ControlsContextProps;
}

export function ToggleIcon({ controlsStates }: Props) {
  const {
    state: { hasPointCloud, isWaypointEditing },
    updateState,
  } = controlsStates;

  return (
    <ToggleIconContainer hasPointCloud={hasPointCloud}>
      {!isWaypointEditing && (
        <div
          onClick={() => {
            updateState({ isWaypointEditing: !isWaypointEditing });
          }}
        >
          <WaypointToggleIcon />
        </div>
      )}
    </ToggleIconContainer>
  );
}
