import { Box, TextField } from "@formant/ui-sdk";
import React, { forwardRef } from "react";
import styled from "styled-components";

const STextField = styled(TextField)(() => ({
  color: "white",
  width: "100%",
  "& div input": {
    color: "white",
    padding: "8px",
    background: "#3B4668",
    borderRadius: "4px",
  },
}));

const SLabel = styled.div`
  font-family: Inter;
  padding-left: 5px;
`;

interface Props {
  label: string;
  onEnter?: () => void;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const TextInput = forwardRef<any, Props>(
  ({ label, onChange, onEnter }, ref) => {
    return (
      <Box component={"div"} sx={{ height: "70px", marginTop: "10px" }}>
        <SLabel>{label}</SLabel>
        <STextField
          ref={ref}
          placeholder="Edit"
          sx={{ marginTop: "8px" }}
          onChange={(e) => onChange && onChange(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter && onEnter();
          }}
        />
      </Box>
    );
  }
);

export const getTaregt = (s: React.RefObject<HTMLElement | undefined>) =>
  s.current!.childNodes[0].childNodes[0] as HTMLInputElement;
