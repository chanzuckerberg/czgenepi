/**
 * Banner to notify user of any changes to policies.
 *
 * When we make changes to legal-type policies (eg, Privacy Policy, Terms of
 * Service, etc), we need to notify the user these changes have happened. Banner
 * points out the changes, and when closed, we track that the user has acknowledged
 * the current round of changes so we can stop showing them the banner.
 *
 * If the policies change again in the future, the banner can be brought back
 * for previously acknowledged users by changing date of CURRENT_POLICY_VERSION.
 */

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
  StyledNewTabLink,
} from "./style";

/**
 * Date of most recent change in legal and legal-adjacent policies (eg, Privacy Policy,
 * Terms of Service, etc). If any of those are changed, this should be updated.
 * Changing value will cause banner to start appearing for already existing users
 * until they acknowledge the latest changes by closing the banner.
 * Backend requires date format of YYYY-MM-DD, can't use arbitrary string!
 */
export const CURRENT_POLICY_VERSION = "2021-09-30"; // NOTE: YYYY-MM-DD is critical

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
        <StyledNewTabLink href={ROUTES.TERMS}>
          Terms of Use
        </StyledNewTabLink>{" "}
        and{" "}
        <StyledNewTabLink href={ROUTES.PRIVACY}>
          Privacy Policy
        </StyledNewTabLink>{" "}
        effective September 30.
      </MainText>
      <StyledCloseIcon onClick={handleClick} />
    </Container>
  );
};

export default AcknowledgePolicyChanges;
