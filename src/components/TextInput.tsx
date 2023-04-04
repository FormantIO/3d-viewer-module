import { Box, TextField } from "@formant/ui-sdk";
import React, { forwardRef } from "react";
import styled from "styled-components";
import { FormantColors } from "../layers/utils/FormantColors";

const SLabel = styled.div`
  font-family: Inter;
  font-size: 12px;
  padding-left: 5px;
`;

const inputStyle = {
  width: "100%",
  height: "40px",
  background: FormantColors.steel01,
  padding: "8px",
  borderRadius: "4px",
  outline: "none",
  border: "none",
  color: "white",
  marginTop: "8px",
};

interface Props {
  label: string;
  value?: string;
  type?: "integer" | "float" | "string";
  onEnter?: () => void;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const TextInput = forwardRef<any, Props>(
  ({ label, onChange, onEnter, value, type = "string" }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null!);
    return (
      <Box
        component={"div"}
        sx={{ height: "70px", marginTop: "10px" }}
        ref={divRef}
      >
        <SLabel>{label}</SLabel>
        <input
          style={inputStyle}
          ref={ref}
          value={value}
          placeholder="Edit"
          onChange={(e) => {
            const t = divRef.current.childNodes[1] as HTMLInputElement;
            if (type === "float") {
              const newValue = t.value.replace(/[^0-9.-]/g, "");
              t.value = newValue;
            }
            if (type === "integer") {
              const newValue = t.value.replace(/[^0-9-]/g, "");
              t.value = newValue;
            }
            onChange && onChange(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter && onEnter();
          }}
          onBlur={() => onEnter && onEnter()}
        />
      </Box>
    );
  }
);

export const getTaregt = (s: React.RefObject<HTMLElement | undefined>) =>
  s.current! as HTMLInputElement;
