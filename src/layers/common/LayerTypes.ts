// these layer types represent special layer meta data that is used to
// for proper UI interactions
export enum LayerType {
  // A container layer is a layer that contains other layers
  // Clicking on it show go to it's first child layer
  CONTAINER = "container",
  // A trackable layer is a layer that is most likely to be used
  // tracked by the camera
  TRACKABLE = "trackable",
  OTHER = "other",
}
