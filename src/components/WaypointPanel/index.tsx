import React, { useState } from "react";
import { Button } from "@mui/material";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { Viewer3DConfiguration, WaypointPropertyType } from "../../config";
import { ControlButtonGroup, Container } from "./style";
import { ToggleIcon } from "./ToggleIcon";
import { Modal } from "./Modal";
import { SENDING_STATUS } from "../../layers/types";
import { Authentication, Device, Fleet } from "@formant/data-sdk";
import { upload } from "./upload";
import { PropertyPanel } from "./PropertyPanel";
import { LoadingBar } from "./LoadingBar";

const devMode = new URLSearchParams(window.location.search).get("module")
  ? false
  : true;

interface Props {
  controlsStates: ControlsContextProps;
  config: Viewer3DConfiguration;
}

export const WaypointPanel: React.FC<Props> = ({ controlsStates, config }) => {
  const {
    waypoints,
    state: { isWaypointPanelVisible, commandName },
    updateState,
    store,
    setWaypoints,
  } = controlsStates;
  const [showCancel, setShowCancel] = useState(false);
  const [sending, setSending] = useState<SENDING_STATUS>(SENDING_STATUS.NONE);

  const waypointsProperties: WaypointPropertyType[] =
    config.waypointMission && config.waypointMission.length > 0
      ? config.waypointMission![0].waypointsProperties || []
      : [];

  const sendBtnHandler = async () => {
    if (!commandName) return;

    const { waypoints } = store;
    let device: Device = null!,
      sendRes: any = null!;

    setSending(SENDING_STATUS.WAITING);
    updateState({ isWaypointEditing: false });

    if (!devMode) {
      device = await Fleet.getCurrentDevice()!;
      const fileID = await upload(Authentication.token!, { waypoints });
      sendRes = await (
        await device.sendCommand(commandName, fileID.toString())
      ).json();
    }

    setTimeout(
      async () => {
        const getRes = devMode
          ? { success: Math.random() > 0.5 ? true : false }
          : await (await device.getCommand(sendRes.id)).json();
        const isSucceeded = getRes.success ? true : false;
        setSending(isSucceeded ? SENDING_STATUS.SUCCESS : SENDING_STATUS.FAIL);
        updateState({
          isWaypointEditing: !isSucceeded,
          hasPath: isSucceeded,
        });
      },
      devMode ? 2000 : 20000
    );
  };

  const disableCancelBtn = sending === SENDING_STATUS.WAITING;
  const disableSendBtn =
    waypoints.length === 0 || sending === SENDING_STATUS.WAITING;

  return (
    <Container>
      {sending !== SENDING_STATUS.NONE && (
        <LoadingBar sending={sending} setSending={setSending} />
      )}

      {isWaypointPanelVisible && (
        <>
          {sending !== SENDING_STATUS.SUCCESS ? (
            <>
              <PropertyPanel
                waypointsProperties={waypointsProperties}
                controlsStates={controlsStates}
              />

              {showCancel && (
                <Modal
                  content={["Are you sure you want to cancel", "planning"]}
                  subContent={
                    "This action will delete all your progress and you will need to start over"
                  }
                  buttons={["BACK", "CANCEL"]}
                  handler1={() => setShowCancel(false)}
                  handler2={() => {
                    setShowCancel(false);
                    updateState({
                      isWaypointPanelVisible: false,
                      isWaypointEditing: false,
                      hasPath: false,
                    });
                    setWaypoints([]);
                    store.waypoints = [];
                  }}
                />
              )}

              <ControlButtonGroup
                disableBtn1={disableCancelBtn}
                disableBtn2={disableSendBtn}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    if (sending === SENDING_STATUS.NONE) setShowCancel(true);
                  }}
                  disabled={disableCancelBtn}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (
                      waypoints.length !== 0 &&
                      sending !== SENDING_STATUS.WAITING
                    )
                      sendBtnHandler();
                  }}
                  disabled={disableSendBtn}
                >
                  Send Path
                </Button>
              </ControlButtonGroup>
            </>
          ) : (
            <ControlButtonGroup large>
              <Button
                variant="contained"
                onClick={() => {
                  updateState({
                    isWaypointEditing: true,
                    isWaypointPanelVisible: true,
                    hasPath: false,
                    hasWaypointsPath: true,
                  });
                  setSending(SENDING_STATUS.NONE);
                }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  updateState({
                    isWaypointPanelVisible: false,
                    hasPath: false,
                  });
                  setSending(SENDING_STATUS.NONE);
                  setWaypoints([]);
                  store.waypoints = [];
                }}
              >
                Complete Planning
              </Button>
            </ControlButtonGroup>
          )}
        </>
      )}

      <ToggleIcon controlsStates={controlsStates} sending={sending} />
    </Container>
  );
};
