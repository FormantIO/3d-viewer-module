import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import styled from "styled-components";
import { ControlsContextProps } from "../layers/common/ControlsContext";
import { DeviceContext } from "../layers/common/DeviceContext";

const Container = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const PanelContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 300px;
  height: 320px;
  background-color: #2d3855;
  border-radius: 10px;
  padding: 20px;
  color: white;
  pointer-events: all;
`;

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 5px;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: all;
`;

const STextField = styled(TextField)(() => ({
  "& label": {
    color: "white",
  },
  "& div": {
    color: "white",
  },
}));
const SCheckbox = styled(Checkbox)(() => ({
  "&.MuiButtonBase-root.MuiCheckbox-root": {
    color: "white",
  },
}));

const SButton = styled(Button)(() => ({
  "&.MuiButtonBase-root": {
    background: "#3e4b6c",
  },
  height: "35px",
}));

interface Props {
  controlsStates: ControlsContextProps;
}

export const WaypointPanel: React.FC<Props> = ({ controlsStates }) => {
  const {
    state: { selectedWaypoint },
    store,
    setWaypoints,
  } = controlsStates;
  const device = useContext(DeviceContext);

  const [velocity, setVelocity] = useState<string>("");
  const [brushModes, setBrushModes] = useState<string>("");
  const [leftBrush, setLeftBrush] = React.useState<boolean>(false);
  const [rightBrush, setRightBrush] = React.useState<boolean>(false);
  const [dustSuppression, setDustSuppression] = React.useState<string>("");

  const removeBtnHandler = () => {
    if (selectedWaypoint === null) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== selectedWaypoint));
    const { waypoints } = store;
    store.waypoints = waypoints.filter((_, idx) => idx !== selectedWaypoint);

    // Update panel when gizmo moving to the next point
    if (selectedWaypoint < waypoints.length - 1) {
      const w = store.waypoints[selectedWaypoint];
      setRightBrush(w.rightBrush);
      setLeftBrush(w.leftBrush);
      setVelocity(w.velocity ? w.velocity.toString() : "");
      setBrushModes(w.brushModes ? w.brushModes.toString() : "");
      setDustSuppression(w.dustSuppression ? w.dustSuppression.toString() : "");
    }
  };

  const sendBtnHandler = () => {
    const { waypoints } = store;
    if (waypoints.length > 0) {
      // Send
      if (device) {
        device.sendCommand("send_mission_waypoints", JSON.stringify(waypoints));
      }
      alert(JSON.stringify(waypoints));
    } else {
      alert("Create Waypoints To Send.");
    }
  };

  // Feed data to waypoint
  useEffect(() => {
    if (selectedWaypoint === null) {
      return;
    }
    const { waypoints } = store;
    const tempPoint = waypoints[selectedWaypoint];
    store.waypoints[selectedWaypoint] = {
      ...tempPoint,
      leftBrush,
      rightBrush,
      velocity: parseInt(velocity),
      brushModes: parseInt(brushModes),
      dustSuppression: parseInt(dustSuppression),
    };
  }, [velocity, brushModes, dustSuppression, leftBrush, rightBrush, store]);

  // Update editing panel
  useEffect(() => {
    if (selectedWaypoint !== null) {
      const w = store.waypoints[selectedWaypoint];
      setRightBrush(w.rightBrush);
      setLeftBrush(w.leftBrush);
      setVelocity(w.velocity ? w.velocity.toString() : "");
      setBrushModes(w.brushModes ? w.brushModes.toString() : "");
      setDustSuppression(w.dustSuppression ? w.dustSuppression.toString() : "");
    } else {
      setRightBrush(false);
      setLeftBrush(false);
      setVelocity("");
      setBrushModes("");
      setDustSuppression("");
    }
  }, [setLeftBrush, selectedWaypoint]);

  return (
    <Container>
      <PanelContainer>
        <STextField
          label="Velocity"
          maxRows={1}
          multiline
          sx={{ color: "white", width: "100%" }}
          value={velocity}
          onChange={(e) => setVelocity(e.target.value)}
        />

        <STextField
          label="Brush Modes"
          maxRows={1}
          multiline
          sx={{ color: "white", width: "100%", marginTop: "10px" }}
          value={brushModes}
          onChange={(e) => setBrushModes(e.target.value)}
        />

        <STextField
          label="Dust Suppression"
          maxRows={1}
          multiline
          sx={{ color: "white", width: "100%", marginTop: "10px" }}
          value={dustSuppression}
          onChange={(e) => {
            setDustSuppression(e.target.value);
          }}
        />

        <FormControlLabel
          sx={{ marginTop: "5px" }}
          control={
            <SCheckbox
              checked={leftBrush}
              onChange={(e: any) => {
                setLeftBrush(e.target.checked);
              }}
            />
          }
          label="Left Brush"
        />
        <FormControlLabel
          sx={{ marginTop: "5px" }}
          control={
            <SCheckbox
              checked={rightBrush}
              onChange={(e: any) => {
                setRightBrush(e.target.checked);
              }}
            />
          }
          label="Right Brush"
        />

        <Box
          component={"div"}
          display="flex"
          justifyContent={"space-between"}
          alignItems="center"
          mt={1}
        >
          <SButton
            variant="contained"
            color="warning"
            onClick={removeBtnHandler}
          >
            Remove
          </SButton>
          <SButton variant="contained" onClick={sendBtnHandler}>
            Send
          </SButton>
        </Box>
      </PanelContainer>
    </Container>
  );
};
