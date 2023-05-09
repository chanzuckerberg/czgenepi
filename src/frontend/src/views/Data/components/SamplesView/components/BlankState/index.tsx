import { ROUTES } from "src/common/routes";
import FlaskImage from "src/common/images/flask.svg";
import {
  BodyText,
  Container,
  FlexColumn,
  Header,
  StyledButtonLink,
  StyledLink,
  StyledLinkIcon,
  StyledLinkText,
} from "./style";
import { useState } from "react";
import { CreateNSTreeModal } from "../SampleTableModalManager/components/CreateNSTreeModal";

export const BlankState = (): JSX.Element => {
  const [isTreeModalOpen, setIsTreeModalOpen] = useState<boolean>(false);

  return (
    <Container>
      <CreateNSTreeModal
        checkedSampleIds={[]}
        badOrFailedQCSampleIds={[]}
        open={isTreeModalOpen}
        onClose={() => setIsTreeModalOpen(false)}
      />
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
        <StyledButtonLink
          sdsStyle="minimal"
          onClick={() => setIsTreeModalOpen(true)}
        >
          <StyledLinkText>Create a tree</StyledLinkText>
          <StyledLinkIcon sdsIcon="chevronRight" sdsSize="s" sdsType="static" />
        </StyledButtonLink>
      </FlexColumn>
      <FlaskImage title="Flask" />
    </Container>
  );
};
