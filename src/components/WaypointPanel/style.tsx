import styled from "styled-components";
import { FormantColors } from "../../layers/utils/FormantColors";

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

  /* Delete Button */
  & > button {
    width: 100%;
    margin-top: 20px;
    border-radius: 15px;
    background-color: #3e4b6c;
    &:hover {
      background-color: #5a6582;
    }
  }

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

export const ControlButtonGroup = styled.div`
  position: absolute;
  bottom: 20px;
  left: 10px;
  width: 300px;
  height: 35px;
  display: flex;
  justify-content: space-between;
  pointer-events: all;

  & > button {
    width: 48%;
    border-radius: 20px;
    color: black;
  }
  & > button:nth-of-type(1) {
    background-color: #bac4e2;
    &:hover {
      background-color: #d9e0f0;
    }
  }
  & > button:nth-of-type(2) {
    background-color: #18d2ff;
    &:hover {
      background-color: #6ee0fd;
    }
  }
`;

export const ModalContainer = styled.div`
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

  & > div:nth-of-type(1) {
    margin: 10px 0 0 10px;
  }
  & > div:nth-of-type(2) {
    margin: 70px 0 0 100px;
    display: flex;
    justify-content: space-between;
    & > button {
      width: 48%;
      height: 45px;
      border-radius: 20px;
    }
    & > button:nth-of-type(1) {
      color: white;
      background-color: #3e4b6c;
      &:hover {
        background-color: #60729f;
      }
    }
    & > button:nth-of-type(2) {
      color: black;
      background-color: #ea719d;
      &:hover {
        background-color: #ec9fbb;
      }
    }
  }
`;

export const TextInputContainer = styled.div`
  height: 70px;
  margin-top: 10px;
  & > label {
    font-family: Inter;
    font-size: 12px;
    padding-left: 5px;
  }
  & > input {
    width: 100%;
    height: 40px;
    background-color: ${FormantColors.steel01};
    padding: 0.5rem;
    border-radius: 0.25rem;
    outline: none;
    border: none;
    color: white;
    margin-top: 0.5rem;
  }
`;

export const ToggleIconContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-direction: column;
  position: absolute;
  top: ${({ hasPointCloud }: { hasPointCloud: boolean }) =>
    hasPointCloud ? "210px" : "120px"};
  right: 10px;
  pointer-events: none;

  & > div {
    box-shadow: 0 0 1.25rem #0a0b10;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  }
`;

export const DropdownContainer = styled.div`
  height: 70px;
  margin-top: 10px;
  & > label {
    font-family: Inter;
    font-size: 12px;
    padding-left: 5px;
  }
  & > select {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    color: white;
    padding: 8px;
    border-radius: 4px;
    outline: none;
    border: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background: ${FormantColors.steel01}
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24" id="arrow-drop-down"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M7 10l5 5 5-5H7z"></path></svg>')
      no-repeat 30px;
    background-position-x: calc(100% - 5px);
    background-position-y: center;
  }
`;
