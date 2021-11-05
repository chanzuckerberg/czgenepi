import { Button } from "czifui";
import Footer from "./components/Footer";
import Head from "next/head";
import Hero from "./components/Hero";
import IntroSection from "./components/IntroSection";
import PartnersSection from "./components/PartnersSection";
import QuoteSlider from "./components/QuoteSlider";
import UseCases from "./components/UseCases";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";
import { useUserInfo } from "../../common/queries/auth";
import {
  Container,
  FooterButtonContainer
} from "./style";

export default function Homepage(): JSX.Element {
  const { data: userInfo, isLoading } = useUserInfo();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

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
      <Head>
        <title>Aspen Landing Page V2</title>
      </Head>
      <Container>
        <Hero />
        <IntroSection />
        <UseCases />
        <QuoteSlider />
        <PartnersSection />
        <Footer />
      </Container>
    </>
  );
}
