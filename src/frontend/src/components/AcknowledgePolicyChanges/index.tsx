import React from "react";
import { ROUTES } from "src/common/routes";
import {
  Container,
  StyledIconInfo,
  DummyCenteringSpacer,
  MainText,
  StyledCloseIcon,
  StyledLink,
} from "./style";
import { B } from "src/common/styles/support/style";

const AcknowledgePolicyChanges = () => {
  return (
    <Container>
      <DummyCenteringSpacer />
      <MainText>
        <StyledIconInfo />
        <B>
        We are no longer supporting automatic GISAID submissions. {" "}
        </B>
        This change is reflected in our updated{" "}
          <StyledLink
            href={ROUTES.TERMS}
            target="_blank"
            rel="noopener"
          >
            Terms of Service
          </StyledLink>
          {" "}and{" "}
          <StyledLink
            href={ROUTES.PRIVACY}
            target="_blank"
            rel="noopener"
          >
            Privacy Policy
          </StyledLink>
          {" "}effective September XX.
      </MainText>
      <StyledCloseIcon
        onClick={() => console.log('ALIVE')}
      />
    </Container>
  );
};

export default AcknowledgePolicyChanges;
