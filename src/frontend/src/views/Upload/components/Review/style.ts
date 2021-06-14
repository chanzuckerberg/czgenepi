import styled from "@emotion/styled";
import { fontBodyXs, fontHeaderL } from "czifui";
import { marginBottom } from "../common/style";

export const ContentTitle = styled.span`
  ${fontHeaderL}
`;

export const ContentTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const CheckboxText = styled.div`
  ${fontBodyXs}

  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

export const CheckboxWrapper = styled.div`
  ${marginBottom}
`;
