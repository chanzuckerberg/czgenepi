import { List, ListItem } from "czifui";
import React from "react";
import { HeadAppTitle } from "src/common/components";
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
      <H1>Chan Zuckerberg GEN EPI (formerly Aspen) FAQs</H1>
    </Title>
  );

  const renderHowToUseCZGenEpi = () => {
    return (
      <>
        <H2>How to use CZ GEN EPI</H2>

        <H3>How do I login?</H3>
        <P>
          Navigate to{" "}
          <NewTabLink href={ROUTES.HOMEPAGE}>czgenepi.org</NewTabLink> and click
          on the “Sign In” button in the upper right hand corner. You should be
          redirected to a login screen where you can enter your email address
          and password.{" "}
          <B>
            Note: you can login to CZ GEN EPI using the same credentials that
            you used to login to Aspen and to the COVID Tracker app.
          </B>{" "}
          If you forget your password, click the “Forgot password?” link on the
          login screen. You will receive an email with instructions for
          resetting your password.
        </P>

        <H3>How do I upload samples?</H3>
        <P>
          Once logged in, click &quot;Upload&quot; in the top right corner of
          the screen. We&apos;ll guide you through each step of the process of
          preparing your genomes and metadata for upload. We also pull genomes
          uploaded to GISAID once per day, if your genomes are on GISAID, they
          can be included for tree building without being uploaded to CZ GEN
          EPI.
        </P>

        <H3>How do I generate trees?</H3>
        <P>
          Check out our{" "}
          <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit">
            Tree Building Guide
          </NewTabLink>{" "}
          for complete information on the different tree types within CZ Gen Epi
          and how to build them depending on your use case.
        </P>

        <H3>How do I securely overlay my PHI / PII metadata?</H3>
        <P>
          For each tree in the “Phylogenetic Trees” tab of CZ GEN EPI, you can
          download a TSV template that can be used to collect any other metadata
          that you would like to visualize alongside your genomic data. Click on
          the “Download” button in the row of the tree that you are interested
          in and choose the file called “Private IDs (.tsv)”. This will download
          a TSV file where each row is a sample in the tree. You can add
          additional columns to add custom metadata.
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
          overlay PHI / PII directly in CZ GEN EPI. If you have ideas or
          requests, please let us know at{" "}
          <NewTabLink href="mailto:hello@czgenepi.org">
            hello@czgenepi.org
          </NewTabLink>
          !
        </P>

        <H3>How can I get support or make a feature request?</H3>
        <P>
          Our team is here to support you! Please reach out to us anytime at{" "}
          <NewTabLink href="mailto:hello@czgenepi.org">
            hello@czgenepi.org
          </NewTabLink>
          . We regularly monitor that inbox for support requests, bug reports,
          and feature requests. CZ GEN EPI is still in its early stages, and we
          work closely with our users to improve the experience -- we read and
          discuss every bit of feedback. We want to make sure that we are
          building a tool that satisfies the most pressing needs of the public
          health communities.{" "}
        </P>

        <H3>How can I delete my data?</H3>
        <P>
          Please reach out to our team at{" "}
          <NewTabLink href="mailto:hello@czgenepi.org">
            hello@czgenepi.org
          </NewTabLink>{" "}
          with your deletion requests and we will handle it within 60 days. When
          we delete your data, we remove it from our database and any file
          storage we have. In a future version of CZ GEN EPI, you will have the
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
        <NewTabLink href={ROUTES.RESOURCES}>
          https://czgenepi.org/resources
        </NewTabLink>
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
        <NewTabLink href={ROUTES.PRIVACY}>
          https://czgenepi.org/privacy
        </NewTabLink>
      </P>
      <P>
        You can find our Terms of Service at:{" "}
        <NewTabLink href={ROUTES.TERMS}>https://czgenepi.org/terms</NewTabLink>
      </P>

      <P>A summary of key things to know: </P>
      <List>
        <ListItem>
          <span>
            You <B>always</B> own and control the data you upload.
          </span>
        </ListItem>
        <ListItem>
          Only other members of your group can see your data. Other
          organizations that you share your data with can see your samples, but
          not your private, internal identifiers.
        </ListItem>
        <ListItem>
          You can mark a sample as “private” anytime. &quot;Private&quot;
          samples are not shared with other organizations, but are visible to
          your group. CZ GEN EPI does not contain any personally identifiable
          information or protected health information.
        </ListItem>
        <ListItem>
          We utilize industry standard best practices in information security,
          such as encrypting your data at rest and in transit, to ensure the
          security of your data.
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
        When you upload new samples, you can choose to mark them as
        &quot;Private.&quot; These samples will still be visible to other
        members of your group, but will never be shared beyond your group.
      </P>
      <List>
        <ListItem>
          <span>
            We may also share your Pathogen Consensus Genomes and/or analytical
            outputs with third parties in accordance with the provisions of your
            organization’s policies and/or as required by law. For example,
            certain users in California currently allow the California
            Department of Public Health (&quot;CDPH&quot;) to access data from
            their Group. Where such access is allowed by Groups, the third party
            can access this data through their own CZ GEN EPI accounts, and may
            have similar permissions as members of the uploading Group.{" "}
            <B>
              However, they will not have access to your private, internal
              identifiers.
            </B>
          </span>
        </ListItem>
        <ListItem>
          We are also working on new features to give you more granular control
          over how you share data with other groups
        </ListItem>
      </List>

      <H3>Which service providers do you use?</H3>

      <P>
        We rely on service providers to help us provide and improve CZ GEN EPI,
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
        your data at rest and in transit). All service providers are bound by CZ
        GEN EPI’s <NewTabLink href={ROUTES.TERMS}>Terms of Service</NewTabLink>{" "}
        and <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink>, and
        are only permitted to use your data to provide the relevant services
        that we rely on in order to offer CZ GEN EPI to you.
      </P>

      <H3>How do I access pathogen genomic data stored in Terra?</H3>

      <P>
        We’re partnering with CDPH and Terra to make it seamless for data to be
        accessed from CDPH very soon. Stay tuned for updates!
      </P>
    </>
  );

  return (
    <>
      <HeadAppTitle subTitle="FAQ" />
      <NarrowContainer>
        {renderIntro()}
        {renderHowToUseCZGenEpi()}
        {renderCOVIDTrackerProgram()}
        {renderPrivacyAndDataSharing()}
      </NarrowContainer>
    </>
  );
}
