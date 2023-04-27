import React from "react";
import { ModalContainer } from "./style";
import { Button } from "@mui/material";

interface Props {
  content: string[];
  subContent?: string;
  buttons: string[];
  handler1?: () => void;
  handler2?: () => void;
}

export const Modal: React.FC<Props> = ({
  content,
  subContent,
  buttons,
  handler1,
  handler2,
}) => {
  return (
    <ModalContainer>
      <div>
        {content[0]} <b>{content[1]}</b> ?
      </div>
      {subContent && <p>{subContent}</p>}
      <div>
        <Button variant="contained" onClick={() => handler1 && handler1()}>
          {buttons[0]}
        </Button>

        <Button onClick={() => handler2 && handler2()}>{buttons[1]}</Button>
      </div>
    </ModalContainer>
  );
};
