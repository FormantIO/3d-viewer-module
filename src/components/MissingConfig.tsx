import { Typography } from "@formant/ui-sdk";
import { definedAndNotNull } from "@formant/universe-core";
import * as React from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { ConfigArrow, Warning } from "./icons";

const Wrapper = styled.div`
  background-color: #2d3855;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 0 10%;
  margin: auto;
  overflow-y: hidden;

  & > svg {
    margin-bottom: 18px;
  }

  & > h5 {
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.1px;
    margin-bottom: 4px;
    line-height: 18px;
    font-family: "Inter";
  }

  & > p {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.6px;
    color: #bac4e2;
    line-height: 20px;
    font-family: "Inter";
  }
`;

const ArrowWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 16px;
  right: 20.5px;
`;

export const MissingConfig = () => {
  return (
    <Wrapper>
      <Warning />
      <Typography variant="h5">MODULE CONFIGURATION</Typography>
      <Typography variant="body1">
        “This module has yet to be configured. Select ‘configure‘ from the meatball
        menu in the upper right corner”
      </Typography>
      <ArrowWrapper>
        <ConfigArrow />
      </ArrowWrapper>
    </Wrapper >
  );
}
