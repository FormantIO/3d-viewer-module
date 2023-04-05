import React from "react";
import { ConfirmPanelContainer } from "./style";
import { Box, Button } from "@mui/material";

interface Props {
  content: string[];
  buttons: string[];
  handler1?: () => void;
  handler2?: () => void;
}

export const Modal: React.FC<Props> = ({
  content,
  buttons,
  handler1,
  handler2,
}) => {
  return (
    <ConfirmPanelContainer>
      <Box component={"div"} m={"10px 0 0 10px"}>
        {content[0]} <b>{content[1]}</b> ?
      </Box>
      <Box
        component={"div"}
        display="flex"
        justifyContent="space-between"
        mt={"70px"}
        ml={"100px"}
        sx={{
          "& > button": {
            width: "48%",
            height: "45px",
            borderRadius: "20px",
          },
        }}
      >
        <Button
          variant="contained"
          sx={{
            borderRadius: "20px",
            color: "white",
            backgroundColor: "#3e4b6c",
            "&:hover": {
              backgroundColor: "#60729f",
            },
          }}
          onClick={() => handler1 && handler1()}
        >
          Back
        </Button>

        <Button
          variant="contained"
          sx={{
            borderRadius: "20px",
            backgroundColor: "#EA719D",
            "&:hover": {
              backgroundColor: "#ec9fbb",
            },
            color: "black",
          }}
          onClick={() => handler2 && handler2()}
        >
          Cancel
        </Button>
      </Box>
    </ConfirmPanelContainer>
  );
};
