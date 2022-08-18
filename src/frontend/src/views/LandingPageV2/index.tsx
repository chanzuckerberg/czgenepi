import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ROUTES } from "src/common/routes";
import { useUserInfo } from "../../common/queries/auth";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import IntroSection from "./components/IntroSection";
import PartnersSection from "./components/PartnersSection";
import QuoteSlider from "./components/QuoteSlider";
import UseCases from "./components/UseCases";
import { Container, LoadingText } from "./style";

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
    return <LoadingText>Loading...</LoadingText>;
  }

  return (
    <>
      <Head>
        <title>CZ GEN EPI</title>
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
