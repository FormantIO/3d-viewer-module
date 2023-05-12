import React, { forwardRef } from "react";
import { BooleanToggleContainer } from "./style";
import { BooleanToggleTrueIcon, BooleanToggleFalseIcon } from "../icons";

interface Props {
  label: string;
  value?: boolean;
  onChange?: (s: boolean) => void;
}

export const BooleanToggle = forwardRef<any, Props>(
  ({ label, value = false, onChange }, ref) => {
    const [toggle, setToggle] = React.useState<boolean>(value);
    //@ts-ignore
    ref.current = (s: boolean) => setToggle(s);
    const onClick = () => {
      setToggle((p) => !p);
      onChange && onChange(!toggle);
    };
    return (
      <BooleanToggleContainer>
        <label>{label}</label>
        <div onClick={onClick}>
          <div>{toggle ? "On" : "Off"}</div>
          <div>
            {toggle ? <BooleanToggleTrueIcon /> : <BooleanToggleFalseIcon />}
          </div>
        </div>
      </BooleanToggleContainer>
    );
  }
);
