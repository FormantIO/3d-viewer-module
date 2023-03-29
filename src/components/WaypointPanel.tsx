import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import styled from "styled-components";
import * as THREE from "three";
import { ControlsContextProps } from "../layers/common/ControlsContext";
import { DeviceContext } from "../layers/common/DeviceContext";
import { getTaregt, TextInput } from "./TextInput";
import { testConfig } from "./testConfig";

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
  bottom: 80px;
  left: 10px;
  width: 300px;
  height: calc(100% - 150px);
  overflow-y: auto;
  background-color: #2d3855;
  border-radius: 10px;
  padding: 20px;
  color: white;
  pointer-events: all;
`;

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 10px;
  width: 300px;
  height: 40px;
  display: flex;
  padding: 20px;
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
    waypoints,
    state: { selectedWaypoint },
    store,
    setWaypoints,
  } = controlsStates;
  const device = useContext(DeviceContext);

  const properties = testConfig.visualizations[3].waypointsProperties;

  //
  const [velocity, setVelocity] = useState<string>("");
  const [brushModes, setBrushModes] = useState<string>("");

  const removeBtnHandler = () => {
    if (selectedWaypoint === null) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== selectedWaypoint));
    const { waypoints } = store;
    store.waypoints = waypoints.filter((_, idx) => idx !== selectedWaypoint);

    // Update panel when gizmo moving to the next point
    if (selectedWaypoint < waypoints.length - 1) {
      const w = store.waypoints[selectedWaypoint];

      setVelocity(w.velocity ? w.velocity.toString() : "");
      setBrushModes(w.brushModes ? w.brushModes.toString() : "");
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
      velocity: parseInt(velocity),
      brushModes: parseInt(brushModes),
    };
  }, [velocity, brushModes, store]);

  // Update editing panel
  useEffect(() => {
    if (selectedWaypoint !== null) {
      const w = store.waypoints[selectedWaypoint];
      setVelocity(w.velocity ? w.velocity.toString() : "");
      setBrushModes(w.brushModes ? w.brushModes.toString() : "");
    } else {
      setVelocity("");
      setBrushModes("");
    }
  }, [selectedWaypoint]);

  const refs = React.useRef<any[]>([]);
  for (let i = 0; i < 2; ++i) {
    refs.current[i] = React.useRef(null);
  }

  const angleRef = React.useRef<HTMLElement>();
  const xPosRef = React.useRef<HTMLElement>();
  const yPosRef = React.useRef<HTMLElement>();

  // Update orientation & position fields with waypoints updated
  useEffect(() => {
    if (
      selectedWaypoint === null ||
      !angleRef.current ||
      !xPosRef.current ||
      !yPosRef.current
    ) {
      getTaregt(angleRef).value = "";
      getTaregt(xPosRef).value = "";
      getTaregt(yPosRef).value = "";
      return;
    }
    const { pose } = store.waypoints[selectedWaypoint];
    const { x, y, z, w } = pose.rotation;
    const e = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(x, y, z, w)
    );
    getTaregt(angleRef).value = THREE.MathUtils.radToDeg(e.z).toFixed(2);
    getTaregt(xPosRef).value = pose.translation.x.toFixed(2);
    getTaregt(yPosRef).value = pose.translation.y.toFixed(2);
  }, [selectedWaypoint, waypoints]);

  const posHandler = (axis: string) => {
    if (selectedWaypoint !== null) {
      let v = parseFloat(getTaregt(axis === "x" ? xPosRef : yPosRef).value);
      v = isNaN(v) ? 0 : v;
      const newPoints = [...waypoints];
      if (axis === "x") newPoints[selectedWaypoint].translation.x = v;
      else newPoints[selectedWaypoint].translation.y = v;
      setWaypoints(newPoints);
      store.waypoints[selectedWaypoint];
    }
  };

  return (
    <Container>
      <PanelContainer>
        <Typography>HEADING</Typography>

        <TextInput
          ref={angleRef}
          label={"Orientation"}
          onEnter={() => {
            if (selectedWaypoint === null) return;
            let v = parseFloat(getTaregt(angleRef).value);
            v = isNaN(v) ? 0 : v;
            const euler = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(v));
            const { x, y, z, w } = new THREE.Quaternion().setFromEuler(euler);

            const newPoints = [...waypoints];
            newPoints[selectedWaypoint].rotation = { x, y, z, w };
            setWaypoints(newPoints);
            store.waypoints[selectedWaypoint].pose.rotation = { x, y, z, w };
          }}
        />

        <Typography sx={{ marginTop: "20px" }}>POSITION</Typography>
        <TextInput
          ref={xPosRef}
          label="X-axis"
          onEnter={() => posHandler("x")}
        />
        <TextInput
          ref={yPosRef}
          label="Y-axis"
          onEnter={() => posHandler("y")}
        />

        <Typography sx={{ marginTop: "20px" }}>PROPERTIES</Typography>

        {["Velocity", "Brush Modes"].map((l, idx) => (
          <TextInput
            key={idx}
            ref={refs.current[idx]}
            label={l}
            onChange={(e) => {
              // console.log(e, refs.current[idx].current);
            }}
          />
        ))}

        {/* <STextField
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
        /> */}

        {/* <FormControlLabel
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
        /> */}
      </PanelContainer>

      <ButtonsContainer>
        <Box
          component={"div"}
          display="flex"
          justifyContent={"space-between"}
          alignItems="center"
          sx={{ width: "100%" }}
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
      </ButtonsContainer>
    </Container>
  );
};
