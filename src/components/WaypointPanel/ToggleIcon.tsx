import { ControlsContextProps } from "../../layers/common/ControlsContext";

interface Props {
  controlsStates: ControlsContextProps;
}

export function ToggleIcon({ controlsStates }: Props) {
  const {
    state: { isPointSizeSliderVisible, isWaypointEditing },
    updateState,
  } = controlsStates;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        flexDirection: "column",
        position: "absolute",
        top: isPointSizeSliderVisible ? "210px" : "120px",
        right: "10px",
        pointerEvents: "none",
      }}
    >
      {!isWaypointEditing && (
        <div
          style={{
            boxShadow: "0 0 1.25rem #0a0b10",
            boxSizing: "border-box",
            background: "#1c1e2d",
            width: "28px",
            height: "28px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            cursor: "pointer",
            pointerEvents: "all",
          }}
          onClick={() => {
            updateState({ isWaypointEditing: !isWaypointEditing });
          }}
        >
          <img
            src={"./waypoints.png"}
            alt=""
            style={{ width: "18px", height: "18px", marginTop: "5px" }}
          />
        </div>
      )}
    </div>
  );
}
