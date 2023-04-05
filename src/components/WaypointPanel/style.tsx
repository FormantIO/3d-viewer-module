import styled from "styled-components";
import { FormantColors } from "../../layers/utils/FormantColors";
import { Button } from "@mui/material";

export const Container = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const PanelContainer = styled.div`
  position: absolute;
  bottom: 80px;
  left: 10px;
  width: 300px;
  height: calc(100% - 150px);
  overflow-y: auto;
  background-color: #2d3855;
  border-radius: 10px;
  padding: 20px;
  color: white;
  pointer-events: all;

  ::-webkit-scrollbar {
    width: 10px;
    background-color: #222735;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #515870;
    border-radius: 10px;
  }
`;

export const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 10px;
  width: 300px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  pointer-events: all;

  & > button {
    width: 48%;
    border-radius: 20px;
    color: black;
  }
`;

export const ConfirmPanelContainer = styled.div`
  width: 450px;
  height: 200px;
  border-radius: 10px;
  padding: 20px;
  background-color: ${FormantColors.module};
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  font-family: Inter;
  pointer-events: all;
`;

export const SButton = styled(Button)(() => ({
  "&.MuiButtonBase-root": {
    background: "#3e4b6c",
    borderRadius: "15px",
    paddingRight: "20px",
    paddingLeft: "20px",
  },
  height: "35px",
}));

export const btnCss = (color: string, hoverColor: string, extraCSS?: any) => ({
  backgroundColor: color,
  "&:hover": {
    backgroundColor: hoverColor,
  },
  ...extraCSS,
});
