import { Dialog } from "@mui/material";
import { Button, List, ListItem, ListSubheader } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API } from "src/common/api";
import { HeadAppTitle } from "src/common/components";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import ENV from "src/common/constants/ENV";
import { useUpdateUserInfo, useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { CURRENT_POLICY_VERSION } from "src/components/AcknowledgePolicyChanges";
import { PageContent } from "../../common/styles/mixins/global";
import { Details, SpacedBold, Title } from "./style";

export default function AgreeTerms(): JSX.Element | null {
  // `isTosViewable` -- Should user see ToS page?
  // Prevents flashing page at users who should be redirected instead of seeing it.
  const [isTosViewable, setIsTosViewable] = useState(false);

  const router = useRouter();

  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo();
  const {
    mutate: updateUserInfo,
    // NOTE: We only update user info in case of acceptance, and we rely on this
    // `isSuccess` to only kick off after accepting ToS. If we eventually need
    // declining ToS to update the user info, this component will need refactoring.
    isSuccess: isSuccessUpdatingUserInfo,
    isLoading: isUpdatingUserInfo,
  } = useUpdateUserInfo();

  // Only show the page to logged in users who have not already agreed to ToS.
  // If they're not in that specific overlap, we'll redirect them elsewhere.
  useEffect(() => {
    // Once we show, we no longer consider redirecting.
    // But before we show, we need to wait for userInfo to load.
    if (!isTosViewable && !isLoadingUserInfo) {
      const agreedToTOS = userInfo?.agreedToTos;
      if (!userInfo) {
        // Lack of userInfo implicitly means user is not logged in.
        router.push(ROUTES.HOMEPAGE);
      } else if (agreedToTOS) {
        router.push(ROUTES.DATA);
      } else {
        // User is logged in, but not agreed to ToS. Show the ToS page.
        setIsTosViewable(true);
      }
    }
  }, [isTosViewable, isLoadingUserInfo, userInfo, router]);

  useEffect(() => {
    if (isSuccessUpdatingUserInfo) {
      // Backend successfully wrote the ToS acceptance
      router.push(ROUTES.DATA);
    }
  }, [isSuccessUpdatingUserInfo, router]);

  function handleAcceptClick() {
    updateUserInfo({
      // Agreeing to ToS also means implicit acknowledgment of current policies
      acknowledged_policy_version: CURRENT_POLICY_VERSION,
      agreed_to_tos: true,
    });
  }

  // Don't want to display ToS instantly on visiting page.
  // Wait until established if they should be shown it (or get redirected instead)
  if (!isTosViewable) {
    return null;
  }
  // Okay, user needs to agree to ToS before they can use the app. Show them page.
  return (
    <>
      <HeadAppTitle subTitle="Agree Terms of Service" />
      <PageContent>
        <Dialog open>
          <DialogTitle>
            <Title>
              First, a note about how we protect and handle your data.
            </Title>
          </DialogTitle>
          <DialogContent>
            <List>
              <ListSubheader disableSticky>
                We take data privacy and security very seriously. Here are a few
                key things to know:
              </ListSubheader>
              <ListItem fontSize="s">
                You <SpacedBold>always</SpacedBold> own and control the data you
                upload.
              </ListItem>
              <ListItem fontSize="s">
                Only other members of your group can see your data. Other
                organizations that you share your data with can see your
                samples, but not your private, internal identifiers.
              </ListItem>
              <ListItem fontSize="s">
                You can mark a sample as &quot;private&quot; anytime.
                &quot;Private&quot; samples are not shared with other
                organizations, but are visible to your group.
              </ListItem>
              <ListItem fontSize="s">
                CZ GEN EPI does not contain any personally identifiable
                information or protected health information.
              </ListItem>
              <ListItem fontSize="s">
                We utilize industry standard best practices in information
                security, such as encrypting your data at rest and in transit,
                to ensure the security of your data.
              </ListItem>
              <Details>
                Take a look at our full{" "}
                <NewTabLink href={ROUTES.TERMS}>Terms of Service</NewTabLink>{" "}
                and{" "}
                <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink>.
                We’ve put together a{" "}
                <NewTabLink href={ROUTES.PRIVACY_DATA_SHARING_FAQ}>
                  Privacy &amp; Data Sharing FAQ
                </NewTabLink>{" "}
                to make these easier to understand. Please{" "}
                <NewTabLink href={ROUTES.CONTACT_US_EMAIL}>
                  get in touch
                </NewTabLink>{" "}
                if you have any questions or concerns, we’re here to help!
                <br />
                <br />
                By clicking “Accept” below, you indicate that you agree to these
                terms and policies. <br />
              </Details>
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={isUpdatingUserInfo}
              sdsType="primary"
              sdsStyle="rounded"
              autoFocus
              onClick={handleAcceptClick}
            >
              Accept
            </Button>
            <a href={ENV.API_URL + API.LOG_OUT}>
              <Button
                disabled={isUpdatingUserInfo}
                sdsType="secondary"
                sdsStyle="rounded"
              >
                Decline
              </Button>
            </a>
          </DialogActions>
        </Dialog>
      </PageContent>
    </>
  );
}
