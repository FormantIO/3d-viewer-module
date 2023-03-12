import { Icon, Typography } from "@formant/ui-sdk";
import React, { useEffect } from "react";
import { LayerData, UIDataContext } from "../layers/common/UIDataContext";
import styled from "styled-components";
import { CubeIcon, EyeCloseIcon, EyeIcon, LayerIcon, MapIcon } from "./icons";
import useWindowSize from "../common/useWindowSize";
import { FormantColors } from "../layers/utils/FormantColors";
import { LayerType } from "../layers/common/LayerTypes";

interface ITreeArea {
  visible: boolean;
  innerWidth?: number;
  layerCount?: number;
}

const SidebarContainer = styled.div<ITreeArea>`
  border-radius: 4px;
  position: absolute;
  z-index: 101;
  left: 14px;
  top: 16px;
  display: grid;
  max-height: 100%;
  transition: all 0.2s ease;
  background-color: #2d3855;
  width: ${(props) => (props.visible ? "184px" : "32px")};
  overflow: hidden;
  &:hover {
    width: 184px;
  }

  ${(props) =>
    props.innerWidth &&
    props.innerWidth > 452 &&
    `
    width: 384px;
    &:hover {
      width: 384px;
    }
  `}

  & * {
    user-select: none;
  }
`;

interface IToggleButton {
  innerWidth: number;
}

const ToggleButton = styled.div<IToggleButton>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 7px;
  height: "32px";

  & svg {
    color: white;
  }
`;

interface ILayersWrapper {
  visible: boolean;
  innerWidth: number;
  layerCount: number;
}

const LayersWrapper = styled.div<ILayersWrapper>`
  overflow-y: hidden;
  transition: height 0.3s ease-in-out;
  //transition-delay: 0.1s;
  height: ${(props) => (props.visible ? "auto" : "0px")};
  border-top: ${(props) => (props.visible ? "1px solid #3B4668" : "none")};
  overflow: hidden;
`;

interface ILayerRow {
  hasChildren: boolean;
  isLastChild: boolean;
  isChild: boolean;
  innerWidth: number;
  layerVisible: boolean;
}

const LayerRow = styled.div<ILayerRow>`
  cursor: pointer;
  border-bottom: ${(props) =>
    (!props.isChild || props.isLastChild) &&
    (props.hasChildren ? "none" : "1px solid #3B4668")};
  height: "32px";
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: ${(props) => (props.isChild ? "26px" : "0px")};

  & svg,
  p {
    transition: all 0.05s ease;
    color: ${(props) =>
      props.layerVisible ? FormantColors.silver : "#657197"};
  }

  &:hover {
    & svg {
      opacity: 1;
    }
  }

  &:last-child {
    border-bottom: none;
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
    opacity: ${(props) => (props.layerVisible ? 0 : 1)};
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
  const [width, height] = useWindowSize();

  const onToggleSidebarClicked = () => {
    setVisible(!visible);
  };

  const onLayerClicked = (layer: LayerData) => {
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

  return (
    <SidebarContainer visible={visible} innerWidth={width}>
      <ToggleButton onClick={onToggleSidebarClicked} innerWidth={width}>
        <LayerTitle>
          <LayerIcon />
          <Typography variant="body1" sx={typographyStyle}>
            Layers
          </Typography>
        </LayerTitle>
        <Icon name={visible ? "chevron-up" : "chevron-down"} />
      </ToggleButton>
      <LayersWrapper
        visible={visible}
        layerCount={sortedLayers.length}
        innerWidth={width}
      >
        {sortedLayers.map((c) => {
          return (
            <LayerRow
              key={c.id}
              hasChildren={hasChildren(c)}
              isChild={isChild(c)}
              isLastChild={isLastChild(c)}
              onDoubleClick={() => onLayerClicked(c)}
              innerWidth={width}
              layerVisible={c.visible}
            >
              <LayerTitle>
                {getLayerIcon(c)}
                <Typography variant="body1" sx={typographyStyle}>
                  {c.name}
                </Typography>
              </LayerTitle>
              <VisibilityIcon
                onClick={() => toggleVisibility(c.id)}
                layerVisible={c.visible}
              >
                {c.visible ? <EyeIcon /> : <EyeCloseIcon />}
              </VisibilityIcon>
            </LayerRow>
          );
        })}
      </LayersWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;
