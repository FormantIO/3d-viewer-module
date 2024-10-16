import React from "react";
import { ModalContainer } from "./style";

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
        <button 
        //variant="contained" 
        onClick={() => handler1 && handler1()}>
          {buttons[0]}
        </button>

        <button onClick={() => handler2 && handler2()}>{buttons[1]}</button>
      </div>
    </ModalContainer>
  );
};
