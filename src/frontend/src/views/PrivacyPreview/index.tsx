import { List, ListItem, ListItemLabel } from "czifui";
import { HeadAppTitle } from "src/common/components";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { ROUTES } from "src/common/routes";
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
} from "src/common/styles/basicStyle";
import { PageContent } from "../../common/styles/mixins/global";
import {
  ContentRow,
  SectionRow,
  Table,
  TopRow,
  UnderLineHeader,
} from "./style";

const PrivacyPolicyPreview = (): JSX.Element => {
  const renderIntro = () => (
    <>
      <Title>
        <H1>Chan Zuckerberg GEN EPI (formerly Aspen) Privacy Policy</H1>
        <H4>Last Updated: August 18, 2022</H4>
      </Title>
      <P>
        The Chan Zuckerberg Initiative Foundation, a 501(c)(3) nonprofit private
        foundation (&quot;<B>CZIF</B>,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;), provides the Chan Zuckerberg GEN EPI product
        (&quot;Services&quot; or &quot;CZ GEN EPI&quot;) in close collaboration
        with the Chan Zuckerberg Biohub (&quot;<B>CZB</B>&quot;), and the Chan
        Zuckerberg Initiative, LLC (&quot;<B>CZI LLC</B>&quot;). This Privacy
        Policy describes the types of information we collect or that is uploaded
        by CZ GEN EPI Users (collectively &quot;Users&quot; or &quot;you&quot;,
        ex: registered public health officials at state and/or county level
        Departments of Public Health (&quot;<B>DPH</B>&quot;), other public
        health researchers), and how we use, share, and protect that
        information.
      </P>
      <H3>About CZ GEN EPI</H3>
      <P>
        CZ GEN EPI is a tool that uses pathogen genomic sequence data to help
        you infer how pathogens are moving through a population and how cases
        and outbreaks are related. In order to become a User of CZ GEN EPI you
        must be acting in your organizational capacity, which means a couple
        things: (1) your use of CZ GEN EPI may be subject to your organization’s
        policies and (2) upon sign-up, you’ll be placed into a group with other
        users from your organization.
      </P>
      <P>
        Here’s how CZ GEN EPI processes and manages Upload Data: Users submit
        Raw Sequence Data (as described below) as well as information about
        those sequences, such as the date the sample was collected (&quot;Sample
        Metadata&quot; as further defined below -- Raw Sequence Data and Sample
        Metadata together make &quot;Upload Data&quot;). Any human genetic data
        contained within the Raw Sequence Data is filtered out and deleted
        following upload, leaving genomic data only about the pathogen. This
        pathogen genomic data is then analyzed in order to identify the
        normally-occurring genetic mutations that make up each pathogen sample’s
        unique genetic &quot;barcode.&quot; This barcode can then be used to
        identify strains, variants, and relationships between samples.{" "}
        <B>
          By default, these analytical outputs will be visible to the User that
          uploaded the Sample and other members of the User’s organization
          (&quot;Group&quot;, ex: a Department of Public Health) using CZ GEN
          EPI.
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
        information about the rules governing your use of CZ GEN EPI, please
        also see our{" "}
        <NewTabLink href={ROUTES.TERMS}>
          Terms of Use (&quot;Terms&quot;)
        </NewTabLink>
        .{" "}
        <B>
          Please remember that you are using CZ GEN EPI in your organizational
          capacity, which means that your organization’s policies will apply to
          your use.
        </B>
      </P>

      <H3>Key Things to Know</H3>
      <List>
        <ListItem>CZ GEN EPI is a free and open-source tool.</ListItem>
        <ListItem>
          You always own the data you upload. You decide how you want your data
          to be shared, and you can delete your data from CZ GEN EPI at any
          time.
        </ListItem>
        <ListItem>
          You’re using CZ GEN EPI in your professional capacity, which means any
          pathogen sample data you upload, and any data that we generate on the
          basis of this, are visible to other members (Users) in your Group.
          This data is only available to anyone outside of your organization
          when it is shared by you, or by your Group. Other organizations that
          you share your data with can see your samples, but not your private,
          internal identifiers.
        </ListItem>
        <ListItem>
          Human genetic data with uploaded data is processed only so we can
          filter out and permanently delete it. We do not keep this non-pathogen
          genomic data and it’s not necessary to operate the tool.
        </ListItem>
        <ListItem>
          <span>
            Similarly, CZ GEN EPI{" "}
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
            back to your epidemiological data (outside of CZ GEN EPI), and
            optionally submitting to public repositories.
          </span>
        </ListItem>
      </List>
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
              <B>Data you upload to or create using CZ GEN EPI</B>
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
                issue, staff working on CZ GEN EPI never access this data.
              </P>
            </td>
            <td rowSpan={4}>
              <P>
                Users can request deletion of Raw Sequence Data, Sample
                Metadata, Pathogen Consensus Genomes, analytical outputs, or
                their CZ GEN EPI account data by contacting us at{" "}
                <NewTabLink href="mailto:hello@czgenepi.org">
                  hello@czgenepi.org
                </NewTabLink>{" "}
                and we will fulfill the request within 60 days or sooner
                depending on applicable privacy laws.
              </P>
              <P>
                Please be aware, however, that we cannot delete any Pathogen
                Consensus Genomes or analytical outputs which have been shared
                outside of CZ GEN EPI.
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
                  well as third party entities that your Group is visible to.
                  These entities can see your samples, but not your private,
                  internal identifiers.
                </P>

                <P>
                  This data is also accessible by technical partners (CZ Biohub
                  and CZI, LLC) and Service Providers (ex: AWS) that help
                  operate, secure, and improve CZ GEN EPI. For example, we need
                  to be able to access your data in order to back up and
                  maintain the database.
                </P>

                <P>
                  This Privacy Policy applies to all parties that access data to
                  support CZ GEN EPI and they will not use the data for any
                  purpose beyond operating, securing, and improving CZ GEN EPI.
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
                Users may also upload this data to CZ GEN EPI directly if they
                have assembled a pathogen consensus genome in a different
                program, but would like to analyze that genome in CZ GEN EPI.
              </P>
            </td>
            <td>
              <P>
                Pathogen Consensus Genomes are visible to other users in your
                Group, as well as third party entities that your Group is
                visible to.
              </P>
              <P>
                Samples marked &quot;private&quot; will never be shared beyond
                your Group unless you choose to mark them &quot;public&quot;
                later on.
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
              Users use CZ GEN EPI to drive analytical results that they can
              then choose to share more broadly.
            </td>
            <td>
              Analytical results you create are visible to other users in your
              Group, as well as third party entities, that your Group is visible
              to.
            </td>
          </ContentRow>

          <SectionRow>
            <td colSpan={5}>
              <B>Data CZ GEN EPI collects</B>
            </td>
          </SectionRow>
          <ContentRow>
            <td>
              <B>User Data</B>
            </td>
            <td>
              Data about researchers with CZ GEN EPI accounts such as name,
              email, institution, basic information about how they are using CZ
              GEN EPI, and information provided for user support (ex: resolving
              support requests).
            </td>
            <td>
              We use this data only to operate, secure, and improve the CZ GEN
              EPI services.
            </td>
            <td>
              <P>
                Basic CZ GEN EPI account information such as name and
                institution may be visible to other CZ GEN EPI Users.
              </P>
              <P>
                This data is also shared with technical partners (CZ Biohub and
                CZI, LLC) and Service Providers (ex: AWS) that help operate,
                secure, and improve CZ GEN EPI.
              </P>
              <P>
                This Privacy Policy applies to all parties that access data to
                support CZ GEN EPI and they will not use the data for any
                purpose beyond operating, securing, and improving CZ GEN EPI.
              </P>
              <P>
                We will never sell your data or share it with anyone that does.
              </P>
            </td>
            <td rowSpan={2}>
              Users can request deletion of their CZ GEN EPI account data by
              contacting us at{" "}
              <NewTabLink href="mailto:hello@czgenepi.org">
                hello@czgenepi.org
              </NewTabLink>{" "}
              and we will fulfill the request within 60 days or sooner depending
              on applicable privacy laws.
            </td>
          </ContentRow>
          <ContentRow>
            <td>
              <B>Device and Analytics Data</B>
            </td>
            <td>
              Device Data (ex: browser type and operating system) and Analytics
              Information (ex: links within CZ GEN EPI you click on and how
              often you log into CZ GEN EPI) includes basic information about
              how Users and Visitors are interacting with CZ GEN EPI.
            </td>
            <td>See above.</td>
            <td>See above.</td>
          </ContentRow>
        </tbody>
      </Table>
    </>
  );

  const renderUploadDataPolicy = () => (
    <>
      <H2>
        <Number>1.</Number>Upload Data
      </H2>
      <P>
        &quot;Upload Data&quot; is data that Users upload to CZ GEN EPI (other
        than the information which is provided during registration to create a
        User account). Upload Data consists of pathogen genomic data (including
        &quot;Raw Sequence Data&quot;, which includes both host and pathogenic
        genome data and &quot;Pathogen Consensus Genomes,&quot; which is only
        pathogenic genome data) and corresponding metadata (&quot;Sample
        Metadata&quot;, such as time and location of sample collection). In the
        event that human genetic sequence information is uploaded as part of the
        Upload, it is removed as part of processing the Upload.
      </P>
      <P>
        As described in our <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink>,
        Users are required to obtain and maintain all necessary consents,
        permissions, and authorizations required by applicable laws prior to
        uploading, sharing, and exporting Upload Data with the Services.
      </P>
      <P>
        <UnderLineHeader>What Is Upload Data?</UnderLineHeader>
      </P>
      <P>
        Upload Data includes Raw Sequence Data, Pathogen Consensus Genomes, and
        Sample Metadata.
      </P>
      <List>
        <ListItem>
          <span>
            <ListItemLabel>Raw Sequence Data:</ListItemLabel> &quot;Raw Sequence
            Data&quot; is genomic sequence data, including both host and
            pathogenic data. As part of the process of processing this data
            uploaded to CZ GEN EPI, any identifiable human genetic data is
            filtered and removed. This means that CZ GEN EPI should <B>not</B>{" "}
            contain any human sequence data. Note that if there are no issues
            identified with the corresponding Pathogen Consensus Genome, the Raw
            Sequencing Data will be permanently deleted from our backend after
            90 days. We encourage Users to submit raw reads to the Sequencing
            Read Archive for long-term storage.
          </span>
        </ListItem>
        <ListItem>
          <span>
            <ListItemLabel>Pathogen Consensus Genomes:</ListItemLabel>{" "}
            &quot;Pathogen Consensus Genomes&quot; are genetic sequences of
            pathogens, such as SARS-CoV-2, mapped to pathogen-specific reference
            genomes. These may either be uploaded directly to CZ GEN EPI or
            generated by CZ GEN EPI from uploaded Raw Sequence Data (see below).
          </span>
        </ListItem>
        <ListItem>
          <span>
            <ListItemLabel>Sample Metadata:</ListItemLabel> &quot;Sample
            Metadata&quot; includes information related to the Raw Sequence
            Data, such as the upload date, location, originating lab or purpose
            of the sampling (e.g. surveillance, outbreak investigation, etc).
            Users <u>should not</u> include personally-identifying information
            or protected health information regarding the individual to whom the
            Raw Sequence Data relates.
          </span>
        </ListItem>
      </List>
      <P>
        If you are able to find data in CZ GEN EPI or any Sample Metadata that
        you believe is identifying, please let us know at{" "}
        <NewTabLink href="mailto:privacy@czgenepi.org">
          privacy@czgenepi.org
        </NewTabLink>{" "}
        and we will address it.
      </P>
      <P>
        <UnderLineHeader>How We Use Upload Data</UnderLineHeader>
      </P>
      <P>Upload Data is used for the following purposes:</P>
      <List>
        <ListItem>
          To provide Users and their Groups with a &quot;Pathogen Consensus
          Genome.&quot; The Pathogen Consensus Genome is provided on a per-Raw
          Sequence basis.
        </ListItem>
        <ListItem>
          To provide Users and their Groups with analytical outputs that help
          identify variation and relationship between samples, such as
          phylogenetic trees.
        </ListItem>
        <ListItem>
          To improve the way CZ GEN EPI processes Pathogen Consensus Genomes and
          Users’ ability to use CZ GEN EPI to create useful analytical outputs.
        </ListItem>
        <ListItem>
          To troubleshoot in the event you reach out to us with a specific issue
          related to your Upload Data.
        </ListItem>
      </List>
      <P>
        We do not own Upload Data and will never sell it. As mentioned above,
        your Upload Data <B>will</B> be visible within your Group.
      </P>
      <P>
        <UnderLineHeader>How We Share Upload Data</UnderLineHeader>
      </P>
      <P>
        Raw Sequence Data and Sample Metadata are shared back to the Users that
        uploaded the data, as well as other Users within the same organization
        (your &quot;Group&quot;). Please note that while the Raw Sequence Data
        is temporarily visible to other members of your Group, this data is not
        retained on the CZ GEN EPI platform.
      </P>
      <P>
        We may also share your Pathogen Consensus Genomes (whether uploaded by
        you or generated by us) and/or analytical outputs with third parties in
        accordance with the provisions of your organization’s policies and/or as
        required by law. For example, certain Users in California currently
        allow the California Department of Public Health (&quot;CDPH&quot;) to
        access data from their Group. Where such access is allowed by Groups,
        the third party can access this data through their own CZ GEN EPI
        accounts, and may have similar viewing permissions as members of the
        uploading Group. However, they will not have access to your private,
        internal identifiers.
      </P>
      <P>
        You control the sharing of Raw Sequence Data and Sample Metadata which
        has been uploaded by any member of your organization Group. It will not
        be visible to other Users outside of your Group unless you choose to
        share it more broadly. <B>We don’t own, rent, or sell your data.</B>
      </P>
      <P>
        Pathogen Consensus Genomes, whether uploaded by you or generated by CZ
        GEN EPI, will be shared by us with public repositories (as set out
        below) unless you choose to mark this information as
        &quot;private.&quot; In the event that the Pathogen Consensus Genome is
        created by us, it will automatically be marked as private if the
        corresponding Raw Sequence Data is marked private.
      </P>
      <P>
        <UnderLineHeader>
          What’s our legal basis to use and share Upload Data?
        </UnderLineHeader>
      </P>
      <P>
        Data uploaded to CZ GEN EPI by Users should <B>always</B> be anonymous.
        The pathogen genome does not contain personal data, as it cannot be
        personally linked with an identifiable individual.
      </P>
      <P>
        In the rare event that human genetic data is not successfully deleted in
        the initial upload process, CZ GEN EPI may process this data only
        insofar as necessary in order to delete it. This processing is in our
        legitimate interest, and in the legitimate interests of CZB and CZI LLC,
        in order for us to ensure that no personal data is contained within the
        genomic data stored on CZ GEN EPI.
      </P>
    </>
  );

  const renderReportDataPolicy = () => (
    <>
      <H2>
        <Number>2.</Number>Pathogen Consensus Genomes and analytical outputs
        created from Upload Data
      </H2>
      <P>
        If you have uploaded Raw Sequence Data, we first strip any human reads,
        and then generate a Pathogen Consensus Genome by mapping the remaining
        sequencing reads to a pathogen-specific reference genome. These
        Consensus Genomes are the foundational unit of analysis for genomic
        epidemiology. If you have submitted Pathogen Consensus Genomes as Raw
        Sequence Data, we simply align it to the appropriate pathogen reference
        genome.
      </P>
      <P>
        CZ GEN EPI also gives you the ability to create new analytical outputs
        from pathogen genomes, such as phylogenetic trees that allow you to
        better map the relationship between strains.
      </P>

      <UnderLineHeader>
        Who can see your Pathogen Consensus Genomes and analytical outputs?
      </UnderLineHeader>
      <P>
        Users have full control over their data and the ability to mark samples
        as &quot;private&quot;. Private samples will never be shared outside of
        your Group unless you choose to mark them as &quot;public&quot; later
        on.
      </P>

      <UnderLineHeader>Who can see your analytical results?</UnderLineHeader>
      <P>
        Analytical results, including phylogenetic trees, generated from your
        Upload Data and Pathogen Consensus Genomes are the property of your
        Group only, and can only be seen by you and members of your group. You
        and your group control who to share them with and when.
      </P>
      <P>
        Additionally, as outlined above, this data may be visible in some form
        to third parties in accordance with your organization’s policies, or in
        accordance with applicable law.
      </P>
    </>
  );

  const renderVisitorAndUserDataPolicy = () => (
    <>
      <H2>
        <Number>3.</Number>User Data
      </H2>
      <P>
        CZ GEN EPI also collects information about Users in order to offer the
        Service. Other than basic information required to create an account
        (e.g. email address, name, Group affiliation), the User determines what
        information they want to upload onto CZ GEN EPI.
      </P>

      <UnderLineHeader>What We Collect</UnderLineHeader>

      <List>
        <ListItem>
          <span>
            <ListItemLabel>User Data.</ListItemLabel>
            User Data is any information we collect from a User about that User
            (&quot;User Data&quot;). It may include information necessary to
            create or access your account such as your name, email, Group name
            and contact email, and login credentials.
          </span>
        </ListItem>
        <ListItem>
          <span>
            <ListItemLabel>Analytics.</ListItemLabel>
            When Users visit or use our Service, we may automatically collect
            some information so that we can understand the way in which our tool
            is being used. We may collect some Device Data or Analytics
            Information in order to do this. &quot;Device Data&quot; includes
            information about your browser type and operating system, IP address
            and/or device ID. &quot;Analytics Information&quot; relates to any
            of your requests, queries, or use of the Services, such as the
            amount of time spent viewing particular web pages. We use Analytics
            Information in accordance with our legitimate interests. Any data
            which we collect for analytics purposes will be stored in a
            de-identified and aggregated manner wherever possible; any analytics
            data that is not able to be aggregated and de-identified will not be
            shared beyond the CZ GEN EPI team and will be stored for no longer
            than is necessary.
          </span>
        </ListItem>
        <ListItem>
          <span>
            <ListItemLabel>
              Cookies, Web Beacons, and other Technologies.
            </ListItemLabel>
            A cookie is a small file that may be stored on your computer or
            other device. Web beacons and similar technologies are small bits of
            code embedded in web pages or email, for example, that communicate
            with a third party service provider. We use these technologies to
            recognize your device and browser and do things such as keep you
            logged in or to understand usage patterns. We do not use cookies for
            marketing and advertising purposes. For more information about our
            use of cookies, please see our{" "}
            <NewTabLink href={ROUTES.PRIVACY_DATA_SHARING_FAQ}>
              Privacy &amp; Data Sharing FAQ
            </NewTabLink>
            .
          </span>
        </ListItem>
      </List>
      <P>
        <UnderLineHeader>How We Use That Data</UnderLineHeader>
      </P>
      <P>
        User Data will be used to operate, secure, and improve the Services.
        This means the following purposes:
      </P>
      <List>
        <ListItem>
          To create a profile for Users, and verify Users’ identity so you can
          log in to and use CZ GEN EPI.
        </ListItem>
        <ListItem>
          To provide you with notices about your account and updates about CZ
          GEN EPI.
        </ListItem>
        <ListItem>To respond to your inquiries and requests.</ListItem>
        <ListItem>
          To analyze broadly how Users are using CZ GEN EPI so we can optimize
          and improve it.
        </ListItem>
        <ListItem>
          To protect the security and integrity of CZ GEN EPI.
        </ListItem>
      </List>
      <P>
        <UnderLineHeader>
          What is our legal basis for using Personal Data in User Data?
        </UnderLineHeader>
      </P>
      <P>
        We (along with CZB and CZI LLC) have a legitimate interest in using
        personal data within User Data in the ways described in this Privacy
        Policy to operate, secure, and improve CZ GEN EPI. This allows us to
        improve the service that we provide to Users which, in turn, supports
        research regarding the study of infectious disease with the potential to
        benefit global public health.
      </P>
    </>
  );

  const renderVendorAndThirdPartyPolicy = () => (
    <>
      <H2>
        <Number>4.</Number>Vendors and Other Third Parties
      </H2>
      <P>
        CZB, CZIF, and CZI LLC collaborate closely in order to build, design,
        and operate CZ GEN EPI so that it can be as useful as possible to
        researchers and the public health community. CZB and CZIF provide
        scientific and data analysis leadership and CZI LLC focuses on
        maintaining CZ GEN EPI’s infrastructure, security, and compliance. The
        three parties are all data controllers for CZ GEN EPI and will all only
        use data as described in this Privacy Policy.
      </P>
      <P>
        We also use service providers, such as a database provider and analytics
        providers, to support and improve the operation of CZ GEN EPI. These
        service providers are data processors and their use is limited to the
        purposes disclosed in this Privacy Policy. For more information about
        our use of service providers, please see our{" "}
        <NewTabLink href={ROUTES.PRIVACY_DATA_SHARING_FAQ}>
          Privacy &amp; Data Sharing FAQ
        </NewTabLink>
        .
      </P>
      <P>
        Users have the option to share their analytical outputs with certain
        third party tools. You control whether to use these integrations or not.
      </P>
      <P>
        In certain circumstances, we also share your Upload Data and analytical
        results with other governmental, public health entities in accordance
        with your organization’s policies and with applicable law. For example,
        certain Users in California currently allow the California Department of
        Public Health (&quot;CDPH&quot;) to access Upload Data and analytical
        results from their Group.
      </P>
      <P>
        In the unlikely event that we can no longer keep operating CZ GEN EPI or
        believe that its purpose is better served by having another entity
        operating it, we may transfer CZ GEN EPI and all data existing therein
        (Upload Data, analytical outputs, and User Data) so that Users can
        continue to be served. We will always let you know <B>before</B> this
        happens, and you will have the option to delete your account and any
        data you’ve uploaded. Should this occur, the entity to which we transfer
        your data will be obliged to use it in a manner that is consistent with
        this Privacy Policy and our{" "}
        <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink>.
      </P>
      <P>
        We may disclose Upload Data, analytical outputs, and/or User Data if we
        believe in good faith that such disclosure is necessary (a) to comply
        with our legal obligations or to respond to subpoenas or warrants served
        on us; (b) to protect or defend our rights or property or those of
        Users; and/or (c) to investigate or assist in preventing any violation
        or potential violation of this Privacy Policy, or our{" "}
        <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink>.
      </P>
    </>
  );

  const renderInformationProtectionPolicy = () => (
    <>
      <H2>
        <Number>5.</Number>How We Protect the Information
      </H2>
      <P>
        We use industry standard security measures to ensure the
        confidentiality, integrity and availability of data uploaded into CZ GEN
        EPI. This includes practices like encrypting connections to CZ GEN EPI
        using TLS (encrypting data while in transit), hosting CZ GEN EPI on
        leading cloud providers with robust physical security, and ensuring that
        access to any personal data within CZ GEN EPI by CZIF, CZB, and CZI LLC
        staff is limited to those staff who need access to operate the Service.
      </P>
      <P>
        Security takes ongoing work and we will continue to monitor and adjust
        our security measures as CZ GEN EPI develops. Please notify us
        immediately at{" "}
        <NewTabLink href="mailto:security@czgenepi.org">
          security@czgenepi.org
        </NewTabLink>{" "}
        if you suspect your account has been compromised or are aware of any
        other security issues relating to CZ GEN EPI.
      </P>
    </>
  );

  const renderDataRetentionAndDeletionPolicy = () => (
    <>
      <H2>
        <Number>6.</Number>How Long We Retain Data and Data Deletion
      </H2>
      <P>
        We retain your personal data only as long as is reasonably necessary:
      </P>
      <List>
        <ListItem>
          <span>
            We retain Pathogen Consensus Genomes, Sample Metadata and analytical
            outputs until Users delete them from CZ GEN EPI. Users may delete
            their data by contacting us at{" "}
            <NewTabLink href="mailto:hello@czgenepi.org">
              hello@czgenepi.org
            </NewTabLink>
            .
          </span>
        </ListItem>
        <ListItem>
          We store Raw Sequence Data (ex: fastq files) for 90 days following
          upload. If no abnormalities are found in the resulting Pathogen
          Consensus Genome, we discard this data. We encourage submission to
          NCBI’s Sequence Read Archive (SRA) repository for long-term storage
          and sharing.
        </ListItem>
        <ListItem>
          <span>
            User Data is retained until Users delete their CZ GEN EPI account
            because this data is required to manage the service. Users may
            submit account deletion requests by emailing{" "}
            <NewTabLink href="mailto:hello@czgenepi.org">
              hello@czgenepi.org
            </NewTabLink>
            . We will delete personal data within 60 days following the closure
            of your account or sooner depending on applicable privacy laws.
          </span>
        </ListItem>
      </List>
      <P>
        Please note that we do not control, and so cannot delete Pathogen
        Consensus Genomes and analytical outputs that have been shared outside
        of CZ GEN EPI.
      </P>
    </>
  );

  const renderUserDataChoicesPolicy = () => (
    <>
      <H2>
        <Number>7.</Number>Choices About Your Data
      </H2>
      <P>Users have the following choices:</P>
      <List>
        <ListItem>
          Users are able to request the deletion of User Data that constitutes
          their personal data, or Upload Data that they submitted to CZ GEN EPI.
          Users may also request the deletion from CZ GEN EPI of the Pathogen
          Consensus Genomes created by CZ GEN EPI on the basis of their Upload
          Data.
        </ListItem>
        <ListItem>
          Users have full control over any analytical outputs created by any
          member of their organization group on the basis of the Pathogen
          Consensus Genome.
        </ListItem>
        <ListItem>
          Users are able to access and download analytical results relating to
          Upload Data submitted by a member of their organization group within
          CZ GEN EPI.
        </ListItem>
        <ListItem>
          <span>
            If you have any questions about our processing of any data, please
            contact us at{" "}
            <NewTabLink href="mailto:privacy@czgenepi.org">
              privacy@czgenepi.org
            </NewTabLink>
            .
          </span>
        </ListItem>
      </List>
    </>
  );

  const renderDataLocation = () => (
    <>
      <H2>
        <Number>8.</Number>Data Location
      </H2>
      <P>
        CZ GEN EPI is a US-based service. If you want to use CZ GEN EPI, you
        must first agree to our{" "}
        <NewTabLink href={ROUTES.TERMS}>Terms</NewTabLink>, which set out the
        contract between CZ GEN EPI and our Users. We operate in the United
        States, and use technical infrastructure in the United States to deliver
        the Services to you.
      </P>
    </>
  );

  const renderContactInfo = () => (
    <>
      <H2>
        <Number>9.</Number>How to Contact Us
      </H2>
      <P>
        If you have any questions, comments, or concerns with this Privacy
        Policy, you may contact us at{" "}
        <NewTabLink href="mailto:privacy@czgenepi.org">
          privacy@czgenepi.org
        </NewTabLink>
        .
      </P>
    </>
  );

  const renderChangesToPrivacyNotice = () => (
    <>
      <H2>
        <Number>10.</Number>Changes to This Privacy Notice
      </H2>
      <P>
        We may update this Privacy Policy from time to time and will provide you
        with notice of material updates before they become effective.
      </P>
    </>
  );

  return (
    <>
      <HeadAppTitle subTitle="Privacy" />
      <PageContent>
        <NarrowContainer>
          {renderIntro()}
          {renderSummaryTable()}
          {renderUploadDataPolicy()}
          {renderReportDataPolicy()}
          {renderVisitorAndUserDataPolicy()}
          {renderVendorAndThirdPartyPolicy()}
          {renderInformationProtectionPolicy()}
          {renderDataRetentionAndDeletionPolicy()}
          {renderUserDataChoicesPolicy()}
          {renderDataLocation()}
          {renderContactInfo()}
          {renderChangesToPrivacyNotice()}
        </NarrowContainer>
      </PageContent>
    </>
  );
};

export default PrivacyPolicyPreview;
