import { ROUTES } from "src/common/routes";
import TreeImage from "src/common/images/tree.svg";
import {
  BodyText,
  Container,
  FlexColumn,
  Header,
  StyledLink,
  StyledLinkIcon,
  StyledLinkText,
  StyledNewTabLink,
} from "./style";

export const BlankStateTrees = (): JSX.Element => {
  return (
    <Container>
      <FlexColumn>
        <Header>Phylogenetic Trees</Header>
        <BodyText>
          You can create Phylogenetic Trees for this pathogen from the Samples
          tab. Visit our help center to learn more.
        </BodyText>
        <StyledLink href={ROUTES.DATA_SAMPLES}>
          <StyledLinkText>Go to samples</StyledLinkText>
          <StyledLinkIcon sdsIcon="chevronRight" sdsSize="s" sdsType="static" />
        </StyledLink>
        <StyledNewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees">
          <StyledLinkText>Learn how to create trees</StyledLinkText>
          <StyledLinkIcon sdsIcon="chevronRight" sdsSize="s" sdsType="static" />
        </StyledNewTabLink>
      </FlexColumn>
      <TreeImage title="Flask" />
    </Container>
  );
};
