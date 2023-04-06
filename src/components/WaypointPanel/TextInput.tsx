import React, { forwardRef } from "react";
import { TextInputContainer } from "./style";
import { INPUT_TYPE, TYPES } from "./types";

interface Props {
  label: string;
  value?: string;
  type?: INPUT_TYPE;
  onEnter?: () => void;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const TextInput = forwardRef<any, Props>(
  ({ label, onChange, onEnter, value, type = "string" }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null!);
    return (
      <TextInputContainer ref={divRef}>
        <label>{label}</label>
        <input
          ref={ref}
          value={value}
          placeholder="Edit"
          onChange={(e) => {
            const t = divRef.current.childNodes[1] as HTMLInputElement;
            if (type === TYPES.FLOAT) {
              const newValue = t.value.replace(/[^0-9.-]/g, "");
              t.value = newValue;
            }
            if (type === TYPES.INTEGER) {
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
      </TextInputContainer>
    );
  }
);

export const getTaregt = (s: React.RefObject<HTMLElement | undefined>) =>
  s.current! as HTMLInputElement;
