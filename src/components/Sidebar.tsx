import { Icon, Typography } from "@formant/ui-sdk";
import React, { useEffect } from "react";
import { LayerData, UIDataContext } from "../layers/common/UIDataContext";
import styled from "styled-components";
import { CheckIcon, CubeIcon, EyeCloseIcon, EyeIcon, LayerIcon, MapIcon } from "./icons";
import useWindowSize from "../common/useWindowSize";
import { FormantColors } from "../layers/utils/FormantColors";
import { LayerType } from "../layers/common/LayerTypes";
import getUuidByString from "uuid-by-string";

interface ITreeArea {
  visible: boolean;
  innerWidth?: number;
  layerCount?: number;
}


const SidebarContent = styled.div`
  margin-top: 40px;
  width: 100%;

`

interface IToggleButton {
  innerWidth: number;
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

  background: #657197;
  border-radius: 100px;
  z-index: 2;
  cursor: pointer;
`;

interface ILayersWrapper {
  visible: boolean;
  innerWidth: number;
  layerCount: number;
}

const SidebarContainer = styled.div<ILayersWrapper>`
  overflow-y: scroll;
  // make it a sliding panel from the left when visible
  width: ${(props: ILayersWrapper) => (props.visible ? "252px" : "0px")};
  min-width: ${(props: ILayersWrapper) => (props.visible ? "252px" : "0px")};
  padding: ${(props: ILayersWrapper) => (props.visible ? "10px" : "0px")};
  background-color: #2D3855;
`;

interface ILayerRow {
  hasChildren: boolean;
  isLastChild: boolean;
  isChild: boolean;
  innerWidth: number;
  layerVisible: boolean;
  isSelectedMap: boolean;
}

const LayerRow = styled.div<ILayerRow>`
  cursor: pointer;
  margin-bottom: ${(props: ILayerRow) =>
    (props.isChild && props.isLastChild) ? "8px" : "-6px"};
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
  color: ${(props: ILayerRow) =>
    props.hasChildren || props.isSelectedMap ? "#FFFFFF" : "#BAC3E2"
  };
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
    props.isSelectedMap ? "width: 18px; height: auto" : ""}
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

interface IVisibilityIcon {
  layerVisible: boolean;
}

const VisibilityIcon = styled.div<IVisibilityIcon>`
  & svg {
  transition: all 0.1s ease;
  opacity: ${(props: IVisibilityIcon) => (props.layerVisible ? 0 : 1)};
}
`;

const typographyStyle = {
  color: FormantColors.silver,
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
}: {
  lookAtTargetId: (targetId: string) => void;
}) => {
  const { layers, toggleVisibility } = React.useContext(UIDataContext);
  const [visible, setVisible] = React.useState(false);
  const [sortedLayers, setSortedLayers] = React.useState<LayerData[]>([]);
  const [layerMap, setLayerMap] = React.useState<{ [key: string]: LayerData }>(
    {}
  );
  const [width, height] = useWindowSize();

  const onToggleSidebarClicked = () => {
    setVisible(!visible);
  };

  const isLayerMap = (layer: LayerData) => {
    return layer.treePath && layer.treePath[0] === 0 && layer.treePath.length > 1 && layer.type !== LayerType.AXIS || false;
  }

  const onLayerClicked = (layer: LayerData) => {
    if (isLayerMap(layer)) {
      onToggleLayerClicked(layer);
    }
    return;
  }

  const onLayerDoubleClicked = (layer: LayerData) => {
    if (layer.type === LayerType.CONTAINER && hasChildren(layer)) {
      const markerChild = layers.find(
        (l) =>
          l.treePath &&
          layer.treePath &&
          l.treePath[0] === layer.treePath[0] &&
          l.treePath.length === 2 &&
          l.type === LayerType.TRACKABLE
      );
      if (markerChild) {
        lookAtTargetId(markerChild.id);
        return;
      }
    }
    lookAtTargetId(layer.id);
  };

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

  const getLayerIcon = (layer: LayerData) => {
    if (layer.iconUrl) {
      return <img width="18" height="18" src={layer.iconUrl} />;
    } else {
      return <LayerIcon disabled={!layer.visible} />;
    }
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

    // all other visible maps that arent axis
    const siblings = Object.values(layerMap).filter((sibling) => {
      return (
        sibling.id !== layer.id &&
        sibling.id !== parentLayer.id &&
        sibling.treePath &&
        sibling.treePath[0] === layer.treePath![0] &&
        sibling.type !== LayerType.AXIS &&
        sibling.visible
      );
    });
    siblings.forEach((sibling) => {
      toggleVisibility(sibling.id);
    });
  };

  const renderIcons = (layer: LayerData) => {
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


  return (
    <>
      <ToggleButton onClick={onToggleSidebarClicked} innerWidth={width}>
        <LayerIcon />
      </ToggleButton>
      <SidebarContainer
        visible={visible}
        layerCount={sortedLayers.length}
        innerWidth={width}
      >
        <SidebarContent>
          {sortedLayers.map((c) => {
            return (
              <LayerRow
                key={c.id}
                hasChildren={hasChildren(c)}
                isChild={isChild(c)}
                isLastChild={isLastChild(c)}
                onClick={() => onLayerClicked(c)}
                onDoubleClick={() => onLayerDoubleClicked(c)}
                innerWidth={width}
                layerVisible={c.visible}
                isSelectedMap={isLayerMap(c) && c.visible}
              >
                <LayerTitle>
                  <Typography variant="body1" sx={typographyStyle}>
                    {c.name}
                  </Typography>
                </LayerTitle>
                {renderIcons(c)}
              </LayerRow>
            );
          })}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
