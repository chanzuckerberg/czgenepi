import styled from "@emotion/styled";
import { getColors, getCorners, Props as ThemeProps } from "czifui";

interface Props extends ThemeProps {
  isActive?: boolean;
}

const barMixin = (props: Props) => {
  const corners = getCorners(props);
  const colors = getColors(props);
  const { isActive } = props;

  return `
    height: 2px;
    border-radius: ${corners?.m}px;
    background-color: ${isActive ? colors?.primary[400] : colors?.gray[200]};
  `;
};

export const Left = styled.div`
  ${barMixin}

  position: absolute;
  width: 7.5px;
`;

export const Right = styled.div`
  ${barMixin}

  margin-left: 7.5px;
  position: relative;
  width: 50px;
`;
