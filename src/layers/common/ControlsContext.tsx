import { IPose } from "@formant/data-sdk";
import React from "react";
import { WaypointData } from "../MissionPlanningLayer/Waypoint";

interface StateProps {
  isWaypointPanelVisible: boolean;
  isWaypointEditing: boolean;
  selectedWaypoint: number | null;
  commandName: string | undefined;
  hasPath: boolean;
  hasWaypointsPath: boolean;
  hasPointCloud: boolean;
  pointSize: number;
}

interface StoreProps {
  waypoints: WaypointData[];
}

export interface ControlsContextProps {
  waypoints: IPose[];
  setWaypoints: React.Dispatch<React.SetStateAction<IPose[]>>;
  state: StateProps;
  updateState: (s: Partial<StateProps>) => void;
  store: StoreProps;
}

export const ControlsContext = React.createContext<ControlsContextProps>(
  {} as ControlsContextProps
);

export function useControlsContext() {
  const all = React.useContext(ControlsContext);
  return all;
}

export function useControlsContextStates() {
  const [waypoints, setWaypoints] = React.useState<IPose[]>([]);
  const [state, setState] = React.useState<StateProps>({
    isWaypointPanelVisible: false,
    isWaypointEditing: false,
    selectedWaypoint: null,
    commandName: undefined,
    hasPath: true,
    hasWaypointsPath: true,
    hasPointCloud: false,
    pointSize: 1,
  });
  const storeRef = React.useRef<StoreProps>({
    waypoints: [],
  });

  const updateState = React.useCallback(
    (newItem: Partial<StateProps>) =>
      setState((prev) => ({ ...prev, ...newItem })),
    []
  );
  return {
    waypoints,
    setWaypoints,
    state,
    updateState,
    store: storeRef.current,
  };
}
