import React, { useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import styled from "styled-components";
import { ControlsContextProps } from "../layers/common/ControlsContext";

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
  top: 40%;
  left: 50%;
  width: 300px;
  height: 180px;
  transform: translate(-50%, -50%);
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
    state: { isWaypointEditing, selectedWaypoint },
    store,
    setWaypoints,
    updateState,
  } = controlsStates;

  const [scrubberOn, setScrubberOn] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const checkBoxHandler = (e: any) => setScrubberOn(e.target.checked);
  const showEditing = () => updateState({ isWaypointEditing: true });
  const closeEditing = () => updateState({ isWaypointEditing: false });

  const editBtnHandler = () => {
    if (selectedWaypoint === null) {
      alert("Select Waypoint To Edit");
      closeEditing();
    } else {
      showEditing();
    }
  };

  const saveBtnHandler = () => {
    if (selectedWaypoint === null) return;
    const { waypoints } = store;
    const tempPoint = waypoints[selectedWaypoint];
    store.waypoints[selectedWaypoint] = {
      ...tempPoint,
      message,
      scrubberOn,
    };
    closeEditing();
  };

  const removeBtnHandler = () => {
    if (selectedWaypoint === null) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== selectedWaypoint));
    closeEditing();
  };

  const sendBtnHandler = () => {
    const { waypoints } = store;
    if (waypoints.length > 0) {
      // Send
      alert(JSON.stringify(waypoints));
    } else {
      alert("Create Waypoints To Send.");
    }
  };

  // Update editing panel
  useEffect(() => {
    if (selectedWaypoint === null) return;
    const w = store.waypoints[selectedWaypoint];
    setMessage(w.message);
    setScrubberOn(w.scrubberOn);
  }, [setMessage, setScrubberOn, selectedWaypoint]);

  return (
    <Container>
      {isWaypointEditing && (
        <PanelContainer>
          <STextField
            label="Message"
            maxRows={1}
            multiline
            sx={{ color: "white", width: "100%" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <FormControlLabel
            sx={{ marginTop: "5px" }}
            control={
              <SCheckbox checked={scrubberOn} onChange={checkBoxHandler} />
            }
            label="Scrubber On"
          />
          <Box
            component={"div"}
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
          >
            <SButton variant="contained" onClick={saveBtnHandler}>
              Save
            </SButton>
            <SButton
              variant="contained"
              color="warning"
              onClick={removeBtnHandler}
            >
              Remove
            </SButton>
            <SButton variant="contained" onClick={closeEditing}>
              Cancel
            </SButton>
          </Box>
        </PanelContainer>
      )}
      <ButtonsContainer>
        <SButton variant="contained" onClick={editBtnHandler}>
          Edit
        </SButton>
        <SButton variant="contained" onClick={sendBtnHandler}>
          Send
        </SButton>
      </ButtonsContainer>
    </Container>
  );
};
