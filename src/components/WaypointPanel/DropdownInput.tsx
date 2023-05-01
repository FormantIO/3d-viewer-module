import React, { forwardRef } from "react";
import { DropdownContainer } from "./style";

interface Props {
  label: string;
  content: string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DropdownInput = forwardRef<any, Props>(
  ({ label, content, onChange }, ref) => {
    return (
      <DropdownContainer>
        <label>{label}</label>
        <select
          ref={ref}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange && onChange(e);
          }}
        >
          {content.map((item, idx) => (
            <option value={idx} key={idx}>
              {item}
            </option>
          ))}
        </select>
      </DropdownContainer>
    );
  }
);
