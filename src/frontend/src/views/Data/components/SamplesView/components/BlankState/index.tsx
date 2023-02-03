import { ROUTES } from "src/common/routes";
import FlaskImage from "src/common/images/flask.svg";
import {
  BodyText,
  Container,
  FlexColumn,
  Header,
  StyledLink,
  StyledLinkIcon,
  StyledLinkText,
} from "./style";

export const BlankState = (): JSX.Element => {
  return (
    <Container>
      <FlexColumn>
        <Header>Samples</Header>
        <BodyText>
          You can find samples for this workspace here after you upload data for
          this pathogen.
        </BodyText>
        <StyledLink href={ROUTES.UPLOAD}>
          <StyledLinkText>Upload your samples</StyledLinkText>
          <StyledLinkIcon sdsIcon="chevronRight" sdsSize="s" sdsType="static" />
        </StyledLink>
      </FlexColumn>
      <FlaskImage title="Flask" />
    </Container>
  );
};
