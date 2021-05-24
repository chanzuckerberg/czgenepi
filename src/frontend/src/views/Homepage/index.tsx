import { Button } from "czifui";
import Head from "next/head";
import React from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";
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
  return (
    <>
      <Head>
        <title>Aspen</title>
      </Head>
      <Container>
        <CardContainer>
          <Card>
            <Content>
              <Left>
                <Title>Welcome to Aspen!</Title>
                <Main>
                  Aspen is a new tool that helps you manage, analyze, and share
                  your pathogen data for genomic epidemiology.
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
        <Footer>
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
