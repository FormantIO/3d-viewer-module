import React from "react";
import { Button as MButton } from "@mui/material";
import styled, { css } from "styled-components";
import { FormantColors } from "../layers/utils/FormantColors";

interface Props {
  label?: string;
  theme?: "silver" | "blue";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Button: React.FC<Props> = ({
  label,
  theme = "silver",
  disabled = false,
  className,
  onClick,
}) => {
  return (
    <ButtonContainer theme={theme} disabled={disabled} className={className}>
      <MButton variant="contained" onClick={onClick} disabled={disabled}>
        {label}
      </MButton>
    </ButtonContainer>
  );
};

interface CProps {
  theme?: string;
  disabled?: boolean;
}
const ButtonContainer = styled.div`
  pointer-events: all;

  & > button {
    width: 100%;
    background-color: ${({ theme }: CProps) =>
      theme === "silver" ? `#bac4e2` : "#18d2ff"};

    &:hover {
      background-color: ${({ theme }: CProps) =>
        theme === "silver" ? `#d9e0f0` : "#53d7f8"};
    }

    border-radius: 20px;
    color: black;
    white-space: nowrap;

    ${({ disabled }: CProps) =>
      disabled &&
      css`
        cursor: not-allowed;
        color: #8c909b !important;
        background-color: ${FormantColors.steel02} !important;
        &:hover {
          background-color: ${FormantColors.steel02} !important;
        }
      `}
  }
`;
