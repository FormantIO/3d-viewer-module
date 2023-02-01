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

const LayerRow = styled.div`
cursor: pointer;
  border-bottom: 1px solid #1C1E2D;
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
`;


const Sidebar = () => {
    const { layers, toggleVisibility } = React.useContext(UIDataContext);
    const [visible, setVisible] = React.useState(false);

    const onToggleSidebarClicked = () => {
        setVisible(!visible);
    }

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
                {layers.map((c) => {
                    return <LayerRow key={c.id}>
                        <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
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