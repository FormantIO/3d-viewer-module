import React, { useState } from "react";
import { Button } from "@mui/material";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { Viewer3DConfiguration, WaypointPropertyType } from "../../config";
import { ControlButtonGroup, Container } from "./style";
import { ToggleIcon } from "./ToggleIcon";
import { Modal } from "./Modal";
import { SENDING_STATUS } from "../../layers/types";
import { Authentication, Device, Fleet } from "@formant/data-sdk";
import { upload } from "../../common/upload";
import { PropertyPanel } from "./PropertyPanel";
import { LoadingBar } from "./LoadingBar";

const devMode = window.location.href.includes("module") ? false : true;

interface Props {
  controlsStates: ControlsContextProps;
  config: Viewer3DConfiguration;
}

export const MissionPlanning: React.FC<Props> = ({
  controlsStates,
  config,
}) => {
  const {
    waypoints,
    state: { isWaypointPanelVisible, commandName },
    updateState,
    store,
    setWaypoints,
  } = controlsStates;
  const [showCancel, setShowCancel] = useState(false);
  const [sending, setSending] = useState<SENDING_STATUS>(SENDING_STATUS.NONE);

  const waypointProperties: WaypointPropertyType[] =
    config.missionPlanning && config.missionPlanning.length > 0
      ? config.missionPlanning![0].waypointProperties || []
      : [];

  const hasPathLayer = config.visualizations
    .map((e) => e.visualizationType)
    .includes("Path");

  const sendBtnHandler = async () => {
    if (!commandName) return;

    const { waypoints } = store;

    setSending(SENDING_STATUS.WAITING);
    updateState({ isWaypointEditing: false });

    if (devMode) {
      setTimeout(() => {
        const s = Math.random() > 0.5;
        setSending(s ? SENDING_STATUS.SUCCESS : SENDING_STATUS.FAIL);
        updateState({
          isWaypointEditing: !s,
          hasPath: s,
        });
      }, 2000);
    } else {
      const device = await Fleet.getCurrentDevice()!;
      const fileID = await upload(Authentication.token!, { waypoints });
      const sendRes = await (
        await device.sendCommand(commandName, fileID.toString())
      ).json();

      const timer = window.setInterval(async () => {
        const res = await (await device.getCommand(sendRes.id)).json();
        if (res.success === true) {
          clearInterval(timer);
          setSending(SENDING_STATUS.SUCCESS);
          updateState({
            isWaypointEditing: false,
          });
        }

        if (res.success === false) {
          clearInterval(timer);
          setSending(SENDING_STATUS.FAIL);
          updateState({
            isWaypointEditing: true,
          });
        }
      }, 2000);
    }
  };

  const disableCancelBtn = sending === SENDING_STATUS.WAITING;
  const disableSendBtn =
    waypoints.length === 0 || sending === SENDING_STATUS.WAITING;

  return (
    <Container>
      <LoadingBar
        sending={sending}
        setSending={setSending}
        isWaypointPanelVisible={isWaypointPanelVisible}
      />
      <ToggleIcon controlsStates={controlsStates} hasPathLayer={hasPathLayer} />

      {isWaypointPanelVisible && (
        <>
          {sending !== SENDING_STATUS.SUCCESS ? (
            <>
              <PropertyPanel
                waypointProperties={waypointProperties}
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
                      hasPath: true,
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
                  onClick={() => setShowCancel(true)}
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
                    hasPath: true,
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
    </Container>
  );
};
