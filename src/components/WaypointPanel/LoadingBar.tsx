import React, { useEffect } from "react";
import { SENDING_STATUS } from "../../layers/types";

import { LoadingBarContainer } from "./style";
import { CLoseIcon } from "../icons";

interface Props {
  isWaypointPanelVisible: boolean;
  sending: SENDING_STATUS;
  setSending: (s: SENDING_STATUS) => void;
}

export const LoadingBar: React.FC<Props> = ({
  isWaypointPanelVisible,
  sending,
  setSending,
}) => {
  const timer = React.useRef<number>();
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (sending === SENDING_STATUS.SUCCESS) {
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
    setVisible(sending !== SENDING_STATUS.NONE);
  }, [sending]);

  useEffect(() => {
    !isWaypointPanelVisible && setVisible(isWaypointPanelVisible);
  }, [isWaypointPanelVisible]);

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

          {sending === SENDING_STATUS.FAIL && (
            <span
              onClick={(e) => {
                setVisible(false);
                setSending(SENDING_STATUS.NONE);
              }}
            >
              <CLoseIcon />
            </span>
          )}
        </LoadingBarContainer>
      )}
    </>
  );
};
