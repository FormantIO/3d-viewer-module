import React, { useContext, useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import * as THREE from "three";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { DeviceContext } from "../../layers/common/DeviceContext";
import { getTaregt, TextInput } from "./TextInput";
import { DropdownInput } from "./DropdownInput";
import { Viewer3DConfiguration, WaypointPropertyType } from "../../config";
import { ControlButtonGroup, Container, PanelContainer } from "./style";
import { ToggleIcon } from "./ToggleIcon";
import { Modal } from "./Modal";
import { TYPES } from "./types";
import { BooleanToggle } from "./BooleanToggle";

interface Props {
  controlsStates: ControlsContextProps;
  config: Viewer3DConfiguration;
}

export const WaypointPanel: React.FC<Props> = ({ controlsStates, config }) => {
  const {
    waypoints,
    state: { selectedWaypoint, isWaypointEditing },
    updateState,
    store,
    setWaypoints,
  } = controlsStates;
  const device = useContext(DeviceContext);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const waypointsProperties: WaypointPropertyType[] = config.waypointMission
    ? config.waypointMission[0].waypointsProperties || []
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

  const sendBtnHandler = () => {
    const { waypoints } = store;
    if (waypoints.length > 0) {
      // Send
      if (device) {
        device.sendCommand("send_mission_waypoints", JSON.stringify(waypoints));
      }
      alert(JSON.stringify(waypoints));
    } else {
      alert("Create Waypoints To Send.");
    }
  };

  // Update fields with waypoints changed
  useEffect(() => {
    if (!isWaypointEditing || waypoints.length === 0) return;
    if (selectedWaypoint === null) {
      angleRef.current.value = "";
      xPosRef.current.value = "";
      yPosRef.current.value = "";
      if (waypointsProperties.length > 0) {
        waypointsProperties!.forEach(({ propertyType }, idx) => {
          if (propertyType === "String" || propertyType === "Integer") {
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
        if (item.propertyType === TYPES.STRING) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v ? v : item.stringDefault || "";
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === TYPES.INTEGER) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.integerDefault !== undefined
            ? item.integerDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === TYPES.FLOAT) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.floatDefault !== undefined
            ? item.floatDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === TYPES.BOOLEAN) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c =
            v !== undefined
              ? v
              : item.booleanDefault !== undefined
              ? item.booleanDefault
              : false;
          //@ts-ignore
          elements[idx].current!(v);
        } else if (item.propertyType === TYPES.ENUM) {
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
      if (propertyType === TYPES.STRING) {
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
        propertyType === TYPES.INTEGER ||
        propertyType === TYPES.FLOAT
      ) {
        comps.push(
          <TextInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            type={propertyType === TYPES.INTEGER ? propertyType : TYPES.FLOAT}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] =
                  e.target.value;
              }
            }}
          />
        );
      } else if (propertyType === TYPES.BOOLEAN) {
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
      } else if (propertyType === TYPES.ENUM) {
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
      {isWaypointEditing && (
        <>
          {waypoints.length > 0 && (
            <PanelContainer>
              <Typography>HEADING</Typography>

              <TextInput
                ref={angleRef}
                label={"Orientation"}
                type={TYPES.FLOAT}
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
                type={TYPES.FLOAT}
                onEnter={() => posHandler("x")}
              />
              <TextInput
                ref={yPosRef}
                label="Y-axis"
                type={TYPES.FLOAT}
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
                setShowCancel(true);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (waypoints.length !== 0) sendBtnHandler();
              }}
              disabled={waypoints.length === 0}
            >
              Send Path
            </Button>
          </ControlButtonGroup>
        </>
      )}

      <ToggleIcon controlsStates={controlsStates} />
    </Container>
  );
};
