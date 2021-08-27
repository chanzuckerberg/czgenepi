import { Dialog } from "@material-ui/core";
import { Button, Link, List, ListItem, ListSubheader } from "czifui";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API } from "src/common/api";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import ENV from "src/common/constants/ENV";
import { useUpdateUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { PageContent } from "../../common/styles/mixins/global";
import { Details, Title } from "./style";

export default function AgreeTerms(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const router = useRouter();
  const {
    mutate: updateUserInfo,
    isSuccess,
    isLoading: isUpdatingUserInfo,
  } = useUpdateUserInfo();

  useEffect(() => {
    if (shouldRedirect) {
      router.push(ROUTES.DATA);
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (!hasAcceptedTerms || isUpdatingUserInfo) return;
    if (isSuccess) {
      return setShouldRedirect(true);
    }

    agreeTos();

    async function agreeTos() {
      setIsLoading(true);
      updateUserInfo({ agreed_to_tos: true });
    }
  }, [hasAcceptedTerms, isUpdatingUserInfo, isSuccess, updateUserInfo]);

  function handleAcceptClick() {
    setHasAcceptedTerms(true);
  }

  return (
    <>
      <Head>
        <title>Aspen | Agree Terms of Service</title>
      </Head>
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
                You always own and control the data you upload.
              </ListItem>
              <ListItem fontSize="s">
                Only other members of your group can see your data. CDPH can see
                samples, but not your private, internal identifiers.
              </ListItem>
              <ListItem fontSize="s">
                New sequences will be automatically submitted to GISAID two
                weeks after upload.
              </ListItem>
              <ListItem fontSize="s">
                You can mark a sample as “private” anytime during the first two
                weeks after upload. “Private” samples are not shared with CDPH
                or GISAID, but are visible to your group.{" "}
              </ListItem>
              <ListItem fontSize="s">
                Aspen does not support protected health information.
              </ListItem>
              <ListItem fontSize="s">
                We utilize industry standard best practices in information
                security, such as encrypting your data at rest and in transit,
                to ensure the security of your data.
              </ListItem>
              <Details>
                Take a look at our full{" "}
                <Link href={ROUTES.TERMS} target="_blank" rel="noopener">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href={ROUTES.PRIVACY} target="_blank" rel="noopener">
                  Privacy Policy
                </Link>
                . We’ve put together an{" "}
                <Link href={ROUTES.FAQ} target="_blank" rel="noopener">
                  FAQ
                </Link>{" "}
                to make these easier to understand. Please{" "}
                <Link
                  href={ROUTES.CONTACT_US_EMAIL}
                  target="_blank"
                  rel="noopener"
                >
                  get in touch
                </Link>{" "}
                if you have any questions or concerns, we’re here to help.
              </Details>
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={isLoading}
              color="primary"
              variant="contained"
              isRounded
              autoFocus
              onClick={handleAcceptClick}
            >
              Accept
            </Button>
            <a href={ENV.API_URL + API.LOG_OUT}>
              <Button
                disabled={isLoading}
                color="primary"
                variant="outlined"
                isRounded
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
