import React, { useEffect, useState } from "react";
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
  waypointProperties: WaypointPropertyType[];
  controlsStates: ControlsContextProps;
}

export const PropertyPanel: React.FC<Props> = ({
  waypointProperties,
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
  for (let i = 0; i < waypointProperties!.length; ++i) {
    elements[i] = React.useRef<HTMLInputElement | HTMLSelectElement>(null!);
  }
  const angleRef = React.useRef<HTMLInputElement>(null!);
  const xPosRef = React.useRef<HTMLInputElement>(null!);
  const yPosRef = React.useRef<HTMLInputElement>(null!);

  const createPropertyFields = () => {
    const comps: any[] = [];
    waypointProperties!.forEach((item, idx) => {
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
            min={item.min}
            max={item.max}
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
      } else if (propertyType === PROPERTY_TYPE.ENUM && item.enumLists) {
        const { enumLists } = item;
        const enumContent = enumLists.map((e) => e.enumList);
        comps.push(
          <DropdownInput
            key={idx}
            ref={elements[idx]}
            label={item.propertyName}
            content={enumContent}
            onChange={(e) => {
              if (selectedWaypoint === null) return;
              const idx = parseInt(e.target.value);
              store.waypoints[selectedWaypoint][item.propertyName] = [
                idx,
                enumContent[idx],
              ];
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
      if (waypointProperties.length > 0) {
        waypointProperties!.forEach(({ propertyType }, idx) => {
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

    if (waypointProperties!.length > 0) {
      waypointProperties!.forEach((item, idx) => {
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
            : item.min! > 0
            ? item.min
            : 0;
          store.waypoints[selectedWaypoint][item.propertyName] =
            elements[idx].current!.value;
        } else if (item.propertyType === PROPERTY_TYPE.FLOAT) {
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          elements[idx].current!.value = v
            ? v
            : item.floatDefault !== undefined
            ? item.floatDefault
            : item.min! > 0
            ? item.min
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
          store.waypoints[selectedWaypoint][item.propertyName] = c;
          //@ts-ignore
          elements[idx].current!(v);
        } else if (item.propertyType === PROPERTY_TYPE.ENUM) {
          const { enumDefault, enumLists } = item;
          if (!enumLists) return;
          const v = store.waypoints[selectedWaypoint][item.propertyName];
          const c: [number, string] = [0, enumLists[0].enumList];

          if (v) {
            c[0] = v[0];
            c[1] = v[1];
          } else if (enumDefault !== undefined) {
            c[0] = enumLists.map((el) => el.enumList).indexOf(enumDefault);
            c[1] = enumDefault;
            if (c[0] === -1) {
              c[0] = 0;
              c[1] = enumLists[0].enumList;
            }
          }
          store.waypoints[selectedWaypoint][item.propertyName] = c;
          elements[idx].current!.value = c[0].toString();
        }
      });
    }
  }, [selectedWaypoint, waypoints]);

  return (
    <>
      <PanelContainer>
        {waypoints.length > 0 ? (
          <>
            {/* <Typography>HEADING</Typography> */}
            <h1>HEADING</h1>

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

            {/* <Typography marginTop={"20px"}>POSITION</Typography> */}
            <h1>POSITION</h1>
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

            {waypointProperties.length > 0 && (
              // <Typography marginTop={"20px"}>PROPERTIES</Typography>
              <h1>PROPERTIES</h1>
            )}

            {createPropertyFields()}

            <button
              //variant="contained"
              onClick={() => {
                if (waypoints.length === 0) return;
                setShowDelete(true);
              }}
            >
              Delete
            </button>
          </>
        ) : (
          <p className="description">
            "Click Shift + Left click on the scene to drop a pin"
          </p>
        )}
      </PanelContainer>

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
