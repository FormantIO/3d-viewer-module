import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import * as THREE from "three";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { DeviceContext } from "../../layers/common/DeviceContext";
import { getTaregt, TextInput } from "./TextInput";
import { DropdownInput } from "./DropdownInput";
import { Viewer3DConfiguration } from "../../config";
import { FormantColors } from "../../layers/utils/FormantColors";
import {
  ButtonsContainer,
  Container,
  DeleteConfirmPanel,
  PanelContainer,
  SButton,
} from "./style";
import { ToggleIcon } from "./ToggleIcon";

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

  let waypointsProperties: any[] = [];
  if (config) {
    const v = config.visualizations.filter(
      (_) => _.visualizationType === "Waypoints"
    ) as any;
    waypointsProperties =
      v.length > 0 && v[0].waypointsProperties ? v[0].waypointsProperties : [];
  }

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
        if (item.propertyType === "String") {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.stringDefault !== undefined
            ? item.stringDefault
            : "";
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === "Integer") {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.integerDefault !== undefined
            ? item.integerDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === "Float") {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.floatDefault !== undefined
            ? item.floatDefault
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === "Boolean") {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c =
            v !== undefined
              ? v
              : item.booleanDefault !== undefined
              ? item.booleanDefault
              : false;
          elements[idx].current!.value = (
            [true, false].indexOf(c) + 1
          ).toString();
        } else if (item.propertyType === "Enum") {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c = v !== undefined ? v : item.enumDefault;
          elements[idx].current!.value = [
            undefined,
            ...Array(item.enumLists!.length)
              .fill(0)
              // @ts-ignore
              .map((_, idx) => item[idx]),
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
      if (propertyType === "String") {
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
      } else if (propertyType === "Integer" || propertyType === "Float") {
        comps.push(
          <TextInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            type={propertyType === "Integer" ? "integer" : "float"}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] =
                  e.target.value;
              }
            }}
          />
        );
      } else if (propertyType === "Boolean") {
        comps.push(
          <DropdownInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            content={["True", "False"]}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] = [
                  null,
                  true,
                  false,
                ][parseInt(e.target.value)];
              }
            }}
          />
        );
      } else if (propertyType === "Enum") {
        comps.push(
          <DropdownInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            content={Array(item.enumLists!.length)
              .fill(0)
              // @ts-ignore
              .map((_, idx) => item[idx])}
            onChange={(e) => {
              if (selectedWaypoint !== null) {
                store.waypoints[selectedWaypoint][item.propertyName] = [
                  null,
                  ...Array(item.enumLists!.length)
                    .fill(0)
                    // @ts-ignore
                    .map((_, idx) => item[idx]),
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
                type="float"
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

              <Typography sx={{ marginTop: "20px" }}>POSITION</Typography>
              <TextInput
                ref={xPosRef}
                label="X-axis"
                type="float"
                onEnter={() => posHandler("x")}
              />
              <TextInput
                ref={yPosRef}
                label="Y-axis"
                type="float"
                onEnter={() => posHandler("y")}
              />

              {waypointsProperties.length > 0 && (
                <Typography sx={{ marginTop: "20px" }}>PROPERTIES</Typography>
              )}

              {createPropertyFields()}

              <SButton
                variant="contained"
                color="warning"
                sx={{ width: "100%", marginTop: "20px" }}
                onClick={() => {
                  if (waypoints.length === 0) return;
                  setShowDelete(true);
                }}
              >
                Delete
              </SButton>
            </PanelContainer>
          )}

          {showDelete && (
            <DeleteConfirmPanel>
              <div>
                Delete <b>waypoint</b>?
              </div>
              <Box
                component={"div"}
                display="flex"
                justifyContent="space-between"
                mt={"40px"}
              >
                <SButton
                  variant="contained"
                  sx={{ borderRadius: "20px", width: "150px", color: "white" }}
                  onClick={() => setShowDelete(false)}
                >
                  Cancel
                </SButton>
                <Button
                  variant="contained"
                  color="warning"
                  sx={{
                    borderRadius: "20px",
                    width: "150px",
                    backgroundColor: FormantColors.red,
                    color: "black",
                  }}
                  onClick={() => {
                    setShowDelete(false);
                    removeBtnHandler();
                  }}
                >
                  Delete
                </Button>
              </Box>
            </DeleteConfirmPanel>
          )}

          <ButtonsContainer>
            <Box
              component={"div"}
              display="flex"
              justifyContent={"space-between"}
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <SButton
                variant="contained"
                color="warning"
                onClick={() => {
                  updateState({ isWaypointEditing: false });
                  setWaypoints([]);
                  store.waypoints = [];
                }}
              >
                Cancel
              </SButton>
              <SButton
                variant="contained"
                onClick={() => {
                  if (waypoints.length !== 0) sendBtnHandler();
                }}
                disabled={waypoints.length === 0}
              >
                Send Path
              </SButton>
            </Box>
          </ButtonsContainer>
        </>
      )}

      <ToggleIcon controlsStates={controlsStates} />
    </Container>
  );
};
