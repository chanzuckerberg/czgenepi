import React from "react";
import {
  UserResponse,
  useUpdateUserInfo,
  useUserInfo,
} from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/support/style";
import {
  Container,
  DummyCenteringSpacer,
  MainText,
  StyledCloseIcon,
  StyledIconInfo,
  StyledLink,
} from "./style";

// VOODOO DOCME
const CURRENT_POLICY_VERSION = "2021-09-28";

/**
 * Determine if the user needs to acknowledge the current version of policies.
 *
 * User needs to if [from Slack discussion with Product re: story 163454]
 *   - User is logged in. Anonymous users can't use app, so no need to force acknowledgment.
 *   - && There have been policy changes since last acknowledgment
 *   - && They have previously agreed to Terms of Service
 *       ^^ Without this, we spam them with two, simultaneous requests for acknowledgment
 */
const determineIfAcknowledgmentNeeded = (
  data: UserResponse | undefined
): boolean => {
  // Don't display the banner until we've heard from backend about login status
  if (!data) {
    return false;
  }
  const { agreedToTos, acknowledgedPolicyVersion } = data.user;
  if (acknowledgedPolicyVersion === CURRENT_POLICY_VERSION || !agreedToTos) {
    return false;
  }
  return true;
};

const AcknowledgePolicyChanges = () => {
  const { data } = useUserInfo();
  const isAcknowledgmentNeeded = determineIfAcknowledgmentNeeded(data);

  const { mutate: updateUserInfo, isLoading: isUpdatingUserInfo } =
    useUpdateUserInfo();

  const handleClick = () => {
    updateUserInfo({ acknowledged_policy_version: CURRENT_POLICY_VERSION });
  };

  if (!isAcknowledgmentNeeded || isUpdatingUserInfo) {
    // If banner not needed or they just acknowledged, avoid mounting anything.
    return null;
  }
  // Okay, yeah, user needs to acknowledge. Show them the banner.
  return (
    <Container>
      <DummyCenteringSpacer />
      <MainText>
        <StyledIconInfo />
        <B>We are no longer supporting automatic GISAID submissions. </B>
        This change is reflected in our updated{" "}
        <StyledLink href={ROUTES.TERMS} target="_blank" rel="noopener">
          Terms of Service
        </StyledLink>{" "}
        and{" "}
        <StyledLink href={ROUTES.PRIVACY} target="_blank" rel="noopener">
          Privacy Policy
        </StyledLink>{" "}
        effective September XX.
      </MainText>
      <StyledCloseIcon onClick={handleClick} />
    </Container>
  );
};

export default AcknowledgePolicyChanges;
