import { Icon, Typography } from "@formant/ui-sdk";
import React from "react";
import { UIDataContext } from "../UIDataContext";
import styled from "styled-components";
import { LayerIcon } from "./icons";

interface ITreeArea {
  visible: boolean
};

const SidebarContainer = styled.div<ITreeArea>`
  border-radius: 4px;
  position: absolute;
  z-index: 1;
  left: 14px;
  top: 16px;
  display: grid;
  max-height: 100%;
  transition: all 0.2s ease;
  background-color: #2d3855;
  width: ${(props) => (props.visible || window.innerWidth > 400) ? '240px' : '32px'};
  overflow: hidden;
  &:hover {
    width: 240px;
  }
`;


const ToggleButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding-right: 8px;

  & svg {
    color: white;
  }

`;

const LayersWrapper = styled.div<ITreeArea>`
  overflow-y: hidden;
  transition: max-height 0.3s ease-in-out;
  //transition-delay: 0.1s;
  max-height: ${(props) => props.visible ? '500px' : '0px'};
  border-top: ${(props) => props.visible ? '1px solid #1C1E2D' : 'none'};
  &:hover {
    overflow-y: auto;
  }
`;

interface ILayerRow {
  hasChildren: boolean;
  isLastChild: boolean;
  isChild: boolean;
}

const LayerRow = styled.div<ILayerRow>`
  cursor: pointer;
  border-bottom: ${(props) =>
    (!props.isChild || props.isLastChild) && (props.hasChildren ? 'none' : '1px solid #1C1E2D')
  };
  height: 40px;
  padding: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  & svg, p {
    transition: all 0.05s ease;
  }

  &:hover {
    &  svg {
      visibility: initial;
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;


const Sidebar = () => {
  const { layers, toggleVisibility, setCameraTargetId } = React.useContext(UIDataContext);
  const [visible, setVisible] = React.useState(false);

  const onToggleSidebarClicked = () => {
    setVisible(!visible);
  }

  const onLayerClicked = (id: string) => {
    setCameraTargetId(id);
  }

  const sortedLayers = layers.sort((a, b) => {
    if (!a.treePath || !b.treePath) return 0;
    const minLength = Math.min(a.treePath.length, b.treePath.length);
    for (let i = 0; i < minLength; i++) {
      if (a.treePath[i] !== b.treePath[i]) {
        return a.treePath[i] - b.treePath[i];
      }
    }
    return a.treePath.length - b.treePath.length;
  });

  const hasChildren = (layer: any) => {
    return sortedLayers.some(l => l.treePath && l.treePath[0] === layer.treePath[0] && l.treePath.length > layer.treePath.length);
  };

  const isLastChild = (layer: any) => {
    if (layer.treePath?.length === 1) return false;
    return !sortedLayers.some(l => l.treePath && l.treePath[0] === layer.treePath[0] && l.treePath[1] > layer.treePath[1]);
  };

  const isChild = (layer: any) => {
    return layer.treePath?.length > 1;
  };

  return (
    <SidebarContainer visible={visible}>
      <ToggleButton onClick={onToggleSidebarClicked}>
        <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <LayerIcon />

          {" "}
          Layers
          {" "}
        </Typography>
        <Icon name={visible ? "chevron-up" : "chevron-down"} />
      </ToggleButton>
      <LayersWrapper visible={visible}>
        {sortedLayers.map((c) => {
          return <LayerRow key={c.id} hasChildren={hasChildren(c)} isChild={isChild(c)} isLastChild={isLastChild(c)} onDoubleClick={() => onLayerClicked(c.id)} >
            <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', marginLeft: c.treePath ? (c.treePath.length) * 20 + 'px' : 0 }}>
              <LayerIcon />
              {" "}
              {c.name}
              {" "}
            </Typography>
            <input type="checkbox" checked={c.visible} onChange={() => toggleVisibility(c.id)} />
          </LayerRow>
        })}
      </LayersWrapper>
    </SidebarContainer>
  );
}

export default Sidebar;