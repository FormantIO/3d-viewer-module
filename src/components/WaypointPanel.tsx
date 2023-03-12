import React from "react";
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
  background-color: #000000;
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
`;

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 5px;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
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
    state: { isWaypointEditing },
    updateState,
  } = controlsStates;

  const [scrubberOn, setScrubberOn] = React.useState(false);
  const [message, setMessage] = React.useState("");

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
              <SCheckbox
                value={scrubberOn}
                onChange={(e) => {
                  setScrubberOn(e.target.value === "true");
                }}
              />
            }
            label="Scrubber On"
          />
          <Box
            component={"div"}
            display="flex"
            justifyContent={"end"}
            alignItems="center"
          >
            <SButton
              variant="contained"
              onClick={() => {
                updateState({ isWaypointEditing: false });
              }}
            >
              Save
            </SButton>
            <SButton
              variant="contained"
              sx={{ marginLeft: "5px" }}
              onClick={() => updateState({ isWaypointEditing: false })}
            >
              Cancel
            </SButton>
          </Box>
        </PanelContainer>
      )}
      <ButtonsContainer>
        <SButton
          variant="contained"
          onClick={() => updateState({ isWaypointEditing: true })}
        >
          Edit
        </SButton>
        <SButton variant="contained">Send</SButton>
      </ButtonsContainer>
    </Container>
  );
};
