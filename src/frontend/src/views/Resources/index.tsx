import Head from "next/head";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { ROUTES } from "src/common/routes";
import List from "src/common/styles/support/components/List";
import {
  B,
  H1,
  H2,
  H3,
  NarrowContainer,
  P,
  Title,
} from "src/common/styles/support/style";
import { StyledNewTabLink } from "./style";

export default function Resources(): JSX.Element {
  function Intro() {
    return (
      <Title>
        <H1>Gen Epi Resources</H1>
      </Title>
    );
  }

  function GenomicEpiSeries() {
    return (
      <>
        <H2>Genomic Epidemiology Seminar Series</H2>
        <P>
          <B>
            Seminars occur every second Thursday from 11am to 12pm Pacific time
            over Zoom.
          </B>
          If you would like to be added to the calendar invitation, please email
          Alli Black at{" "}
          <NewTabLink href="mailto:ablack@contractor.chanzuckerberg.com">
            ablack@contractor.chanzuckerberg.com.
          </NewTabLink>{" "}
          If you have any follow-up questions or would like to chat more about
          these topics, please feel free to contact Alli to set up a follow-up
          call!
        </P>
        <H3>Seminar Recordings</H3>
        <div>
          <List
            marginLeft={"m"}
            items={[
              <span key={0}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=Bt3JNKfU5qk">
                  Week 1
                </StyledNewTabLink>{" "}
                - Today we discussed the overlapping timescales of pathogen
                evolution and infectious disease transmission, and how to build
                phylogenetic trees that visualize genetic divergence.
              </span>,
              <span key={1}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=zAtgJjoy6-w">
                  Week 2
                </StyledNewTabLink>{" "}
                - During this seminar we discussed measuring divergence over
                time in order to estimate the average rate of evolution of a
                pathogen. We also discussed how to use that rate to make
                phylogenetic trees with branch lengths in units of calendar
                time.
              </span>,
              <span key={2}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=jYpjzP22HcM">
                  Week 3
                </StyledNewTabLink>{" "}
                - This week we discussed phylogeography, the technique in
                genomic epidemiology of inferring spatial migration patterns of
                a pathogen across the tree. We discussed the inferential
                procedure that allows this, as well as caveats and things to be
                cautious about.
              </span>,
              <span key={3}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=qllORYfM_z8">
                  Week 4
                </StyledNewTabLink>{" "}
                - In this seminar we discuss Nextstrain, especially how
                pipelines are specified in Nextstrain Augur, and different ways
                to navigate the genomic data visualization in Nextstrain
                Auspice.
              </span>,
              <span key={4}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=eeYgWdRbPPo">
                  Week 5
                </StyledNewTabLink>{" "}
                - This week we discussed consensus genome quality control,
                including different quality metrics, the impact of different
                quality issues on downstream analyses, and how to look at BAM
                files to assess support for different sites in the consensus
                genome.
              </span>,
              <span key={5}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=GJMTNwDKibI">
                  Week 6
                </StyledNewTabLink>{" "}
                - This week we talked all about data types and data
                organization. We discussed how using data models helps to
                organize genomic surveillance metadata and specifically
                mentioned the PHA4GE data specification for SARS-CoV-2. And then
                Dan Lu walked us through different genomic data structures, what
                those different structures are useful for, and which
                repositories each can be submitted to. She finished the talk off
                with a discussion of handling GISAID rejections and looking at
                calls in BAM files.
              </span>,
              <span key={6}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=HVorizRS4wk">
                  Week 7
                </StyledNewTabLink>{" "}
                - In today&apos;s seminar we talked about phylogenetic
                nomenclature systems (why we use them and types of systems). We
                finished off with a more detailed discussion of the Pango
                nomenclature system for SARS-CoV-2.
              </span>,
              <span key={7}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=ycM50nC5wXk">
                  Week 8
                </StyledNewTabLink>{" "}
                - This week we tackled the tricky subject of sampling design.
                While we don&apos;t (yet) have formal frameworks for estimating
                sample size in genomic epidemiology, today we discussed study
                design, and specifically how to think about sample selection for
                different types of genomic epidemiological questions/studies.
              </span>,
              <span key={8}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=a8bp0iHCttA">
                  Week 9
                </StyledNewTabLink>{" "}
                - In this week&apos;s seminar I introduced
                &quot;phylodynamic&quot; analysis - a particular area of genomic
                epidemiology where we infer changes in pathogen population size
                from the shapes of coalescent phylogenetic trees.
              </span>,
              <span key={9}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=cLLV2VpgXCU">
                  Week 10
                </StyledNewTabLink>{" "}
                - This week I gave a demo of Aspen, the new piece of software
                that CZI is developing for managing genomic data, that
                eventually will allows folks to build Nextstrain trees
                independently with a GUI interface. Since that capability
                isn&apos;t active quite yet, I also discussed phylogenetic
                placements in UShER and Nextclade, and how to pull relevant data
                out of Aspen to use in those phylogenetic placements. [Since the
                recording of this video, Aspen has added this capability.]
              </span>,
              <span key={10}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=lFJ_2G4u8w4">
                  Week 11
                </StyledNewTabLink>{" "}
                - This week Dr. Sidney Bell joined us to discuss antigenic
                evolution of viruses - that is, how viral surface proteins can
                change how they &quot;look&quot; to our immune systems, and in
                some cases eventually escape our immunity.
              </span>,
              <span key={10}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=7nyq5Mc_pOo">
                  Week 12
                </StyledNewTabLink>{" "}
                - This week I compared and contrasted phylogenetic placements
                versus phylogenetic trees, and described the different
                situations when I prefer one over the other.
              </span>,
              <span key={11}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=0ms0FYmpfDc">
                  Week 13
                </StyledNewTabLink>{" "}
                - This week we branched out from SARS-CoV-2, and I gave some
                examples of how you can use genomic epidemiology to investigate
                the epidemiology of TB.
              </span>,
              <span key={12}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=pk-ap-1Uicc">
                  Week 14
                </StyledNewTabLink>{" "}
                - This week the focus was on practical applications of genomic
                epidemiology, and I walked through some case studies showing
                different ways in which genomic epidemiology has supported epi
                investigations in California.
              </span>,
              <span key={13}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=4uE2lEpGo2k">
                  Week 15
                </StyledNewTabLink>{" "}
                - This week was another short break from SARS-CoV-2, and we
                turned our attention towards genomic epidemiology of a different
                viral pathogen - Mumps virus.
              </span>,
              <span key={14}>
                <StyledNewTabLink href="https://www.youtube.com/watch?v=RbK6Bv4-fnc">
                  Aspen Tutorial!
                </StyledNewTabLink>{" "}
                - This tutorial introduces self-serve tree building in Aspen,
                and discusses what the different tree types are useful for.
              </span>,
            ]}
          />
        </div>
      </>
    );
  }

  function Questions() {
    return (
      <>
        <H3>Questions?</H3>
        <P>
          <NewTabLink href={ROUTES.FAQ}>Check out our FAQ</NewTabLink> for
          general questions about Aspen, privacy, and more.
        </P>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Aspen | Resources</title>
      </Head>
      <NarrowContainer>
        <Intro />
        <GenomicEpiSeries />
        <Questions />
        <div style={{ height: "50px" }} />
      </NarrowContainer>
    </>
  );
}
