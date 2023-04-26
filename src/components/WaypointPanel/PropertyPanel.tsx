import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import * as THREE from "three";
import { ControlsContextProps } from "../../layers/common/ControlsContext";
import { getTaregt, TextInput } from "./TextInput";
import { DropdownInput } from "./DropdownInput";
import { WaypointPropertyType } from "../../config";
import { PanelContainer } from "./style";
import { Modal } from "./Modal";
import { PROPERTY_TYPE } from "../../layers/types";
import { BooleanToggle } from "./BooleanToggle";

interface Props {
  waypointsProperties: WaypointPropertyType[];
  controlsStates: ControlsContextProps;
}

export const PropertyPanel: React.FC<Props> = ({
  waypointsProperties,
  controlsStates,
}) => {
  const {
    waypoints,
    state: { selectedWaypoint, isWaypointEditing },
    updateState,
    store,
    setWaypoints,
  } = controlsStates;

  const [showDelete, setShowDelete] = useState(false);

  const elements: React.RefObject<HTMLInputElement | HTMLSelectElement>[] = [];
  for (let i = 0; i < waypointsProperties!.length; ++i) {
    elements[i] = React.useRef<HTMLInputElement | HTMLSelectElement>(null!);
  }
  const angleRef = React.useRef<HTMLInputElement>(null!);
  const xPosRef = React.useRef<HTMLInputElement>(null!);
  const yPosRef = React.useRef<HTMLInputElement>(null!);

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

  const deleteBtnHandler = () => {
    if (selectedWaypoint === null) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== selectedWaypoint));
    const { waypoints } = store;
    store.waypoints = waypoints.filter((_, idx) => idx !== selectedWaypoint);

    // Update panel when gizmo moving to the next point
    if (selectedWaypoint > 0) {
      updateState({ selectedWaypoint: selectedWaypoint - 1 });
    } else if (waypoints.length > 1) {
      updateState({ selectedWaypoint: waypoints.length - 2 });
    } else {
      updateState({ selectedWaypoint: null });
    }
  };

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

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        setShowDelete(true);
      }
    };
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, []);

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

  return (
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
              const euler = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(v));
              const { x, y, z, w } = new THREE.Quaternion().setFromEuler(euler);

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
            deleteBtnHandler();
          }}
        />
      )}
    </>
  );
};
