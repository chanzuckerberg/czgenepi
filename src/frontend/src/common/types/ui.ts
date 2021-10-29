import { ButtonProps } from "czifui";
import { FC } from "react";

export interface ButtonInfo {
  content?: string | JSX.Element;
  type?: "primary" | "secondary";
  link?: string | "cancel";
  Button?: FC<ButtonProps>;
}

export interface ModalInfo {
  header?: string | JSX.Element;
  body?: string | JSX.Element;
  buttons: ButtonInfo[];
  width?: number;
  backgroundColor?: string;
}
