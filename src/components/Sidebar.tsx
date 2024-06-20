import { Typography } from "@formant/ui-sdk";
import React, { useEffect } from "react";
import { LayerData, UIDataContext } from "../layers/common/UIDataContext";
import styled from "styled-components";
import { CheckIcon, EyeCloseIcon, EyeIcon, LayerIcon } from "./icons";
import { FormantColors } from "../layers/utils/FormantColors";
import { LayerType } from "../layers/common/LayerTypes";
import { Fleet } from "@formant/data-sdk";


const SidebarContent = styled.div`
  margin-top: 40px;
  width: 100%;
`

interface IToggleButton {
  sidebarVisible: boolean;
}

const ToggleButton = styled.div<IToggleButton>`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;

  width: 32px;
  height: 32px;
  background: ${(props: IToggleButton) =>
    props.sidebarVisible ? "#657197" : "#1C1E2D"};
  border-radius: 100px;
  z-index: 2;
  cursor: pointer;
`;

interface ILayersWrapper {
  visible: boolean;
}

const SidebarContainer = styled.div<ILayersWrapper>`
  overflow-y: auto;
  width: ${(props: ILayersWrapper) => (props.visible ? "252px" : "0px")};
  min-width: ${(props: ILayersWrapper) => (props.visible ? "252px" : "0px")};
  padding: ${(props: ILayersWrapper) => (props.visible ? "10px" : "0px")};
  background-color: #2D3855;
  transition: all 0.2s ease;
`;

interface ILayerRow {
  hasChildren: boolean;
  isLastChild: boolean;
  isChild: boolean;
  layerVisible: boolean;
  isSelectedMap: boolean;
}

const LayerRow = styled.div<ILayerRow>`
  cursor: ${(props: ILayerRow) => (props.hasChildren ? "default" : "pointer")};
  margin-bottom: ${(props: ILayerRow) =>
    (props.isChild && props.isLastChild) ? "8px" : "-3px"};
  height: 30px;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  background-color: ${(props: ILayerRow) =>
    props.isSelectedMap ? "#3B4668" : "transparent"
  };
  background-origin: padding-box;

  & svg,
  p,span {
  transition: all 0.05s ease;
  /* color: ${(props: ILayerRow) =>
    props.layerVisible ? FormantColors.silver : "#657197"}; */
  /* color: ${(props: ILayerRow) =>
    props.hasChildren || props.isSelectedMap ? "#FFFFFF" : "#BAC3E2"
  }; */
  font-weight: ${(props: ILayerRow) =>
    props.hasChildren ? "700" : "400"
  };
  letter-spacing: ${(props: ILayerRow) =>
    props.hasChildren ? "1.5px" : "0.6px"
  };
  line-height: ${(props: ILayerRow) =>
    props.hasChildren ? "20px" : "18px"
  };
  font-size: ${(props: ILayerRow) =>
    props.hasChildren ? "10px" : "13px"
  };
  text-transform: ${(props: ILayerRow) =>
    props.hasChildren ? "uppercase" : "none"
  };
}

  & svg {
    ${(props: ILayerRow) =>
    props.isSelectedMap ? "width: 18px; height: auto" : ""};
    cursor: pointer;
  }
  &:hover {
    & svg {
    opacity: 1;
  }
}
`;

const LayerTitle = styled.div`
display: flex;
gap: 8px;
align-items: center;
overflow: hidden;

  & svg {
  width: 18px;
  height: 18px;
}
`;

const MapSeparator = styled.hr`
  margin: 8px 0;
  border: 0;
  border-top: 1px solid #657197;
`;

interface IVisibilityIcon {
  layerVisible: boolean;
}

const VisibilityIcon = styled.div<IVisibilityIcon>`
  height: 24px;
  & svg {
  transition: all 0.1s ease;
  opacity: ${(props: IVisibilityIcon) => (props.layerVisible ? 0 : 1)};
}
`;

const typographyStyle = {
  fontSize: "0.9375rem",
  lineHeight: "24px",
  letterSpacing: "1px",
  fontFamily: "Inter",
  flex: "1",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: "1px",
};

const Sidebar = ({
  lookAtTargetId,
  toggleSidebarCallback
}: {
  lookAtTargetId: (targetId: string) => void;
  toggleSidebarCallback: (changedMap: boolean) => void;
}) => {
  const { layers, toggleVisibility } = React.useContext(UIDataContext);
  const [visible, setVisible] = React.useState(false);
  const [sortedLayers, setSortedLayers] = React.useState<LayerData[]>([]);
  const [layerMap, setLayerMap] = React.useState<{ [key: string]: LayerData }>(
    {}
  );
  const [deviceName, setDeviceName] = React.useState<string>("Current device");
  const [changedMap, setChangedMap] = React.useState<boolean>(false);

  const onToggleSidebarClicked = () => {
    toggleSidebarCallback(changedMap);
    setChangedMap(false);
    setVisible(!visible);
  };

  const isLayerMap = (layer: LayerData) => {
    return layer.treePath && layer.treePath[0] === 0 && layer.treePath.length > 1 || false;
  }

  const onLayerClicked = (layer: LayerData) => {
    if (isLayerMap(layer)) {
      onToggleLayerClicked(layer);
      setChangedMap(true);
    }
    return;
  }

  const onLayerDoubleClicked = (layer: LayerData) => {
    if (layer.type === LayerType.CONTAINER && hasChildren(layer)) {
      return;
    }
    lookAtTargetId(layer.id);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const currentDeviceId = query.get("device");
    if (!currentDeviceId) return;
    Fleet.getDevice(currentDeviceId).then((device) => {
      setDeviceName(device.name);
    });
  }, []);

  useEffect(() => {
    const _sortedLayers = layers.sort((a, b) => {
      if (!a.treePath || !b.treePath) return 0;
      const minLength = Math.min(a.treePath.length, b.treePath.length);
      for (let i = 0; i < minLength; i++) {
        if (a.treePath[i] !== b.treePath[i]) {
          return a.treePath[i] - b.treePath[i];
        }
      }
      return a.treePath.length - b.treePath.length;
    });
    const _layerMap: { [key: string]: LayerData } = {};
    _sortedLayers.forEach((l) => {
      _layerMap[l.id] = l;
    });


    setLayerMap(_layerMap);
    setSortedLayers(_sortedLayers);
  }, [layers]);

  const hasChildren = (layer: LayerData) => {
    return sortedLayers.some(
      (l) =>
        l.treePath &&
        layer.treePath &&
        l.treePath[0] === layer.treePath[0] &&
        l.treePath.length > layer.treePath.length
    );
  };

  const isLastChild = (layer: LayerData) => {
    if (layer.treePath?.length === 1) return false;
    return !sortedLayers.some(
      (l) =>
        l.treePath &&
        layer.treePath &&
        l.treePath[0] === layer.treePath[0] &&
        l.treePath[1] > layer.treePath[1]
    );
  };

  const isChild = (layer: LayerData) => {
    if (layer.treePath) {
      return layer.treePath.length > 1;
    }
    return false;
  };

  // get layer by tree path
  const getLayerByTreePath = (treePath: number[]) => {
    return sortedLayers.find((l) => {
      if (!l.treePath) return false;
      if (l.treePath.length !== treePath.length) return false;
      for (let i = 0; i < l.treePath.length; i++) {
        if (l.treePath[i] !== treePath[i]) return false;
      }
      return true;
    });
  };

  const onToggleLayerClicked = (layer: LayerData) => {
    toggleVisibility(layer.id);

    // if the clicked layer is a map, hide all other maps
    const parentLayer =
      layer.treePath &&
      layer.treePath.length > 1 &&
      getLayerByTreePath([layer.treePath[0]]);
    if (
      !parentLayer ||
      parentLayer.name !== "Maps" ||
      layer.type === LayerType.AXIS ||
      layer.visible
    ) {
      return;
    }

    // all other visible maps
    const siblings = Object.values(layerMap).filter((sibling) => {
      return (
        sibling.id !== layer.id &&
        sibling.id !== parentLayer.id &&
        sibling.treePath &&
        sibling.treePath[0] === layer.treePath![0] &&
        sibling.visible
      );
    });
    siblings.forEach((sibling) => {
      toggleVisibility(sibling.id);
    });
  };

  const renderIcons = (layer: LayerData) => {
    if (layer.treePath && layer.treePath.length === 1) {
      return null;
    }
    // if its a map, show checkmark
    if (isLayerMap(layer)) {
      return layer.visible ? <CheckIcon /> : <></>;
    }
    return <VisibilityIcon
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onToggleLayerClicked(layer);
      }}
      onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
      }}
      layerVisible={layer.visible}
    >
      {layer.visible ? <EyeIcon /> : <EyeCloseIcon />}
    </VisibilityIcon>;
  };

  const deviceLayers = sortedLayers.filter(
    (l) => l.treePath && l.treePath[0] === 1 && l.treePath.length > 1
  );

  const deviceLayersVisible = deviceLayers.some((l) => l.visible);

  const onToggleDeviceLayers = () => {
    const deviceLayers = sortedLayers.filter(
      (l) => l.treePath &&
        l.treePath[0] === 1 &&
        l.treePath.length > 1
    );
    if (deviceLayersVisible) {
      deviceLayers.filter((l) => l.visible).forEach((l) => {
        toggleVisibility(l.id);
      });
    } else {
      deviceLayers.forEach((l) => {
        toggleVisibility(l.id);
      });
    }

  };

  const getLayerTextColor = (layer: LayerData) => {
    if (layer.treePath?.length === 1) {
      return FormantColors.white;
    }
    if (layer.visible) {
      return FormantColors.silver;
    }
    return FormantColors.steel03;
  };
  return (
    <>
      <ToggleButton onClick={onToggleSidebarClicked} sidebarVisible={visible}>
        <LayerIcon active={visible} />
      </ToggleButton>
      <SidebarContainer
        visible={visible}
      >
        <SidebarContent>
          {deviceLayers.length > 0 && (
            <>
              <LayerRow
                hasChildren={true}
                isChild={false}
                isLastChild={false}
                isSelectedMap={false}
                layerVisible={true}
                id="device-title"
                key="device-title"
              >
                <LayerTitle>
                  <Typography variant="body1" sx={typographyStyle} color={FormantColors.white}>
                    Device
                  </Typography>
                </LayerTitle>

              </LayerRow>
              <LayerRow
                hasChildren={false}
                isChild={true}
                isLastChild={true}
                isSelectedMap={false}
                layerVisible={true}
                id="device-name"
                key="device-name"
              >
                <LayerTitle>
                  <Typography variant="body1" sx={typographyStyle} color={FormantColors.silver}>
                    {deviceName}
                  </Typography>
                </LayerTitle>
                <VisibilityIcon
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onToggleDeviceLayers();
                  }}
                  onDoubleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                  }}
                  layerVisible={deviceLayersVisible}
                >
                  {deviceLayersVisible ? <EyeIcon /> : <EyeCloseIcon />}
                </VisibilityIcon>
              </LayerRow>
            </>
          )}
          {sortedLayers.map((c, i) => {
            if (!hasChildren(c) && c.treePath && c.treePath.length === 1) return null;
            return (
              <React.Fragment key={c.id + c.name}>
                <LayerRow
                  hasChildren={hasChildren(c)}
                  isChild={isChild(c)}
                  isLastChild={isLastChild(c)}
                  onClick={() => onLayerClicked(c)}
                  onDoubleClick={() => onLayerDoubleClicked(c)}
                  layerVisible={c.visible}
                  isSelectedMap={isLayerMap(c) && c.visible}
                >
                  <LayerTitle>
                    <Typography variant="body1" sx={typographyStyle} color={() => getLayerTextColor(c)}>
                      {c.name}
                    </Typography>
                  </LayerTitle>
                  {renderIcons(c)}
                </LayerRow>
              </React.Fragment>
            );
          })}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
