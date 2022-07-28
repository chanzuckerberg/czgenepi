import styled from "@emotion/styled";
import { CommonThemeProps, fontHeaderXxs, getColors } from "czifui";
import { iconFillWhite } from "src/common/styles/iconStyle";
import { Circle } from "src/components/Circle";
import { Status } from "../common";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50px;
`;

export const Text = styled.span`
  ${fontHeaderXxs}

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[600]};
    `;
  }}
`;

interface CircleProps extends CommonThemeProps {
  status: Status;
}

export const StyledCircle = styled(Circle)`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  ${(props: CircleProps) => {
    const colors = getColors(props);

    const { status } = props;

    return `
      color: ${status === "default" ? colors?.gray[600] : "white"};
      background-color: ${
        status === "default" ? colors?.gray[200] : colors?.primary[400]
      };
    `;
  }}
`;

export const StyledIconWrapperWhite = styled.div`
  ${iconFillWhite}
  display: flex;
`;
