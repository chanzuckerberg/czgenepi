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
import {StyledSpan} from "./style"
// import { H2, H1, H3, P, Title, B, fontHeaderL, getColors } from "czifui";


export default function Resources(): JSX.Element {

  const renderIntro = () => (
    <Title>
      <H1>Gen Epi Resources</H1>
    </Title>
  );

  const renderGenomicEpiSeries = () => {
    return (
      <>
      <H2>Genomic Epidemiology Seminar Series</H2>
      <P>
      <B>Seminars occur every second Thursday from 11am to 12pm PST over Zoom.</B> If you would like to be added to the calendar invitation, please email Alli Black at ablack@contractor.chanzuckerberg.com. If you have any follow-up questions or would like to chat more about these topics, please feel free to contact Alli to set up a follow-up call!
      </P>
      <H3>Seminar Recordings</H3>
      <div>
        <List
          listItemsShiftedLeft={"m"}
          items={[
          <span key={0}>
            Week 1 - Today we discussed the overlapping timescales of pathogen evolution and infectious disease transmission, and how to build phylogenetic trees that visualize genetic divergence.
          </span>,
          <span key={1}>
            Week 2 - During this seminar we discussed measuring divergence over time in order to estimate the average rate of evolution of a pathogen. We also discussed how to use that rate to make phylogenetic trees with branch lengths in units of calendar time.
          </span>,
          <span key={2}>
          Week 3 - This week we discussed phylogeography, the technique in genomic epidemiology of inferring spatial migration patterns of a pathogen across the tree. We discussed the inferential procedure that allows this, as well caveats and things to be cautious about.
          </span>,
          <span key={3}>
           Week 4 - In this seminar we discuss Nextstrain, especially how pipelines are specified in Nextstrain Augur, and different ways to navigate the genomic data visualization in Nextstrain Auspice.
          </span>,
          <span key={4}>
            Week 5 - This week we discussed consensus genome quality control, including different quality metrics, the impact of different quality issues on downstream analyses, and how to look at BAM files to assess support for different sites in the consensus genome.
          </span>,
          <span key={5}>
          Week 6 - This week we talked all about data types and data organization. We discussed how using data models helps to organize genomic surveillance metadata and specifically mentioned the PHA4GE data specification for SARS-CoV-2. And then Dan Lu walked us through different genomic data structures, what those different structures are useful for, and which repositories each can be submitted to. She finished the talk off with a discussion of handling GISAID rejections and looking at calls in BAM files.
        </span>,     
          <span key={6}>
          Week 7 - In today's seminar we talked about phylogenetic nomenclature systems (why we use them and types of systems). We finished off with a more detailed discussion of how the Pango nomenclature system for SARS-CoV-2.
        </span>,  
          <span key={7}>
          Week 8 - This week we tackled the tricky subject of sampling design. While we don't (yet) have formal frameworks for estimating sample size in genomic epidemiology, today we discussed study design, and specifically how to think about sample selection for different types of genomic epidemiological questions/studies.
        </span>,   
          <span key={8}>
           Week 9 - In this week's seminar I introduced "phylodynamic" analysis - a particular area of genomic epidemiology where we infer changes in pathogen population size from the shapes of coalescent phylogenetic trees.
        </span>,   
          <span key={9}>
          Week 10 - This week I gave a demo of Aspen, the new piece of software that CZI is developing for managing genomic data, that eventually will allow folks to build Nextstrain trees independently with a GUI interface. Since that capability isn't active quite yet, I also discussed phylogenetic placements in UShER and Nextclade, and how to pull relevant data out of Aspen to use in those phylogenetic placements.
       </span>,      
          <span key={10}>
          Week 11 - This week Dr. Sidney Bell joined us to discuss antigenic evolution of viruses - that is, how viral surface proteins can change how they "look" to our immune systems, and in some cases eventually escape our immunity.
      </span>,                               
        ]}
        />
        </div>
      </>
    );
  };

  const renderQuestions= () => {
    return (
      <>
      <H3>Genomic Epidemiology Seminar Series</H3>
      <P>
      Check out our FAQ for general questions about Aspen, privacy, and more.
      </P>
      </>
    );
  };
  

  return (
    <>
      <Head>
        <title>Aspen | Resources</title>
      </Head>
      <NarrowContainer>
        {renderIntro()}
        {renderGenomicEpiSeries()}
        {renderQuestions()}
        <div style={{ height: "50px" }} />
      </NarrowContainer>
    </>
  );
}
