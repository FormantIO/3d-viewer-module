import styled, { css } from "styled-components";
import { FormantColors } from "../../layers/utils/FormantColors";
import { SENDING_STATUS } from "../../lib";

export const Container = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  /* Prevent Text Selection */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;

  pointer-events: none;
`;

export const PanelContainer = styled.div`
  position: absolute;
  bottom: 80px;
  left: 10px;
  width: 300px;
  height: calc(100% - 100px);
  overflow-y: auto;
  background-color: #2d3855;
  border-radius: 10px;
  padding: 20px;
  color: white;
  pointer-events: all;

  & > p.description {
    font-family: Inter;
    text-align: center;
    position: absolute;
    left: 0;
    top: 50%;
    padding: 8px;
    transform: translate(0, -50%);
  }

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

interface CBGProps {
  large?: boolean;
  disableBtn1?: boolean;
  disableBtn2?: boolean;
}
export const ControlButtonGroup = styled.div`
  position: absolute;
  bottom: 20px;
  left: 10px;
  width: ${({ large }: CBGProps) => (large ? "400px" : "300px")};
  height: 35px;
  display: flex;
  justify-content: space-between;
  pointer-events: all;

  & > button {
    width: 48%;
    border-radius: 20px;
    color: black;
    &:disabled {
      cursor: not-allowed;
      pointer-events: all !important;
    }
  }

  & > button:nth-of-type(1) {
    background-color: #bac4e2;
    &:hover {
      background-color: #d9e0f0;
    }
    ${({ disableBtn1 }: CBGProps) =>
      disableBtn1 &&
      css`
        color: #8c909b;
        background-color: ${FormantColors.steel02};
        &:hover {
          background-color: ${FormantColors.steel02};
        }
      `}
  }
  & > button:nth-of-type(2) {
    background-color: #18d2ff;
    white-space: nowrap;
    &:hover {
      background-color: #53d7f8;
    }

    ${({ disableBtn2 }: CBGProps) =>
      disableBtn2 &&
      css`
        color: #8c909b;
        background-color: ${FormantColors.steel02};
        &:hover {
          background-color: ${FormantColors.steel02};
        }
      `}
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
  & > p {
    position: absolute;
    top: 70px;
    margin: 0 20px 0 10px;
    font-size: 15px;
    font-style: italic;
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
    hasPointCloud ? "195px" : "100px"};
  right: 10px;
  pointer-events: none;

  & > div {
    background-color: #1c1e2d;
    box-shadow: 0 0 1.25rem #0a0b10;
    box-sizing: border-box;
    border: 0.078125rem solid #3b4668;
    width: 26px;
    height: 26px;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
    margin-top: 10px;
    & > svg {
      vertical-align: middle;
      fill: #bac4e2;
    }
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

export const BooleanToggleContainer = styled.div`
  height: 70px;
  margin-top: 10px;
  font-family: Inter;

  & > label {
    font-size: 12px;
    padding-left: 5px;
  }

  & > div {
    width: 100%;
    height: 40px;
    background-color: ${FormantColors.steel02};
    padding: 0 15px 0 15px;
    border-radius: 0.25rem;
    color: white;
    margin-top: 0.5rem;

    display: flex;
    justify-content: space-between;
    align-items: center;
    & > div:nth-of-type(1) {
      font-size: 12px;
    }
  }
`;

interface LoadingProps {
  sending: SENDING_STATUS;
}
export const LoadingBarContainer = styled.div`
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 0;
  display: flex;
  justify-content: ${({ sending }: LoadingProps) =>
    sending === SENDING_STATUS.WAITING ? "start" : "center"};
  align-items: center;
  width: 100%;
  height: 35px;
  background-color: #1c1e2df5;
  color: white;
  font-family: Inter;
  font-size: 14px;
  text-align: center;
  pointer-events: none;
  & > div {
    position: absolute;
    top: 0;
    width: 100%;
    height: 5px;

    ${({ sending }: LoadingProps) =>
      sending === SENDING_STATUS.WAITING
        ? css`
            background: linear-gradient(
              to right,
              rgba(0, 0, 0, 0),
              #f5257a,
              #18d2ff,
              rgba(0, 0, 0, 0),
              #f5257a,
              #18d2ff,
              rgba(0, 0, 0, 0)
            );
            background-size: 200%;
            animation: background 1s linear infinite;
            transition: opacity 200ms ease-in-out;

            @keyframes background {
              0% {
                background-position-x: 0;
              }
              100% {
                background-position-x: 100%;
              }
            }
          `
        : css`
            background-color: ${({ sending }: LoadingProps) =>
              sending === SENDING_STATUS.SUCCESS
                ? FormantColors.green
                : FormantColors.red};
          `}
  }

  & > p {
    padding: 0 10px;
  }

  & > span {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: ${FormantColors.steel02};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    pointer-events: all;
  }
`;
