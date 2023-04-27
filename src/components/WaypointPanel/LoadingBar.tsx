import React, { useEffect } from "react";
import { SENDING_STATUS } from "../../layers/types";

import { LoadingBarContainer } from "./style";

interface Props {
  sending: SENDING_STATUS;
  setSending: (s: SENDING_STATUS) => void;
}

export const LoadingBar: React.FC<Props> = ({ sending, setSending }) => {
  const timer = React.useRef<number>();

  useEffect(() => {
    if (sending === SENDING_STATUS.FAIL) {
      timer.current = window.setTimeout(() => {
        setSending(SENDING_STATUS.NONE);
      }, 4000);
    } else {
      clearTimeout(timer.current);
    }
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, [sending, setSending]);

  return (
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
  );
};
