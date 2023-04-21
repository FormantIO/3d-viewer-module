import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import * as THREE from "three";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { getTaregt, TextInput } from "./TextInput";
import { DropdownInput } from "./DropdownInput";
import { Viewer3DConfiguration, WaypointPropertyType } from "../../config";
import {
  ControlButtonGroup,
  Container,
  PanelContainer,
  LoadingBar,
} from "./style";
import { ToggleIcon } from "./ToggleIcon";
import { Modal } from "./Modal";
import { PROPERTY_TYPE, SENDING_STATUS } from "../../layers/types";
import { BooleanToggle } from "./BooleanToggle";
import { Authentication, Fleet } from "@formant/data-sdk";
import { upload } from "./upload";

interface Props {
  controlsStates: ControlsContextProps;
  config: Viewer3DConfiguration;
}

export const WaypointPanel: React.FC<Props> = ({ controlsStates, config }) => {
  const {
    waypoints,
    state: { selectedWaypoint, isWaypointEditing, commandName },
    updateState,
    store,
    setWaypoints,
  } = controlsStates;
  const [showDelete, setShowDelete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [sending, setSending] = useState<SENDING_STATUS>(SENDING_STATUS.NONE);

  const waypointsProperties: WaypointPropertyType[] =
    config.waypointMission && config.waypointMission.length > 0
      ? config.waypointMission![0].waypointsProperties || []
      : [];

  const elements: React.RefObject<HTMLInputElement | HTMLSelectElement>[] = [];
  for (let i = 0; i < waypointsProperties!.length; ++i) {
    elements[i] = React.useRef<HTMLInputElement | HTMLSelectElement>(null!);
  }
  const angleRef = React.useRef<HTMLInputElement>(null!);
  const xPosRef = React.useRef<HTMLInputElement>(null!);
  const yPosRef = React.useRef<HTMLInputElement>(null!);

  const removeBtnHandler = () => {
    if (selectedWaypoint === null) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== selectedWaypoint));
    const { waypoints } = store;
    store.waypoints = waypoints.filter((_, idx) => idx !== selectedWaypoint);

    // Update panel when gizmo moving to the next point
    if (selectedWaypoint > 0) {
      const w = store.waypoints[selectedWaypoint];
      updateState({ selectedWaypoint: selectedWaypoint - 1 });
    } else if (waypoints.length > 1) {
      updateState({ selectedWaypoint: waypoints.length - 2 });
    } else {
      updateState({ selectedWaypoint: null });
    }
  };

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        setShowDelete(true);
      }
    };
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, []);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const sendBtnHandler = async () => {
    setSending(SENDING_STATUS.WAITING);
    await delay(2000);
    setSending(SENDING_STATUS.FAIL);

    // const { waypoints } = store;
    // const device = await Fleet.getCurrentDevice()!;
    // const fileID = await upload(Authentication.token!, { waypoints });
    // const command = await device.sendCommand(commandName, fileID.toString());
    // console.log("ttt", command);
    // setSending(SENDING_STATUS.SUCCESS);
  };

  // Remove failed red bar after 3s
  const failTimer = React.useRef<number>();
  useEffect(() => {
    if (sending === SENDING_STATUS.FAIL) {
      failTimer.current = window.setTimeout(() => {
        setSending(SENDING_STATUS.NONE);
      }, 3000);
    } else {
      clearTimeout(failTimer.current);
    }
    return () => {
      failTimer.current && clearTimeout(failTimer.current);
    };
  }, [sending, setSending]);

  // Update fields with waypoints changed
  useEffect(() => {
    if (!isWaypointEditing || waypoints.length === 0) return;
    if (selectedWaypoint === null) {
      angleRef.current.value = "";
      xPosRef.current.value = "";
      yPosRef.current.value = "";
      if (waypointsProperties.length > 0) {
        waypointsProperties!.forEach(({ propertyType }, idx) => {
          if (
            propertyType === PROPERTY_TYPE.STRING ||
            propertyType === PROPERTY_TYPE.INTEGER
          ) {
            elements[idx].current!.value = "";
          } else {
            elements[idx].current!.value = "0";
          }
        });
      }
      return;
    }
    const { pose } = store.waypoints[selectedWaypoint];
    const { x, y, z, w } = pose.rotation;
    const e = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(x, y, z, w)
    );
    angleRef.current.value = THREE.MathUtils.radToDeg(e.z).toFixed(2);
    xPosRef.current.value = pose.translation.x.toFixed(2);
    yPosRef.current.value = pose.translation.y.toFixed(2);

    if (waypointsProperties!.length > 0) {
      waypointsProperties!.forEach((item, idx) => {
        if (item.propertyType === PROPERTY_TYPE.STRING) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v ? v : item.stringDefault || "";
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === PROPERTY_TYPE.INTEGER) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.integerDefault !== undefined
            ? item.integerDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === PROPERTY_TYPE.FLOAT) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.floatDefault !== undefined
            ? item.floatDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === PROPERTY_TYPE.BOOLEAN) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c =
            v !== undefined
              ? v
              : item.booleanDefault !== undefined
              ? item.booleanDefault
              : false;
          //@ts-ignore
          elements[idx].current!(v);
        } else if (item.propertyType === PROPERTY_TYPE.ENUM) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c = v !== undefined ? v : item.enumDefault;
          elements[idx].current!.value = [
            undefined,
            ...Array(item.enumLists!.length)
              .fill(0)
              // @ts-ignore
              .map((_, idx) => item.enumLists[idx].enumList),
          ]
            .indexOf(c)
            .toString();
        }
      });
    }
  }, [selectedWaypoint, waypoints]);

  const posHandler = (axis: string) => {
    if (selectedWaypoint !== null) {
      let v = parseFloat(getTaregt(axis === "x" ? xPosRef : yPosRef).value);
      v = isNaN(v) ? 0 : v;
      const newPoints = [...waypoints];
      if (axis === "x") newPoints[selectedWaypoint].translation.x = v;
      else newPoints[selectedWaypoint].translation.y = v;
      setWaypoints(newPoints);
      store.waypoints[selectedWaypoint];
    }
  };

  const createPropertyFields = () => {
    const comps: any[] = [];
    waypointsProperties!.forEach((item, idx) => {
      const { propertyType } = item;
      if (propertyType === PROPERTY_TYPE.STRING) {
        comps.push(
          <TextInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] =
                  e.target.value;
              }
            }}
          />
        );
      } else if (
        propertyType === PROPERTY_TYPE.INTEGER ||
        propertyType === PROPERTY_TYPE.FLOAT
      ) {
        comps.push(
          <TextInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            type={
              propertyType === PROPERTY_TYPE.INTEGER
                ? propertyType
                : PROPERTY_TYPE.FLOAT
            }
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] =
                  e.target.value;
              }
            }}
          />
        );
      } else if (propertyType === PROPERTY_TYPE.BOOLEAN) {
        comps.push(
          <BooleanToggle
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            onChange={(value: boolean) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] = value;
              }
            }}
          />
        );
      } else if (propertyType === PROPERTY_TYPE.ENUM) {
        comps.push(
          <DropdownInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            content={Array(item.enumLists!.length)
              .fill(0)
              // @ts-ignore
              .map((_, idx) => item.enumLists[idx].enumList)}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] = [
                  null,
                  ...Array(item.enumLists!.length)
                    .fill(0)
                    // @ts-ignore
                    .map((_, idx) => item.enumLists[idx].enumList),
                ][parseInt(e.target.value)];
              }
            }}
          />
        );
      }
    });
    return comps;
  };

  return (
    <Container>
      {sending !== SENDING_STATUS.NONE && (
        <LoadingBar
          leftAlign={sending === SENDING_STATUS.WAITING}
          fail={sending === SENDING_STATUS.FAIL}
        >
          <p>
            {sending === SENDING_STATUS.WAITING
              ? "Sending waypoints to device"
              : sending === SENDING_STATUS.SUCCESS
              ? "SENT"
              : "FAIL"}
          </p>
        </LoadingBar>
      )}

      {isWaypointEditing && sending !== SENDING_STATUS.SUCCESS && (
        <>
          {waypoints.length > 0 && (
            <PanelContainer>
              <Typography>HEADING</Typography>

              <TextInput
                ref={angleRef}
                label={"Orientation"}
                type={PROPERTY_TYPE.FLOAT}
                onEnter={() => {
                  if (selectedWaypoint === null) return;
                  let v = parseFloat(getTaregt(angleRef).value);
                  v = isNaN(v) ? 0 : v;
                  const euler = new THREE.Euler(
                    0,
                    0,
                    THREE.MathUtils.degToRad(v)
                  );
                  const { x, y, z, w } = new THREE.Quaternion().setFromEuler(
                    euler
                  );

                  const newPoints = [...waypoints];
                  newPoints[selectedWaypoint].rotation = { x, y, z, w };
                  setWaypoints(newPoints);
                  store.waypoints[selectedWaypoint].pose.rotation = {
                    x,
                    y,
                    z,
                    w,
                  };
                }}
              />

              <Typography marginTop={"20px"}>POSITION</Typography>
              <TextInput
                ref={xPosRef}
                label="X-axis"
                type={PROPERTY_TYPE.FLOAT}
                onEnter={() => posHandler("x")}
              />
              <TextInput
                ref={yPosRef}
                label="Y-axis"
                type={PROPERTY_TYPE.FLOAT}
                onEnter={() => posHandler("y")}
              />

              {waypointsProperties.length > 0 && (
                <Typography marginTop={"20px"}>PROPERTIES</Typography>
              )}

              {createPropertyFields()}

              <Button
                variant="contained"
                onClick={() => {
                  if (waypoints.length === 0) return;
                  setShowDelete(true);
                }}
              >
                Delete
              </Button>
            </PanelContainer>
          )}

          {showDelete && (
            <Modal
              content={["Delete", "waypoint"]}
              buttons={["CANCEL", "DELETE"]}
              handler1={() => setShowDelete(false)}
              handler2={() => {
                setShowDelete(false);
                removeBtnHandler();
              }}
            />
          )}

          {showCancel && (
            <Modal
              content={["Are you sure you want to cancel", "planning"]}
              buttons={["BACK", "CANCEL"]}
              handler1={() => setShowCancel(false)}
              handler2={() => {
                setShowCancel(false);
                updateState({ isWaypointEditing: false });
                setWaypoints([]);
                store.waypoints = [];
              }}
            />
          )}

          <ControlButtonGroup>
            <Button
              variant="contained"
              onClick={() => {
                if (sending === SENDING_STATUS.NONE) setShowCancel(true);
              }}
              disabled={sending === SENDING_STATUS.WAITING}
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
              disabled={
                waypoints.length === 0 || sending === SENDING_STATUS.WAITING
              }
            >
              Send Path
            </Button>
          </ControlButtonGroup>
        </>
      )}

      {isWaypointEditing && sending === SENDING_STATUS.SUCCESS && (
        <ControlButtonGroup large>
          <Button
            variant="contained"
            onClick={() => {
              updateState({ isWaypointEditing: true });
              setSending(SENDING_STATUS.NONE);
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              updateState({ isWaypointEditing: false });
              setSending(SENDING_STATUS.NONE);
              setWaypoints([]);
              store.waypoints = [];
            }}
          >
            Complete Planning
          </Button>
        </ControlButtonGroup>
      )}

      <ToggleIcon controlsStates={controlsStates} />
    </Container>
  );
};
