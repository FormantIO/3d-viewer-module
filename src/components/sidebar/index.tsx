import { Icon } from "@formant/ui-sdk";
import React from "react";
import styled from "styled-components";
import {
  TreeElement,
  TreePath,
  treePathEquals,
} from "../../model/ITreeElement";
import { SortableTree } from "../SortableTree";

interface ISidebarContainer {
  visible: boolean
};

const SidebarContainer = styled.div<ISidebarContainer>`
  ".visible": {
    left: 0;
    background-color: pink;
  }
  background-color: #2d3855;
  position: absolute;
  z-index: 1;
  left: ${(props) => props.visible ? '0' : '-400px'};
  padding: 1rem 0 1rem 1rem;
  display: grid;
  gap: 1rem;
  max-height: 100%;
  overflow-y: scroll;
  transition: all 0.2s ease;

`;

const PropertiesSectionDiv = styled.div`
  display: grid;
  margin-bottom: 2rem;
`;

const ToggleButton = styled.button`
  width: 20px;
  height: 20px;
  color: white;
  cursor: pointer;
  background: none;
  border: none;
`;

const TreeArea = styled.div`
  overflow-y: scroll;
`;

export interface IUniverseSidebarProps {
  onToggleSidebar: () => void;
  onIconInteracted?: (currentPath: TreePath,
    iconIndex: number) => void;
  onItemSelected: (currentPath?: TreePath) => void;
  tree: TreeElement[];
  children?: React.ReactNode;
}

export function UniverseSidebar({
  onToggleSidebar,
  onIconInteracted,
  onItemSelected,
  tree,
  children,
}: IUniverseSidebarProps) {
  const [selected, setSelected] = React.useState<TreePath | undefined>(
    undefined
  );
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
  }, [])


  const onTreeNodeSelect = (path: TreePath) => {
    const currentSelected = selected && treePathEquals(selected, path);
    setSelected(currentSelected ? undefined : path);
    onItemSelected(currentSelected ? undefined : path.slice(1));
  };

  const onTreeNodeIconSelect = (path: TreePath, iconIndex: number) => {
    if (onIconInteracted) onIconInteracted(path.slice(1), iconIndex);
  };

  const onToggleSidebarClicked = () => {
    setVisible(false);
    setTimeout(() => {
      onToggleSidebar();
    }, 200);
  }

  return (
    <SidebarContainer visible={visible}>
      <ToggleButton type="button" onClick={onToggleSidebarClicked}>
        <Icon name="arrow-left" />
      </ToggleButton>
      <TreeArea>
        <SortableTree
          items={tree}
          selected={selected}
          onSelected={onTreeNodeSelect}
          onIconSelected={onTreeNodeIconSelect}
        />
      </TreeArea>
      {/* <PropertiesSectionDiv>{children}</PropertiesSectionDiv> */}
    </SidebarContainer>
  );
}
