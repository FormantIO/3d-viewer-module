import { IPose } from "@formant/universe-core";
import React from "react";
import { WaypointData } from "../WaypointsLayer/Waypoint";

interface StateProps {
  isWaypointVisible: boolean;
  isWaypointEditing: boolean;
  selectedWaypoint: number | null;
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
    isWaypointVisible: false,
    isWaypointEditing: false,
    selectedWaypoint: null,
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
