import { Button } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API } from "src/common/api";
import { HeadAppTitle } from "src/common/components";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";
import { useUserInfo } from "../../common/queries/auth";
import { PAGE_TITLES } from "../../common/titles";
import {
  ButtonContainer,
  Card,
  CardContainer,
  Container,
  Content,
  Details,
  Footer,
  FooterButtonContainer,
  Left,
  Main,
  Right,
  Title,
  Virus,
} from "./style";

export default function Homepage(): JSX.Element {
  const { data: userInfo, isLoading } = useUserInfo();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const subTitle = PAGE_TITLES[router.asPath];

  /**
   * (thuang): `useEffect` only runs in the browser,
   * so we don't redirect on the server side
   */
  useEffect(() => {
    if (!userInfo) return;

    setIsRedirecting(true);

    router.push(ROUTES.DATA);
  });

  if (isLoading || isRedirecting) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HeadAppTitle subTitle={subTitle} />
      <Container>
        <CardContainer>
          <Card>
            <Content>
              <Left>
                <Title>
                  Welcome
                  <br />
                  to CZ GEN EPI!
                </Title>
                <Main>
                  CZ GEN EPI is a new tool that helps you manage, analyze, and
                  share your pathogen data for genomic epidemiology.
                </Main>
                <Details>
                  This is also where you’ll receive all of your sequencing
                  results from the COVIDTracker project at the CZ Biohub.
                </Details>
              </Left>

              <Right>
                <Virus />
              </Right>
            </Content>

            <ButtonContainer>
              <a href={ENV.API_URL + API.LOG_IN}>
                <Button isRounded color="primary" variant="contained">
                  Sign in
                </Button>
              </a>
            </ButtonContainer>
          </Card>
        </CardContainer>
        <Footer data-test-id="footer">
          <FooterButtonContainer>
            <a href={ROUTES.CONTACT_US_EMAIL} target="_blank" rel="noopener">
              Contact
            </a>
            <a href={ROUTES.TERMS} target="_blank" rel="noopener">
              Terms
            </a>
            <a href={ROUTES.PRIVACY} target="_blank" rel="noopener">
              Privacy
            </a>
          </FooterButtonContainer>
        </Footer>
      </Container>
    </>
  );
}
