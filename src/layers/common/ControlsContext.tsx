import { IPose } from "@formant/universe-core";
import React from "react";

interface StateProps {
  isWaypointVisible: boolean;
  isWaypointEditing: boolean;
  isPointSizeSliderVisible: boolean;
  selectedWaypoint: number | null;
  pointSize: number;
}

interface StoreProps {
  waypoints: any[];
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
    pointSize: 1,
    isPointSizeSliderVisible: false,
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
