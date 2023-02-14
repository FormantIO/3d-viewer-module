// these alyer types represent special layer meta data that is used to
// for module level applications
export enum LayerType {
  CONTAINER = "container",
  // A trackable layer is a layer that is most likely to be used
  // tracked by the camera
  TRACKABLE = "trackable",
  OTHER = "other",
}
