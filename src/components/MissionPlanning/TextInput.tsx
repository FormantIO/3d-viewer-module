import React, { forwardRef } from "react";
import { TextInputContainer } from "./style";
import { INPUT_TYPE, PROPERTY_TYPE } from "../../layers/types";

interface Props {
  label: string;
  value?: string;
  type?: INPUT_TYPE;
  min?: number;
  max?: number;
  onEnter?: () => void;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const TextInput = forwardRef<any, Props>(
  (
    { label, onChange, onEnter, value, min, max, type = PROPERTY_TYPE.STRING },
    ref
  ) => {
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
            if (type === PROPERTY_TYPE.FLOAT) {
              const newValue = t.value.replace(/[^0-9.-]/g, "");
              t.value = (
                parseFloat(newValue) > max!
                  ? max
                  : parseFloat(newValue) < min!
                  ? min
                  : newValue
              )!.toString();
            }
            if (type === PROPERTY_TYPE.INTEGER) {
              const newValue = t.value.replace(/[^0-9-]/g, "");
              t.value = (
                parseInt(newValue) > max!
                  ? max
                  : parseInt(newValue) < min!
                  ? min
                  : newValue
              )!.toString();
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
