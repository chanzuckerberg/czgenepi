import { List, ListItem } from "czifui";
import Head from "next/head";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { ROUTES } from "src/common/routes";
import {
  B,
  H1,
  H2,
  H3,
  NarrowContainer,
  P,
  Title,
} from "src/common/styles/support/style";

export default function Faq(): JSX.Element {
  const renderIntro = () => (
    <Title>
      <H1>Aspen FAQs</H1>
    </Title>
  );

  const renderHowToUseAspen = () => {
    return (
      <>
        <H2 id="how-to-use-aspen">How to use Aspen</H2>

        <H3>How do I login?</H3>
        <P>
          Navigate to{" "}
          <NewTabLink href={ROUTES.HOMEPAGE}>aspen.cziscience.com</NewTabLink>{" "}
          and click on the “Sign In” button in the center of the page. You
          should be redirected to a login screen where you can enter your email
          address and password.{" "}
          <B>
            Note: you can login to Aspen using the same credentials that you
            used to login to the COVID Tracker app.
          </B>{" "}
          If you forget your password, click the “Forgot password?” link on the
          login screen. You will receive an email with instructions for
          resetting your password.
        </P>

        <H3>How do I upload samples?</H3>
        <P>
          Until we conclude SARS-CoV-2 genomic sequencing-as-a-service in June
          2021, we will continue to upload any consensus genomes created at the
          Biohub directly to Aspen.
        </P>
        <P>
          If you are generating your own SARS-CoV-2 consensus genomes, please
          continue to upload these to GISAID. We will pull new genomes uploaded
          to GISAID once per day. After we pull from GISAID, you should see your
          genomes in Aspen within 1 day.
        </P>
        <P>
          In June, we will be adding the ability for you to upload consensus
          genomes directly to Aspen, making the entire process of getting your
          data into Aspen smoother and faster. Stay tuned for this update!
        </P>

        <H3>How do I generate trees?</H3>
        <P>
          Every night, Aspen will generate a new Nextstrain build with all of
          your samples. You can find these new phylogenetic trees by clicking on
          the “Phylogenetic Trees” tab. The trees are sorted by “Upload Date” so
          your newest builds will be at the top of the list. For now, these
          builds will automatically include all of the samples your DPH has
          uploaded to Aspen. In the very near future, you will have the ability
          to kick off your own tree builds, allowing you to select only the set
          of samples you are interested in.
        </P>

        <H3>How do I securely overlay my PHI / PII metadata?</H3>
        <P>
          For each tree in the “Phylogenetic Trees” tab of Aspen, you can
          download a TSV template that can be used to collect any other metadata
          that you would like to visualize alongside your genomic data.
        </P>
        <P>
          Once completed, you can drag and drop this TSV file onto your tree
          visualizations in Nextstrain. Your private metadata spreadsheet will
          never leave your computer;{" "}
          <NewTabLink href="https://docs.nextstrain.org/projects/auspice/en/stable/advanced-functionality/drag-drop-csv-tsv.html">
            see here for more details.
          </NewTabLink>
        </P>
        <P>
          We’re also hard at work thinking of new ways to enable you to securely
          overlay PHI / PII directly in Aspen. If you have ideas or requests,
          please let us know at{" "}
          <NewTabLink href="mailto:helloaspen@chanzuckerberg.com">
            helloaspen@chanzuckerberg.com
          </NewTabLink>
          !
        </P>

        <H3>How can I get support or make a feature request?</H3>
        <P>
          Our team is here to support you! Please reach out to us anytime at{" "}
          <NewTabLink href="mailto:helloaspen@chanzuckerberg.com">
            helloaspen@chanzuckerberg.com
          </NewTabLink>
          . We regularly monitor that inbox for support requests, bug reports,
          and feature requests. Aspen is still in its early stages, and we work
          closely with our users to improve the experience -- we read and
          discuss every bit of feedback. We want to make sure that we are
          building a tool that satisfies the most pressing needs of the public
          health communities.{" "}
        </P>

        <H3>How can I delete my data?</H3>
        <P>
          Please reach out to our team at{" "}
          <NewTabLink href="mailto:helloaspen@chanzuckerberg.com">
            helloaspen@chanzuckerberg.com
          </NewTabLink>{" "}
          with your deletion requests and we will handle it within 60 days. When
          we delete your data, we remove it from our database and any file
          storage we have. In a future version of Aspen, you will have the
          ability to delete your own data from within the app.
        </P>
      </>
    );
  };

  const renderCOVIDTrackerProgram = () => (
    <>
      <H2 id="covid-tracker-program">COVID Tracker Program</H2>

      <H3>Where can I find links to the COVID Tracker Seminar Series?</H3>
      <P>
        You can find links to recordings of all previous seminars at{" "}
        <NewTabLink href="https://covidtracker.czbiohub.org/resources">
          https://covidtracker.czbiohub.org/resources
        </NewTabLink>
        . If you would like to be added to the calendar invitation for any
        future seminars please email{" "}
        <NewTabLink href="mailto:ablack@contractor.chanzuckerberg.com">
          Alli Black
        </NewTabLink>
        .
      </P>

      <H3>
        Where can I find aggregate statistics on genomes sequenced by the
        Biohub?
      </H3>
      <P>
        Aggregate statistics on genomes sequenced by the Biohub can be found at{" "}
        <NewTabLink href="https://covidtracker.czbiohub.org/statistics">
          https://covidtracker.czbiohub.org/statistics
        </NewTabLink>
        . This page is available to the public.
      </P>
    </>
  );

  const renderPrivacyAndDataSharing = () => (
    <>
      <H2 id="privacy-data-sharing">Privacy and data sharing</H2>

      <H3>Where can I view the Privacy Policy & ToS?</H3>
      <P>
        You can find our Privacy Policy at:{" "}
        <NewTabLink href="https://aspen.cziscience.com/privacy">
          https://aspen.cziscience.com/privacy
        </NewTabLink>
      </P>
      <P>
        You can find our Terms of Service at:{" "}
        <NewTabLink href="https://aspen.cziscience.com/terms">
          https://aspen.cziscience.com/terms
        </NewTabLink>
      </P>

      <P>A summary of key things to know: </P>
      <List>
        <ListItem>
          <span key={0}>
            You <B>always</B> own and control the data you upload.
          </span>
        </ListItem>
        <ListItem>
          Only other members of your group can see your data. CDPH can see
          samples, but not your private, internal identifiers.
        </ListItem>
        <ListItem>
          New sequences will be automatically submitted to GISAID two weeks
          after upload, unless marked &quot;private.&quot;
        </ListItem>
        <ListItem>
          <span key={1}>
            You can mark a sample as &quot;private&quot; anytime during the
            first two weeks after upload. &quot;Private&quot; samples are not
            shared with CDPH or GISAID, but are visible to your group. (For now,
            please send us a quick{" "}
            <NewTabLink href="mailto:helloaspen@chanzuckerberg.com">
              email
            </NewTabLink>{" "}
            to mark samples as &quot;private.&quot;)
          </span>
        </ListItem>
        <ListItem>
          Aspen does not support protected health information.
        </ListItem>
        <ListItem>
          We utilize industry standard best practices in information security to
          protect your data.
        </ListItem>
      </List>

      <H3>Who else can see my sample data?</H3>

      <P>
        Your group (i.e., your Department of Public Health / &quot;DPH&quot; in
        many cases) can see all of the consensus genomes, metadata and trees
        that are uploaded or created by other members of the group to facilitate
        seamless communication and reporting.
      </P>
      <P>
        When you upload new samples (or send a new sample to CZBiohub for
        sequencing), you can choose to mark it as &quot;Private.&quot; These
        samples will still be visible to other members of your group, but will
        never be shared beyond your group.
      </P>
      <P>
        For new samples that you do not choose to mark &quot;private,&quot; we
        share this data in two ways:
      </P>
      <List>
        <ListItem>
          After two weeks, we will automatically submit the sample to GISAID on
          your behalf. This upload includes the pathogen genome; collection
          date; sequencing lab (i.e., your group); and location (as always, at
          the county level or above).
        </ListItem>
        <ListItem>
          Consistent with the prior COVID Tracker program’s policies, the
          California Department of Public Health (CDPH) will be able to see
          non-private samples, but with your internal, private identifiers
          redacted.
        </ListItem>
      </List>

      <P>
        We are also working on new features to give you granular control over
        how you share data with other groups (e.g., CDPH, or other local DPHs).
      </P>

      <H3>Which service providers do you use?</H3>

      <P>
        We rely on service providers to help us provide and improve Aspen,
        specifically:
      </P>
      <List>
        <ListItem>
          Our technology partner, Chan Zuckerberg Initiative, LLC, who helps us
          operate and secure our technical infrastructure
        </ListItem>
        <ListItem>
          Amazon Web Services, which hosts our database and pipelines.
        </ListItem>
      </List>
      <P>
        In our work with any service provider, we always prioritize the security
        of your data and preventing unauthorized access (e.g., by encrypting
        your data at rest and in transit). All service providers are bound by
        Aspen’s <NewTabLink href={ROUTES.TERMS}>Terms of Service</NewTabLink>{" "}
        and <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink>, and
        are only permitted to use your data to provide the relevant services
        that we rely on in order to offer Aspen to you.
      </P>

      <H3>How do I share my data with CDPH?</H3>

      <P>Please see “Who else can see my sample data” above.</P>

      <H3>How do I access pathogen genomic data stored in Terra?</H3>

      <P>
        We’re partnering with CDPH and Terra to make it seamless for data to be
        accessed from CDPH very soon. Stay tuned for updates!
      </P>
    </>
  );

  return (
    <>
      <Head>
        <title>Aspen | FAQ</title>
      </Head>
      <NarrowContainer>
        {renderIntro()}
        {renderHowToUseAspen()}
        {renderCOVIDTrackerProgram()}
        {renderPrivacyAndDataSharing()}
      </NarrowContainer>
    </>
  );
}
