import * as React from "react";
import { Icon, Tooltip, Typography } from "@formant/ui-sdk";
import styled from "styled-components";
import { TreeElement, TreePath } from "../model/ITreeElement";
import { LayerIcon, TextIcon } from "./icons";

interface ISortableTreeProps {
  items: TreeElement[];
  selected?: TreePath;
  onSelected?: (item: TreePath) => void;
  onIconSelected?: (item: TreePath, iconIndex: number) => void;
}

const IconDiv = styled.div`
  > svg {
    margin-bottom: -0.3rem;
    margin-left: 0.3rem;
  }
  display: inline-block;
`;

const TitleSpan = styled.span`
  max-width: 20rem;
  text-overflow: ellipsis;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
`;

const TreeItemDiv = styled.div`
  cursor: pointer;
  margin-top: 0.5rem;
  margin-bottom: 0rem;

  & svg, p {
    transition: all 0.05s ease;
  }

  &:hover {
    &  svg {
      visibility: initial;
    }
  }
`;

const IconsDiv = styled.div`
  float: right;
  margin-left: 8px;
`;

const layerIcon = (type: string = "", color: string = "white") => {
  switch (type) {
    case 'empty':
      return <Icon
        name="device"
        sx={{
          color,
          width: "1.3rem",
          height: "1.3rem",
        }}
      />;
    case 'ground':
    case 'map':
      return <LayerIcon />
    case 'point_cloud':
      return <Icon
        name="cube"
        sx={{
          width: "1.3rem",
          height: "1.3rem",
        }}
      />;
    case 'label':
      return <TextIcon />
    default:
      return <LayerIcon />;
  }

}

export function SortableTree(props: ISortableTreeProps) {
  const onIconClicked = (path: TreePath, iconIndex: number) => {
    if (props.onIconSelected) {
      props.onIconSelected(path, iconIndex);
    }
  };

  const select = (path: TreePath) => {
    if (props.onSelected) {
      props.onSelected(path);
    }
  };

  const onItemClicked = (p: TreePath) => {
    // select(p);
  };

  const onItemIconClicked = (currentPath: TreePath, iconIndex: number) => {
    onIconClicked(currentPath, iconIndex);
  };

  const renderTree = (elements: TreeElement[], pathSoFar: TreePath = []) => {
    const { selected } = props;
    return elements.map((e: TreeElement, elementIndex: number) => {
      const currentPath = [...pathSoFar, elementIndex];
      const isSelected =
        selected &&
        selected.length === currentPath.length &&
        selected.every(
          (val, selectedIndex) => val === currentPath[selectedIndex]
        );
      if (currentPath.length === 1) {
        return <div key={`tree_item${currentPath.join("-")}`}>{e.children && renderTree(e.children, currentPath)}</div>;
      }
      return (
        <React.Fragment key={`tree_item${currentPath.join("-")}`}>
          <TreeItemDiv>
            <span
              style={{
                marginLeft: `${(currentPath.length - 2) * 1.9}rem`,
                color: isSelected ? "#18d2ff" : "#BAC4E2",
              }}
            >
              <TitleSpan
                onClick={onItemClicked.bind(undefined, currentPath)}
                data-tooltip={e.title}
              >
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: '8px', ...((e.icons && e.icons[0].icon === 'eye_closed') && { opacity: 0.4 }) }}>
                  {layerIcon(e.type, e.textColor)}
                  {" "}
                  {e.title}
                  {" "}
                  {/* {e.textColor && (
                    <>
                      {" "}
                      <Icon
                        name="device"
                        sx={{
                          color: e.textColor,
                          width: "1rem",
                          height: "1rem",
                        }}
                      />
                    </>
                  )} */}
                </Typography>
              </TitleSpan>
            </span>
            <IconsDiv>
              {e.icons &&
                e.icons.map((icon, iconIndex) => (
                  <IconDiv
                    key={`tree_item_icon${currentPath.join("-")}-${currentPath
                      .map((_) => _.toString())
                      .join("-")}+${icon.icon}`}
                  >
                    <div
                      tabIndex={iconIndex}
                      role="button"
                      onClick={onItemIconClicked.bind(
                        undefined,
                        currentPath,
                        iconIndex
                      )}
                    >
                      <Icon
                        name={icon.icon}
                        sx={{
                          color: icon.color,
                          width: "1rem",
                          height: "1rem",
                          verticalAlign: 'sub',
                          ...((e.icons && e.icons[0].icon === 'eye') && { visibility: 'hidden' })
                        }}
                      />
                    </div>
                  </IconDiv>
                ))}
            </IconsDiv>
          </TreeItemDiv>
          <div>{e.children && renderTree(e.children, currentPath)}</div>
        </React.Fragment>
      );
    });
  };

  const { items } = props;
  return <div>{renderTree(items, [])}</div>;
}
