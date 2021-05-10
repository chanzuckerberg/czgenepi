import { Link, ListItemLabel } from "czifui";
import React from "react";
import { ROUTES } from "src/common/routes";
import List from "src/common/styles/support/components/List";
import {
  B,
  H1,
  H2,
  H3,
  H4,
  NarrowContainer,
  Number,
  P,
  Title,
} from "src/common/styles/support/style";
import {
  Container,
  ContentRow,
  SectionRow,
  Table,
  TopRow,
  UnderLineHeader,
} from "./style";

const PrivacyPolicy = (): JSX.Element => {
  const renderIntro = () => (
    <>
      <Title>
        <H1>Aspen Privacy Policy</H1>
        <H4>Last Updated: May 17, 2021. </H4>
      </Title>
      <P>
        The Chan Zuckerberg Initiative Foundation, a 501(c)(3) nonprofit private
        foundation (&quot;CZIF,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;), provides the Aspen product (&quot;Services&quot; or
        &quot;Aspen&quot;) in close collaboration with the Chan Zuckerberg
        Biohub (&quot;CZB&quot;), and the Chan Zuckerberg Initiative, LLC
        (&quot;CZI LLC&quot;). This Privacy Policy describes the types of
        information we collect or that is uploaded by Aspen Users (collectively
        &quot;Users&quot; or &quot;you&quot;, ex: registered public health
        officials at state and/or county level Departments of Public Health
        (&quot;DPH&quot;), other public health researchers), and how we use,
        share, and protect that information.
      </P>
      <H3>About Aspen</H3>
      <P>
        Aspen is a tool that uses pathogen genomic sequence data to help you
        infer how pathogens are moving through a population and how cases and
        outbreaks are related. In order to become a User of Aspen you must be
        acting in your organizational capacity, which means a couple things: (1)
        your use of Aspen may be subject to your organization’s policies and (2)
        upon sign-up, you’ll be placed into a group with other users from your
        organization.
      </P>
      <P>
        Because of the time-sensitive nature of pathogen genomic data, we
        strongly encourage the sharing of pathogen sequences, which are not
        personally identifiable, with the broader scientific and public health
        communities as soon as possible. To support this scientific
        collaboration, Aspen submits pathogen genomes and minimal metadata
        (collection date, sequencing lab, and location at the county level or
        above) to{" "}
        <B>
          public repositories such as GISAID after 2 weeks from initial upload.
        </B>{" "}
        You can turn this submission off by marking your pathogen genome as
        private within the 2-week period.{" "}
      </P>
      <P>
        <i>Here’s how Aspen processes and manages Upload Data:</i> Users submit
        Raw Sequence Data (as described below) as well as information about
        those sequences, such as the date the sample was collected (“Sample
        Metadata” as further defined below -- Raw Sequence Data and Sample
        Metadata together make “Upload Data”). Any human genetic data contained
        within the Raw Sequence Data is filtered out and deleted following
        upload, leaving genomic data only about the pathogen. This pathogen
        genomic data is then analyzed in order to identify the
        normally-occurring genetic mutations that make up each pathogen sample’s
        unique genetic “barcode.” This barcode can then be used to identify
        strains, variants, and relationships between samples.{" "}
        <B>
          By default, these analytical outputs will be visible to the User that
          uploaded the Sample and other members of the User’s organization
          (“Group”, ex: a Department of Public Health) using Aspen.
        </B>
      </P>
      <P>
        Users can then choose to share analytical outputs outside their Group.
        We hope that this sharing of pathogen data will help to create a clearer
        picture of how pathogens are circulating in your community and thereby
        help advance public health goals.
      </P>
      <P>
        To help you better understand our Privacy Policy, we’ve created the
        below Summary, which includes bullets regarding Key Things to Know, as
        well as a Table summarizing key aspects of our data practices. For more
        information about the rules governing your use of Aspen, please also see
        our{" "}
        <Link href={ROUTES.TERMS} target="_blank" rel="noopener">
          Terms of Use (“Terms”)
        </Link>
        .{" "}
        <B>
          Please remember that you are using Aspen in your organizational
          capacity, which means that your organization’s policies will apply to
          your use.
        </B>
      </P>

      <H3>Key Things to Know</H3>
      <List
        items={[
          "Aspen is a free and open-source tool.",
          <span key={0}>
            You always own the data you upload. You decide how you want your
            data to be shared, and you can delete your data from Aspen at any
            time. However, due to the time-sensitive nature of pathogen data, if
            you do not wish for your Pathogen Consensus Genome to be shared with
            the GISAID public repository,{" "}
            <B>
              you must mark this data as ‘Private’ within 2 weeks of
              upload/creation of the consensus genome.
            </B>
          </span>,
          "You’re using Aspen in your professional capacity, which means any pathogen sample data you upload, and any data that we generate on the basis of this, are visible to other members (Users) in your Group. This data is only available to anyone outside of your organization when it is shared by you, or by your organization (ex: with the CDPH).",
          "Human genetic data with uploaded data is processed only so we can filter out and permanently delete it. We do not keep this non-pathogen genomic data and it’s not necessary to operate the tool. ",
          <span key={1}>
            Similarly, Aspen{" "}
            <B>
              does not contain any personally identifying metadata or
              health-related information
            </B>{" "}
            and Users are not permitted to upload such data. The only metadata
            we require is your originating lab information and Sample
            identifier, Sample collection date, and Sample location (at the
            county level or above). You control the metadata resolution that you
            upload (e.g., you can choose to list only the state, or to redact
            collection dates before uploading). We collect this metadata only
            for the purposes of providing analyses for you, enabling you to link
            back to your epidemiological data (outside of Aspen), and optionally
            submitting to public repositories.
          </span>,
        ]}
      ></List>
    </>
  );

  const renderSummaryTable = () => (
    <>
      <Table>
        <tbody>
          <TopRow>
            <td>Type of Data</td>
            <td>What is it?</td>
            <td>What’s it used for?</td>
            <td>How is it shared?</td>
            <td>Your Choices</td>
          </TopRow>
          <SectionRow>
            <td colSpan={5}>
              <B>Data you upload to or create using Aspen</B>
            </td>
          </SectionRow>
          <ContentRow>
            <td>
              <B>Raw Sequence Data</B>
            </td>
            <td>
              Genetic sequence files (ex: FASTQ) uploaded by Users containing
              both host and pathogenic genomic data.
            </td>
            <td>
              <P>
                Upon upload, Raw Sequence Data is processed through our data
                pipeline and all human genetic information is filtered out and
                deleted.
              </P>
              <P>
                We use the remaining data, with Sample Metadata, to create the
                Pathogen Consensus Genome and to support your creation of
                further analytical results.
              </P>
            </td>
            <td>
              <P>
                Raw Sequence Data is processed only to filter out host data. It
                is not available to anyone other than you.
              </P>
              <P>
                Other than as specifically requested by you, such as to debug an
                issue, staff working on Aspen never access this data.
              </P>
            </td>
            <td rowSpan={4}>
              <P>
                Users can request deletion of Raw Sequence Data, Sample
                Metadata, Pathogen Consensus Genomes, analytical outputs, or
                their Aspen account data by contacting us at{" "}
                <Link
                  href="mailto:helloaspen@chanzuckerberg.com"
                  target="_blank"
                  rel="noopener"
                >
                  helloaspen@chanzuckerberg.com
                </Link>{" "}
                and we will fulfill the request within 60 days.
              </P>
              <P>
                Please be aware, however, that we cannot delete any Pathogen
                Consensus Genomes or analytical outputs which have been shared
                outside of Aspen.
              </P>
            </td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Sample Metadata</B>
            </td>
            <td>
              Data about Samples annotated by Users (ex: sample collection date
              or location).
            </td>
            <td>See above.</td>
            <td>
              <div>
                <P>
                  Sample Metadata is visible to other users in your Group, as
                  well as third party entities, such as CDPH, that your Group is
                  visible to.
                </P>
                <P>
                  This data is also accessible by technical partners (CZ Biohub
                  and CZI, LLC) and Service Providers (ex: AWS) that help
                  operate and secure Aspen. For example, we need to be able to
                  access your data in order to back up and maintain the
                  database.
                </P>
                <P>
                  This Privacy Policy applies to all parties that access data to
                  support Aspen and they will not use the data for any purpose
                  beyond operating and securing Aspen.
                </P>
                <P>
                  We will never sell your data or share it with anyone that
                  does.
                </P>
              </div>
            </td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Pathogen Consensus Genome</B>
            </td>
            <td>
              Data about the likely pathogen strains contained within the Raw
              Sequence Data
            </td>
            <td>
              <P>See above.</P>
              <P>
                Users may also upload this data to Aspen directly if they have
                assembled a pathogen consensus genome in a different program,
                but would like to analyze that genome in Aspen.
              </P>
            </td>
            <td>
              <P>
                Pathogen Consensus Genomes are visible to other users in your
                Group, as well as third party entities, such as CDPH, that your
                Group is visible to.
              </P>
              <P>
                Pathogen Consensus Genomes will be shared with public
                repositories, such as GISAID, 2 weeks after upload <B>unless</B>{" "}
                you mark the sample as “private.” Samples marked “private” will
                never be shared with any public repositories (ex: GISAID) or
                other 3rd parties (ex: CDPH) unless you choose to mark them
                “public” later on.
              </P>
            </td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Analytical results</B>
            </td>
            <td>
              Analyses created by Users based on Pathogen Consensus Genomes (ex:
              phylogenetic trees).
            </td>
            <td>
              Users use Aspen to drive analytical results that they can then
              choose to share more broadly.
            </td>
            <td>See above.</td>
          </ContentRow>

          <SectionRow>
            <td colSpan={5}>
              <B>Data IDseq collects</B>
            </td>
          </SectionRow>
          <ContentRow>
            <td>
              <B>User Data</B>
            </td>
            <td>
              Data about researchers with IDseq accounts such as name, email,
              institution, basic information about how they are using IDseq (ex:
              search queries), and information provided for user support (ex:
              resolving support requests).
            </td>
            <td>
              We use this data only to operate, secure, and improve the IDseq
              services.
            </td>
            <td>
              <div>
                <P>
                  Basic IDseq account information such as name and institution
                  may be visible to other IDseq Users (ex: with collaborators on
                  a shared project).
                </P>
                <br />
                <P>
                  This data is also shared with technical partners (CZI LLC) and
                  Service Providers (ex: AWS) that help operate and secure
                  IDseq.
                </P>
                <br />
                <P>
                  CZI LLC and Service Providers are limited by this Privacy
                  Policy and will not use any data shared with them for any
                  purpose beyond operating and securing IDseq.
                </P>
                <br />
                <P>
                  We will never sell your data or share it with anyone that
                  does.
                </P>
              </div>
            </td>
            <td rowSpan={2}>
              Users can request deletion of their IDseq account data by
              contacting us at privacy@idseq.net and we will fulfill the request
              within 60 days.
            </td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Device and Analytics Data</B>
            </td>
            <td>
              Device Data (ex: browser type and operating system) and Analytics
              Information (ex: links within IDseq you click on and how often you
              log into IDseq) includes basic information about how Users and
              Visitors are interacting with IDseq.
            </td>
            <td>See above.</td>
            <td>See above.</td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Visitor Data</B>
            </td>
            <td>
              Data about visitors (non-Users) to IDseq pages, such as IDseq.net
              and includes basic analytics information (ex: links clicked).
            </td>
            <td>See above.</td>
            <td>See above.</td>
            <td>This data is not personally identifiable.</td>
          </ContentRow>
        </tbody>
      </Table>
    </>
  );

  const renderAboutIdseq = () => (
    <>
      <H3>About IDseq</H3>
      <P>
        IDseq is an online platform designed to enable the research community to
        research pathogens in metagenomic sequencing and to help further the
        study of infectious diseases. To do this, IDseq processes genetic data
        in order to identify pathogens contained within.
      </P>
      <P>
        Here’s how IDseq works: Users submit Upload Data (as described below).
        This data may contain human and non-human genetic sequences (“Raw Sample
        Data”; as further defined below), as well as information about those
        sequences, such as the date the sample was collected and the host
        species it was collected from (“Sample Metadata” as further defined
        below). For example, a researcher might upload genetic information from
        mosquitoes, which are often a source of infectious disease, or from
        humans, who can be infected by such diseases. IDseq then processes this
        Upload Data in order to identify pathogens found within the genetic
        sequence (e.g., the mosquito may be carrying the chikungunya virus).
      </P>
      <P>
        We hope that this sharing of pathogen data will help to create a global
        dashboard that helps researchers better understand pathogens.
      </P>
      <P>
        IDseq also collects information about Users in order to offer the
        Service. Other than basic information required to create an account
        (e.g. email address, name), the User determines what information they
        want to upload onto IDseq. Please note: IDseq is not designed for or
        directed toward children under the age of sixteen.
      </P>
    </>
  );

  const renderUploadDataPolicy = () => (
    <>
      <H2>
        <Number>1.</Number>Upload Data.
      </H2>
      <P>
        “Upload Data” is data that Users upload to IDseq (other than the
        information Users provide during registration to create an account). As
        explained below, Upload Data consists of genetic sequence information
        (human or non-human) and metadata about those genetic sequences (such as
        time and location of sample collection).
      </P>
      <P>
        As described in our Terms, Users are required to obtain and maintain all
        necessary consents, permissions, and authorizations required by
        applicable laws prior to uploading, sharing, and exporting Upload Data
        with the Services.
      </P>
      <P>
        <UnderLineHeader>What Is Upload Data?</UnderLineHeader>
      </P>
      <P>Upload Data includes Sample Data and Sample Metadata.</P>
      <List
        items={[
          <span key={0}>
            <ListItemLabel>Raw Sample Data:</ListItemLabel> “Raw Sample Data” is
            full genetic sequence data uploaded by Users (i.e. FASTA or FASTQ
            files). Genetic sequence data contains genetic information about
            pathogens in the sample and of the host from which the sample was
            taken. The host could be a human or non-human (e.g., mosquito). Host
            genetic information is filtered out in order to generate Reports, so
            Report Data should not contain any human sequence data.
          </span>,
          <span key={1}>
            <ListItemLabel>Sample Metadata:</ListItemLabel> “Sample Metadata”
            includes information related to the Raw Sample Data, such as the
            host type (e.g., human or mosquito), upload date, and tissue type
            and free-text research notes entered by Users. This data should not
            include personally-identifying information regarding the individual
            to whom the Raw Sample Data relates.
          </span>,
        ]}
      />
      <P>
        <UnderLineHeader>How We Use Upload Data</UnderLineHeader>
      </P>
      <P>Upload Data is used for the following purposes:</P>
      <List
        items={[
          `To create Report Data (described below), including new reports for
        Users when we update our Data Pipeline.`,
          `To improve the way IDseq creates Report Data, including improving
        our Data Pipeline.`,
          `To debug in the event you reach out to us with a specific issue related to your Upload Data. `,
        ]}
      />
      <P>We will never sell your data or share it with anyone that does.</P>
      <P>
        <UnderLineHeader>How We Share Upload Data</UnderLineHeader>
      </P>
      <P>
        Raw Sample Data is <B>never</B> shared with anyone other than the User
        that uploaded the Sample. Even staff working on IDseq cannot access this
        information except as specifically instructed by a User, such as to
        debug an issue.
      </P>
      <P>
        In order to advance IDseq’s goal of creating a global pathogen dashboard
        for researchers, Report Data and Sample Metadata will be made available
        to <B>all IDseq users</B> 1 year after Raw Sample Data is uploaded.
        Before this 1-year anniversary of upload, Users can also choose to share
        their Report Data and Sample Metadata by creating Projects (groups of
        Reports) and sharing those Projects with other IDseq users.
      </P>
      <P>
        If you have questions about how this 1-year anniversary policy impacts
        your data, then please reach out to{" "}
        <Link href="mailto:help@idseq.net">help@idseq.net</Link>.
      </P>
      <P>
        <UnderLineHeader>
          What’s our legal basis to use and share Upload Data?
        </UnderLineHeader>
      </P>
      <P>
        To the extent that the European Union’s General Data Protection
        Regulation (“GDPR”) applies, we rely on the following legal bases to use
        and share personal data within Upload Data:
      </P>
      <List
        items={[
          `The explicit consent of the individual whose data is contained in Raw Sample Data, where such consent has been obtained by the User in accordance with the GDPR; and`,
          `The public interest and our and our Users’ legitimate interest in investigating and stopping the spread of infectious diseases and promoting global health. The use and sharing of personal data within Upload Data furthers the public interest in the area of public health, particularly by helping to protect against serious cross-border threats to health. The processing of personal data within Upload Data is also necessary for scientific research purposes.`,
        ]}
      />
    </>
  );

  const renderReportDataPolicy = () => (
    <>
      <H2>
        <Number>2.</Number>Report Data.
      </H2>
      <P>
        Report Data is information IDseq produced from Upload Data. We generate
        Report Data by processing Upload Data through our Data Pipeline. The
        “Data Pipeline” cleans (e.g., by removing duplicate nucleotides) and
        analyzes (e.g., by matching Raw Sample Data nucleotide sequences with
        known pathogen sequences) the Upload Data. Report Data may include, for
        example, data about the pathogen sequences identified in the Raw Sample
        Data and the frequency of such identification (“Pathogen Data”) or raw
        numeric counts of non-personally identifying gene expression profiles
        that were found in the Raw Sample Data (“Gene Counts”).
      </P>
      <P>
        Once Raw Sample Data has been put through the Data Pipeline, the Report
        Data that is produced no longer includes any human genetic sequence
        data, and is not personal data, and does not, on its own, permit
        association with any specific individual. If you are able to find human
        sequence data in any Reports in IDseq, please let us know at
        privacy@idseq.net and we will address it.
      </P>
      <P>
        <UnderLineHeader>Who can see Report Data?</UnderLineHeader>
      </P>
      <P>
        As mentioned above, after 1 year from when Raw Sample Data is uploaded,
        Report Data (including Sample Metadata) is visible to all IDseq Users,
        and they may share it with others beyond IDseq. This <B>does not</B>{" "}
        include Raw Sample Data - those genetic sequence files are available
        only to the User that uploaded the Sample.
      </P>
      <P>
        Users also have the option to share their Report Data with certain third
        party tools, like Nextclade. You control whether to use this integration
        or not. If you do, we will collect basic information about your use of
        that integration, such as how often you use it.
      </P>
    </>
  );

  const renderVisitorAndUserDataPolicy = () => (
    <>
      <H2>
        <Number>3.</Number>Visitor and User Data.
      </H2>
      <P>
        Visitor and User Data is the information we collect from you and your
        use of IDseq.
      </P>
      <P>
        <UnderLineHeader>What We Collect</UnderLineHeader>
      </P>
      <List
        items={[
          <span key={0}>
            <ListItemLabel>Visitor Data.</ListItemLabel>
            This is information collected from visitors to our website, whether
            or not they are Users (“Visitor Data”).
          </span>,
          <span key={1}>
            <ListItemLabel>User Data.</ListItemLabel>
            User Data is any information we collect from a User about that User
            (“User Data”). It may include information necessary to create or
            access your account such as your name, username, email address, and
            login credentials.
          </span>,
          <span key={2}>
            <ListItemLabel>Device and Analytics Data.</ListItemLabel>
            When Visitors and Users visit or use our Service, we may
            automatically collect Device Data or Analytics Information. “Device
            Data” includes information about your browser type and operating
            system, IP address and/or device ID, including basic analytics from
            your device or browser. “Analytics Information” relates to any of
            your requests, queries, or use of the Services, such as the amount
            of time spent viewing particular web pages. We use{" "}
            <Link href="/faq">Google Analytics</Link> for this service.
          </span>,
          <span key={3}>
            <ListItemLabel>
              Cookies, Web Beacons, and other Technologies.
            </ListItemLabel>
            A cookie is a small file that may be stored on your computer or
            other device. Web beacons and similar technologies are small bits of
            code embedded in web pages, ads, and email that communicate with
            third parties. We use these technologies to recognize your device
            and browser and do things such as keep you logged in or to
            understand usage patterns by Users and Visitors to our Services. We
            do not use cookies to service third party ads. For more information
            about our use of cookies, please see our{" "}
            <Link href="/faq">FAQ</Link>.
          </span>,
        ]}
      />
      <P>
        <UnderLineHeader>How We Use That Data</UnderLineHeader>
      </P>
      <P>
        Visitor Data and User Data (including any Personal Data in the Visitor
        Data and User Data) will be used for the following purposes:
      </P>
      <List
        items={[
          `To identify you, create a profile for Users, and verify User’s
          identity so you can log in to and use IDseq.`,
          `To provide you with notices about your account and updates about
        IDseq.`,
          `To respond to your inquiries and requests.`,
          `To analyze how Users and Visitors are using IDseq so we can optimize
        and improve it.`,
          `To protect the security and integrity of IDseq.`,
        ]}
      />
      <P>
        <UnderLineHeader>
          What is our legal basis for using Personal Data in Visitor Data and
          User Data?
        </UnderLineHeader>
      </P>
      <P>
        We (along with CZI LLC) have a legitimate interest in using personal
        data within Visitor Data and User Data in the ways described in this
        Privacy Policy operate, secure, and improve IDseq. This allows us to
        improve the service that we provide to Users which, in turn, supports
        research regarding the study of infectious disease with the potential to
        benefit global public health.
      </P>
    </>
  );

  const renderVendorAndThirdPartyPolicy = () => (
    <>
      <H2>
        <Number>4.</Number>Vendors and Other Third Parties.
      </H2>
      <P>
        CZ Biohub and CZIF collaborate closely in order to build, design, and
        operate IDseq so that it can be as useful as possible to researchers and
        the public health community. CZI LLC is our primary technology partner,
        focusing on IDseq’s infrastructure, security, and compliance. The three
        parties are all data controllers for data within IDseq and will use data
        only as described in this Privacy Policy.
      </P>
      <P>
        We also share Upload Data, Report Data, Visitor Data, and User Data with
        service providers, including service providers to CZI LLC, such as
        database providers like Amazon Web Services and customer support
        providers like Zendesk. We may also share Visitor and User data with
        analytics vendors that assist us to improve and optimize IDseq. To learn
        more about our vendors we use, please see our{" "}
        <Link href="/faq">FAQ</Link> or contact us at privacy@idseq.net.
      </P>
      <P>
        If we can no longer keep operating IDseq or believe that its purpose is
        better served by having another entity operating it, we will transfer
        IDseq and all data existing therein (Upload Data, Report Data, Visitor
        Data, and User Data) so that the Users can continue to be served. We
        will always let you know before this happens, and you will have the
        option to delete your account and any data you’ve uploaded. Should this
        occur, the entity to which we transfer your data will be obliged to use
        it in a manner that is consistent with this Privacy Notice and the
        Terms.
      </P>
      <P>
        We may disclose Upload Data, Report Data, Visitor Data, and/or User Data
        if we believe in good faith that such disclosure is necessary (a) in
        connection with any legal investigation; (b) to comply with relevant
        laws or to respond to subpoenas or warrants served on us; (c) to protect
        or defend our rights or property or those of Users; and/or (d) to
        investigate or assist in preventing any violation or potential violation
        of the law, this Privacy Notice, or our Terms.
      </P>
    </>
  );

  const renderInformationProtectionPolicy = () => (
    <>
      <H2>
        <Number>5.</Number>How We Protect the Information.
      </H2>
      <P>
        We use industry standard security measures to ensure the
        confidentiality, integrity and availability of data uploaded into IDseq.
        This includes practices like encrypting connections to IDseq using TLS,
        hosting IDseq on leading cloud providers with robust physical security,
        and ensuring that access to any personal data within IDseq by staff
        working on the tool is strictly limited. And as mentioned above, Raw
        Sample Data is <B>never shared</B> with anyone other than the User that
        uploaded the Sample. Even staff working on IDseq cannot access this
        information except as specifically instructed by a User, such as to
        debug an issue.
      </P>
      <P>
        Security takes ongoing work and we will continue to monitor and adjust
        our security measures as IDseq develops. Please notify us immediately at{" "}
        <Link href="mailto:security@idseq.net">security@idseq.net</Link> if you
        suspect your account has been compromised or are aware of any other
        security issues relating to IDseq.
      </P>
    </>
  );

  const renderDataRetentionAndDeletionPolicy = () => (
    <>
      <H2>
        <Number>6.</Number>How Long We Retain Data and Data Deletion.
      </H2>
      <P>
        We retain your personal data only as long as is reasonably necessary:
      </P>
      <List
        items={[
          `Raw Sample Data and Sample Metadata is retained until Users delete it from IDseq. Users may submit deletion requests by emailing privacy@idseq.net and we will delete the requested Raw Sample Data and corresponding Report Data (including Sample Metadata) within 60 days.`,
          `Report Data produced by IDseq will be retained on IDseq.`,
          `User Data is retained until Users delete their IDseq account as such data is required to manage the service. Users may submit account deletion requests by emailing privacy@idseq.net. We will delete personal data within 60 days following close of your account.`,
        ]}
      />
      <P>
        Please note that we do not control, and so cannot delete, personal data
        that Users have copied outside of IDseq.
      </P>
    </>
  );

  const renderUserDataChoicesPolicy = () => (
    <>
      <H2>
        <Number>7.</Number>Choices About Your Data.
      </H2>
      <P>If you are a User, you have the following choices:</P>
      <List
        items={[
          `Users are able to request the deletion of User Data that constitutes their personal data or Raw Sample Data that they submitted to IDseq.`,
          `Users are able to access and download Report Data relating to Upload Data they submitted within IDseq.`,
          `Users may also object to the processing of User Data in certain circumstances by emailing privacy@idseq.net. In such cases, we will stop processing that data unless we have legitimate grounds to continue processing it -- for example, it is needed for legal reasons.`,
          `Users can also contact us by emailing privacy@idseq.net should they wish to access, restrict the processing of, or rectify their User Data.`,
        ]}
      />
      <P>
        If a User has submitted Upload Data containing your personal data,
        please see below:
      </P>
      <List
        items={[
          `We require Users who submit Upload Data to ensure they have all necessary consents, permissions, and authorizations to do so. We are unable to relate Upload Data to identifiable individuals and so cannot directly process requests from persons whose personal sequencing data may be contained in Upload Data. As a result, IDseq is able to receive access, restriction, rectification, objection, or deletion requests only from Users.`,
          `If you believe your information has been uploaded to IDseq, you should contact the researcher or User that uploaded this information to (i) request access to the information, (ii) object to the processing of the information, or (iii) seek deletion, restriction, or rectification of the information. Similarly, if you previously provided consent to a researcher or User, you may have the right to withdraw that consent. You should contact the researcher or User to make such a withdrawal or otherwise exercise your rights.`,
        ]}
      />
      <P>
        Please contact us at{" "}
        <Link href="mailto:privacy@idseq.net">privacy@idseq.net</Link> if you
        would like to exercise the privacy choices discussed above or if you
        have any questions. If your data is subject to the EU data protection
        law (e.g., GDPR) and you wish to raise a concern about our use of your
        information (and without prejudice to any other rights you may have),
        you have the right to do so with your local supervisory authority or by
        emailing us at{" "}
        <Link href="mailto:privacy@idseq.net">privacy@idseq.net</Link>.
      </P>
    </>
  );

  const renderDataTransferPolicy = () => (
    <>
      <H2>
        <Number>8.</Number>Data Transfers.
      </H2>
      <P>
        IDseq is a global service. By using IDseq, Users authorize us to
        transfer and store the uploaded data outside of your home country,
        including to the United States, for the purposes described in this
        Privacy Notice.
      </P>
      <P>
        If you want to use IDseq, you must first agree to our{" "}
        <Link href="/terms">Terms</Link>, which set out the contract between
        IDseq and our Users. We operate in countries worldwide (including in the
        United States) and use technical infrastructure in the United States to
        deliver the Services to you. In accordance with the contract between us
        and our Users, we need to transfer personal data to the United States
        and to other jurisdictions as necessary to provide the Services. Such
        transfers are necessary for important reasons of public interest, namely
        global health and providing information which can be used by researchers
        to better understand the spread of infectious diseases. Please note that
        the privacy protections and the rights of authorities to access your
        information in these countries may not be the same as in your home
        country.
      </P>
    </>
  );

  const renderContactInfo = () => (
    <>
      <H2>
        <Number>9.</Number>How to Contact Us.
      </H2>
      <P>
        If you have any questions, comments, or concerns with this Privacy
        Notice, you may contact our Data Protection Officer (DPO) by email at
        privacy@idseq.net or by physical mail at the addresses below.
      </P>
      <P>
        To comply with article 27 of the GDPR and the UK-GDPR, we have appointed
        a representative who can accept communications in relation to personal
        data processing activities falling within the scope of the GDPR or the
        UK-GDPR. If you wish to contact them, their details are as follows:
      </P>
      <P>
        <UnderLineHeader>European GDPR Representative:</UnderLineHeader>
        <P>
          Bird & Bird GDPR Representative Services SRL
          <br />
          Avenue Louise 235
          <br />
          1050 Bruxelles
          <br />
          Belgium
          <br />
          <Link href="mailto:EUrepresentative.ChanZuckerberg@twobirds.com">
            EUrepresentative.ChanZuckerberg@twobirds.com
          </Link>
        </P>
      </P>
      <P>
        <UnderLineHeader>UK Data Protection Representative:</UnderLineHeader>
        <P>
          Bird & Bird GDPR Representative Services UK
          <br />
          12 New Fetter Lane
          <br />
          London EC4A 1JP
          <br />
          United Kingdom
          <br />
          <Link href="mailto:UKrepresentative.ChanZuckerberg@twobirds.com">
            UKrepresentative.ChanZuckerberg@twobirds.com
          </Link>
        </P>
      </P>
    </>
  );

  const renderChangesToPrivacyNotice = () => (
    <>
      <H2>
        <Number>10.</Number>Changes to This Privacy Notice.
      </H2>
      <P>
        This Privacy Notice was last updated on the date above. We may update
        this Privacy Notice from time to time and will provide you with notice
        of material updates before they become effective.
      </P>
      <div style={{ height: "50px" }} />
    </>
  );

  return (
    <Container>
      <NarrowContainer>
        {renderIntro()}
        {renderSummaryTable()}
        {renderAboutIdseq()}
        {renderUploadDataPolicy()}
        {renderReportDataPolicy()}
        {renderVisitorAndUserDataPolicy()}
        {renderVendorAndThirdPartyPolicy()}
        {renderInformationProtectionPolicy()}
        {renderDataRetentionAndDeletionPolicy()}
        {renderUserDataChoicesPolicy()}
        {renderDataTransferPolicy()}
        {renderContactInfo()}
        {renderChangesToPrivacyNotice()}
      </NarrowContainer>
    </Container>
  );
};

export default PrivacyPolicy;
