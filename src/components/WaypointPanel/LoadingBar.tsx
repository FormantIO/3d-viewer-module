import React, { useEffect } from "react";
import { SENDING_STATUS } from "../../layers/types";

import { LoadingBarContainer } from "./style";

interface Props {
  sending: SENDING_STATUS;
}

export const LoadingBar: React.FC<Props> = ({ sending }) => {
  const timer = React.useRef<number>();
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (sending === SENDING_STATUS.SUCCESS || sending == SENDING_STATUS.FAIL) {
      timer.current = window.setTimeout(() => {
        setVisible(false);
      }, 4000);
    } else {
      clearTimeout(timer.current);
    }
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, [sending]);

  useEffect(() => {
    if (sending !== SENDING_STATUS.NONE) setVisible(true);
  }, [sending]);

  return (
    <>
      {visible && (
        <LoadingBarContainer sending={sending}>
          <div />
          <p>
            {sending === SENDING_STATUS.WAITING
              ? "Sending waypoints to device"
              : sending === SENDING_STATUS.SUCCESS
              ? "SUCCESS"
              : "FAIL"}
          </p>
        </LoadingBarContainer>
      )}
    </>
  );
};
