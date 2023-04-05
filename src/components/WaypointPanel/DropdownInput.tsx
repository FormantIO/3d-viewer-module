import { Box } from "@mui/material";
import React, { forwardRef } from "react";
import styled from "styled-components";
import { FormantColors } from "../../layers/utils/FormantColors";

const StyledSelect = styled.select`
  width: 100%;
  height: 40px;
  margin-top: 8px;
  color: white;
  padding: 8px;
  border-radius: 4px;
  outline: none;
  border: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background: ${FormantColors.steel01}
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24" id="arrow-drop-down"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M7 10l5 5 5-5H7z"></path></svg>')
    no-repeat 30px;
  background-position-x: calc(100% - 5px);
  background-position-y: center;
`;

const SLabel = styled.div`
  font-family: Inter;
  font-size: 12px;
  padding-left: 5px;
`;

interface Props {
  label: string;
  content: string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DropdownInput = forwardRef<any, Props>(
  ({ label, content, onChange }, ref) => {
    return (
      <Box component={"div"} sx={{ height: "70px", marginTop: "10px" }}>
        <SLabel>{label}</SLabel>
        <StyledSelect
          ref={ref}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange && onChange(e);
          }}
        >
          <option value={0}>Select ...</option>
          {content.map((item, idx) => (
            <option value={idx + 1} key={idx}>
              {item}
            </option>
          ))}
        </StyledSelect>
      </Box>
    );
  }
);
