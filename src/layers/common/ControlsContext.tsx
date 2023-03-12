import React from "react";

interface StateProps {
  isWaypointVisible: boolean;
  isWaypointEditing: boolean;
}

export interface ControlsContextProps {
  state: StateProps;
  updateState: (s: Partial<StateProps>) => void;
  store: Object; // store camera controls or any data.
}

export const ControlsContext = React.createContext<ControlsContextProps>(
  {} as ControlsContextProps
);

export function useControlsContext() {
  const all = React.useContext(ControlsContext);
  return all;
}

export function useControlsContextStates() {
  const [state, setState] = React.useState<StateProps>({
    isWaypointVisible: false,
    isWaypointEditing: false,
  });
  const storeRef = React.useRef<any>({});

  const updateState = React.useCallback(
    (newItem: Partial<StateProps>) =>
      setState((prev) => ({ ...prev, ...newItem })),
    []
  );
  return {
    state,
    updateState,
    store: storeRef.current,
  };
}
