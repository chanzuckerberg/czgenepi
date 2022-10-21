import { Button } from "czifui";
import NextLink from "next/link";
import { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import Progress from "../common/Progress";
import {
  ButtonWrapper,
  Content,
  Header,
  Subtitle,
  Title,
} from "../common/style";
import { Props } from "../common/types";
import Table from "./components/Table";
import Upload from "./components/Upload";
import {
  CheckboxText,
  CheckboxWrapper,
  ContentTitle,
  ContentTitleWrapper,
  StyledButton,
  StyledCheckbox,
} from "./style";

export default function Review({
  samples,
  metadata,
  cancelPrompt,
  analyticsFlowUuid,
}: Props): JSX.Element {
  const { data: userInfo } = useUserInfo();
  const [isGroupConfirmationChecked, setIsGroupConfirmationChecked] =
    useState<boolean>(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const group = getCurrentGroupFromUserInfo(userInfo);

  const numOfSamples = Object.keys(samples || EMPTY_OBJECT).length;

  const toggleState = (prevState: boolean) => !prevState;

  const handleConsentCheck = () => {
    setIsConsentChecked(toggleState);
  };

  const handleGroupConfCheck = () => {
    setIsGroupConfirmationChecked(toggleState);
  };

  return (
    <>
      <HeadAppTitle subTitle="Upload Review" />
      <Header>
        <div>
          <Title>Review</Title>
          <Subtitle>
            Uploading {numOfSamples} {pluralize("Sample", numOfSamples)} to{" "}
            <B>{group?.name}</B>
          </Subtitle>
        </div>
        <Progress step="3" />
      </Header>
      <Content>
        <ContentTitleWrapper>
          <ContentTitle>Sample Info</ContentTitle>
          <NextLink href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <StyledButton sdsType="secondary" sdsStyle="minimal">
                Edit Samples
              </StyledButton>
            </a>
          </NextLink>
          <NextLink href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <StyledButton sdsType="secondary" sdsStyle="minimal">
                Edit Metadata
              </StyledButton>
            </a>
          </NextLink>
        </ContentTitleWrapper>

        <Table metadata={metadata} />

        <CheckboxWrapper>
          <CheckboxText onClick={handleGroupConfCheck}>
            <StyledCheckbox
              checked={isGroupConfirmationChecked}
              stage={isGroupConfirmationChecked ? "checked" : "unchecked"}
            />
            <span>
              I confirm that this data should be uploaded to {group?.name}, and
              acknowledge that by uploading to this group this data will be
              accessible to all group members.
            </span>
          </CheckboxText>
          <CheckboxText onClick={handleConsentCheck}>
            <StyledCheckbox
              checked={isConsentChecked}
              stage={isConsentChecked ? "checked" : "unchecked"}
            />
            <span>
              I agree that the data I am uploading to CZ GEN EPI has been
              lawfully collected and that I have all the necessary consents,
              permissions, and authorizations needed to collect, share and
              export data as outlined in the{" "}
              <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink> and{" "}
              <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink>. I
              have reviewed the data that I am uploading and can confirm that I
              am not uploading any personally identifiable information.
            </span>
          </CheckboxText>
        </CheckboxWrapper>

        <ButtonWrapper>
          <Upload
            samples={samples}
            metadata={metadata}
            isDisabled={!isGroupConfirmationChecked || !isConsentChecked}
            cancelPrompt={cancelPrompt}
            analyticsFlowUuid={analyticsFlowUuid}
          />
          <NextLink href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <Button sdsType="secondary" sdsStyle="rounded">
                Back
              </Button>
            </a>
          </NextLink>
        </ButtonWrapper>
      </Content>
    </>
  );
}
