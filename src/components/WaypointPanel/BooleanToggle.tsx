import React, { forwardRef } from "react";
import { BooleanToggleContainer } from "./style";
import { BooleanToggleIcon } from "../icons";

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

    return (
      <BooleanToggleContainer>
        <label>{label}</label>
        <div>
          <div>{toggle ? "On" : "Off"}</div>
          <div>
            <BooleanToggleIcon
              value={toggle}
              onClick={() => {
                setToggle((p) => !p);
                onChange && onChange(!toggle);
              }}
            />
          </div>
        </div>
      </BooleanToggleContainer>
    );
  }
);
