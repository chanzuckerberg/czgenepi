import styled from "@emotion/styled";
import NextstrainLogoImg from "src/common/images/nextstrain-inline.svg";
import {
  CommonThemeProps,
  fontBodyS,
  fontBodyXxxs,
  getColors,
  getSpaces,
} from "czifui";

export const ImageSizer = styled.div`
  display: flex;
  width: 42px;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xxxs}px;
    `;
  }}
`;

export const Attribution = styled.p`
  ${fontBodyS}

  display: flex;
  align-items: center;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[600]};
      margin: 0 0 ${spaces?.m}px;
    `;
  }}
`;

const gray500 = (props: CommonThemeProps) => {
  const colors = getColors(props);

  return `
    color: ${colors?.gray[500]};
  `;
};

export const Acknowledgements = styled.p`
  margin: 0;
  ${fontBodyXxxs}
  ${gray500}
`;

export const SpacedAcknowledgements = styled(Acknowledgements)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 0 ${spaces?.s}px;
    `;
  }}
`;

export const NextstrainLogo = styled(NextstrainLogoImg)`
  width: 90px;
`;
