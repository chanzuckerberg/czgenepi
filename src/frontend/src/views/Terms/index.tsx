import { Link, ListItemLabel } from "czifui";
import Head from "next/head";
import React from "react";
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

export default function Terms(): JSX.Element {
  const renderIntro = () => (
    <>
      <Title>
        <H1>Aspen Terms of Use</H1>
        <H4>Last Updated: May 17, 2021. </H4>
      </Title>
      <P>
        Please read these Terms of Use (&quot;Terms&quot;) before using Aspen
        (&quot;Services&quot; or &quot;Aspen&quot;). These Terms are entered
        into between the Chan Zuckerberg Initiative Foundation, a 501(c)(3)
        nonprofit private foundation, (&quot;CZIF&quot;, &quot;we&quot;,
        &quot;us&quot; or &quot;our&quot;) and you (&quot;User&quot; or
        &quot;you&quot;) and govern your and your organization’s use of Aspen.
      </P>
      <P>
        Aspen is a tool that helps you infer how pathogens are moving through a
        population and how cases are related to one another. Aspen comprises our
        Genomic Epidemiology portal, any associated online services or platforms
        that link to or refer to these Terms, and any databases or data
        accessible through the portal, associated services or platforms.
      </P>
      <P>
        Aspen is offered by the Chan Zuckerberg Initiative Foundation
        (&quot;CZIF&quot;), in close collaboration with the Chan Zuckerberg
        Biohub (&quot;CZB&quot;) and the Chan Zuckerberg Initiative, LLC
        (&quot;CZI LLC&quot;).
      </P>
      <P>
        Please carefully read these terms and indicate your acceptance by
        registering for Aspen. If you do not agree to these Terms, do not
        register for an account to use Aspen. For more information about our
        privacy practices, please see the &quot;Privacy Notice&quot;).
      </P>
      <P>
        <B>
          PLEASE BE ADVISED THAT THIS AGREEMENT CONTAINS AN ARBITRATION
          PROVISION IN SECTION 8 BELOW THAT AFFECTS YOUR RIGHTS UNDER THIS
          AGREEMENT.
        </B>{" "}
        EXCEPT FOR CERTAIN TYPES OF DISPUTES MENTIONED IN THAT PROVISION, YOU
        AND CZIF (AND ITS PARTNERS AND AFFILIATES, INCLUDING WITHOUT LIMITATION
        CZB AND CZI, LLC) AGREE THAT (1) DISPUTES BETWEEN US WILL BE RESOLVED BY
        INDIVIDUAL BINDING ARBITRATION, AND (2) YOU AND CZIF (AND ITS PARTNERS
        AND AFFILIATES, INCLUDING WITHOUT LIMITATION CZB AND CZI, LLC) WAIVE ANY
        RIGHT TO PARTICIPATE IN A CLASS-ACTION LAWSUIT, CLASS-WIDE ARBITRATION,
        OR ANY OTHER REPRESENTATIVE ACTION.
      </P>
    </>
  );

  const renderSummaryOfKeyThingsToKnow = () => {
    return (
      <>
        <H3>Summary of Key Things to Know</H3>
        <List
          items={[
            <span key="0">
              Aspen is a tool that helps you infer how pathogens are moving
              through a population and how cases are related to one another.
            </span>,
            <span key="1">
              Aspen is offered by the Chan Zuckerberg Initiative Foundation
              (CZIF), in close collaboration with the Chan Zuckerberg Biohub
              (CZB) and the Chan Zuckerberg Initiative, LLC (CZI LLC).
            </span>,
            <span key="2">Aspen is a free and open-source tool.</span>,
            <span key="3">
              In order to use Aspen, you must be acting in your professional
              capacity. This means a couple things: (1) your use of Aspen may be
              subject to your organization’s policies and (2) upon sign-up,
              you’ll be placed into a group with other users from your
              organization (3) your Upload Data, and analytical results may be
              shared with third parties in accordance with your organization’s
              policies.
            </span>,
            <span key="4">
              Samples marked &quot;private&quot; will never be shared with 3rd
              parties unless you choose to mark them &quot;public&quot; later
              on.
            </span>,
            <span key="5">
              The outputs (ex: analytical outputs, such as phylogenetic trees)
              you create with Aspen are <B>not</B> personally identifiable. You
              must also ensure that the data you upload to Aspen (Raw Sequence
              Data, Pathogen Consensus Genomes, and Sample Metadata) are
              similarly <B>not</B> personally identifiable. This means removing
              all{" "}
              <Link
                href="https://docs.google.com/document/d/1sboOmbafvMh3VYjK1-3MAUt0I13UUJfkQseq8ANLPl8/edit"
                target="_blank"
                rel="noopener"
              >
                direct identifiers
              </Link>{" "}
              like name, address, dates, telephone numbers, e-mail addresses, or
              medical record numbers from data you upload to Aspen.
            </span>,
            `Aspen does not provide medical advice. The output from Aspen does not constitute and should not be relied upon to provide medical advice, diagnosis or treatment. It is intended for research, educational, or informational purposes only.`,
          ]}
        />
      </>
    );
  };

  const renderUploadAndReportDataTerms = () => (
    <>
      <H2>
        <Number>1.</Number>Upload Data and Analytical Outputs you create
      </H2>
      <List
        items={[
          <span key="0">
            <ListItemLabel>No personally identifying data.</ListItemLabel>
            The data you upload to Aspen consists of Raw Sequence Data, Pathogen
            Consensus Genomes, and Sample Metadata (ex: date collected and
            county-level location data). You should <B>not</B> be uploading any
            information that would allow identification of any specific
            individuals to which the Samples may relate, such as{" "}
            <Link
              href="https://docs.google.com/document/d/1sboOmbafvMh3VYjK1-3MAUt0I13UUJfkQseq8ANLPl8/edit"
              target="_blank"
              rel="noopener"
            >
              direct identifiers
            </Link>{" "}
            like name, address, symptom onset dates or case interview dates,
            telephone numbers, e-mail addresses, or medical record numbers.
          </span>,
          <span key="1">
            <ListItemLabel>Compliance with laws.</ListItemLabel>
            By uploading data to Aspen, you represent and warrant to us that (A)
            you have all consents, permissions, and authorizations necessary for
            uploading the data to Aspen and (B) that your uploading this data to
            Aspen complies with applicable laws, rules, and regulations,
            including the Nagoya Protocol and relevant export laws and industry
            guidelines and ethical standards that apply to you (e.g. CIOMS or
            GA4GH). Please note that we filter out human sequence data as part
            of processing Raw Sequence Data as such information is not necessary
            for providing Aspen.
          </span>,
          <span key="2">
            <ListItemLabel>Our rights and your rights.</ListItemLabel>
            We need some basic rights to use your Upload data in order to offer
            Aspen’s services to you. Specifically, you grant to us a license to
            use (ex: store your data in the Aspen database), reproduce (ex:
            backing up the Aspen database), distribute, display, and create
            derivative works (ex: produce phylogenetic trees per your requests)
            from Upload data in connection with offering and improving Aspen.
            You can request deletion of your Upload Data from Aspen by emailing
            us at{" "}
            <Link
              href="mailto:helloaspen@chanzuckerberg.com"
              target="_blank"
              rel="noopener"
            >
              helloaspen@chanzuckerberg.com
            </Link>{" "}
          </span>,
          <span key="3">
            <ListItemLabel>
              Sharing pathogen genomes and analytical outputs.
            </ListItemLabel>
            Aspen gives you tools to analyze pathogen genomes and create further
            analytical outputs from them (ex: phylogenetic trees) that allow you
            to better understand the relationship between different pathogen
            genomes.
            <List
              items={[
                <span key="0">
                  <ListItemLabel>Within your organization:</ListItemLabel>
                  The pathogen genomes created from your Samples and the
                  analytical outputs you create using Aspen are visible to other
                  Users at your organization (ex: your DPH). You, along with
                  other members of your Group, control whether you permit us to
                  share this information with Users outside your organization.
                  In certain circumstances, we may also share your data with
                  third party entities, through the Aspen tool, in line with
                  your organization’s policies or in line with applicable law.
                  Samples marked &quot;private&quot; will never be shared with
                  any 3rd parties unless you choose to mark them
                  &quot;public&quot; later on.
                </span>,
              ]}
            />
          </span>,
        ]}
      />
    </>
  );

  const renderAuthorizationToUseAspen = () => (
    <>
      <H2>
        <Number>2.</Number>Authorization To Use Aspen
      </H2>
      <List
        items={[
          `You are using Aspen in your professional capacity as a User from your organization. This means that in addition to Aspen’s Terms and Privacy Policy, your organization’s policies also likely apply to your and your colleagues’ use of Aspen. Please see your organization for questions related to their policies.`,
          `Aspen may not be used to provide medical or other services to any third party (for instance, to inform or provide disease diagnoses). Aspen is not intended to diagnose, treat, cure, or prevent any disease and is not a substitute for medical advice.`,
        ]}
      />
    </>
  );

  const renderLimitationsOnUse = () => (
    <>
      <H2>
        <Number>3.</Number>Limitations On Use
      </H2>
      <List
        items={[
          `You shall not otherwise access or use, or attempt to access or use, Aspen to take any action that could harm us, Aspen or its Users, or any third party, or use Aspen in any manner that violates applicable law or infringes or otherwise violates third party rights.`,
          <span key="0">
            You represent and warrant that you are a natural person over the age
            of 16 and that you are acting in your professional capacity as
            authorized by your organization to enter into these Terms.
          </span>,
          `We may restrict or terminate your access to Aspen at any time, including for breach of these Terms. If this happens, we will attempt to provide you notice through the contact information we have for you.`,
        ]}
      />
    </>
  );

  const renderChangesToAspenOrTerms = () => (
    <>
      <H2>
        <Number>4.</Number>Changes To Aspen Or These Terms
      </H2>
      <List
        items={[
          <span key="0">
            <ListItemLabel>Changes to Aspen.</ListItemLabel>Aspen is a free
            tool. We can’t promise Aspen will always be up and offered as it is
            today, but if we are making material changes to its features or that
            impact its availability, we will give you a chance to download
            and/or delete your data so you can take it off of Aspen.
          </span>,
          <span key="1">
            <ListItemLabel>Changes to these Terms.</ListItemLabel>
            We may update these Terms from time to time and will notify you of
            material changes to the Terms, prior to their becoming effective. If
            you do not agree to the updated Terms, your remedy will be to close
            your Account prior to the effective date of those changes.
          </span>,
          <span key="2">
            <ListItemLabel>Closing Your Account.</ListItemLabel>You can close
            your Account at any time. Just contact us at{" "}
            <Link
              href="mailto:aspenprivacy@chanzuckerberg.com"
              target="_blank"
              rel="noopener"
            >
              aspenprivacy@chanzuckerberg.com
            </Link>
          </span>,
        ]}
      />
    </>
  );

  const renderDisclaimerTerms = () => (
    <>
      <H2>
        <Number>5.</Number>Disclaimers.
      </H2>
      <List
        items={[
          <span key="0">
            We and our service providers do not review or correct any data
            uploaded into Aspen. If you would like to report any issue with
            Aspen please contact us at{" "}
            <Link
              href="mailto:aspensecurity@chanzuckerberg.com"
              target="_blank"
              rel="noopener"
            >
              aspensecurity@chanzuckerberg.com
            </Link>
            . Aspen is not intended as a storage service, so please back up your
            Upload Data using a secure service of your choice, such as the
            NCBI’s Sequence Read Archive (SRA) repository.
          </span>,
          <span key="1">
            <P>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</P>
            <List
              items={[
                <span key="0">
                  YOUR ACCESS AND USE ASPEN AT YOUR SOLE RISK AND AGREE THAT WE
                  AND OUR SERVICE PROVIDERS WILL NOT BE RESPONSIBLE FOR ANY
                  ACTIONS YOU TAKE BASED ON ASPEN OR FOR ANY INACCURATE DATA OR
                  OUTPUTS OF ASPEN.
                </span>,
                <span key="1">
                  ASPEN IS PROVIDED &quot;AS IS&quot; WITH ALL FAULTS, AND WE
                  AND OUR SERVICE PROVIDERS HEREBY DISCLAIM ALL REPRESENTATIONS
                  AND WARRANTIES, EXPRESS, STATUTORY, OR IMPLIED (INCLUDING,
                  WITHOUT LIMITATION, IMPLIED WARRANTIES OF TITLE,
                  NON-INFRINGEMENT, MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, AND ALL WARRANTIES ARISING FROM THE COURSE OF
                  DEALING, USAGE, OR TRADE PRACTICE) WITH RESPECT TO ASPEN.
                  ASPEN IS NOT INTENDED TO BE USED AND SHOULD NOT BE USED AS A
                  MEDICAL DEVICE OR FOR PURPOSES OF MEDICAL DIAGNOSIS OR
                  TREATMENT.
                </span>,
                <span key="2">
                  FOR CLARITY AND WITHOUT LIMITING THE FOREGOING, WE AND OUR
                  SERVICE PROVIDERS DO NOT MAKE ANY GUARANTEES (I) REGARDING THE
                  ACCURACY, COMPLETENESS, TIMELINESS, SECURITY, AVAILABILITY OR
                  INTEGRITY OF ASPEN, (II) THAT ASPEN WILL BE UNINTERRUPTED OR
                  OPERATE IN COMBINATION WITH ANY SOFTWARE, SERVICE, SYSTEM OR
                  OTHER DATA, OR (III) THAT ASPEN WILL MEET ANY REQUIREMENTS OF
                  ANY PERSON OR ENTITY, OR ANY REGULATORY APPROVALS OR
                  REQUIREMENTS. WITHOUT LIMITATION, YOU ACKNOWLEDGE THAT ASPEN
                  IS NOT A BUSINESS ASSOCIATE FOR PURPOSES OF HIPAA.
                </span>,
              ]}
            />
          </span>,
        ]}
      />
    </>
  );

  const renderLimitationLiability = () => (
    <>
      <H2>
        <Number>6.</Number>Limitation Of Liability
      </H2>
      <List
        items={[
          <span key="0">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CZIF AND
            AFFILIATES (INCLUDING WITHOUT LIMITATION CHAN ZUCKERBERG INITIATIVE,
            LLC; AND THE CHAN ZUCKERBERG BIOHUB COLLECTIVELY, THE{" "}
            <B>&quot;PROTECTED PARTIES&quot;</B>) WILL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF
            ANY KIND (INCLUDING LOST PROFITS, LOST DATA, BUSINESS INTERRUPTION,
            OR LOSS OF GOODWILL) IRRESPECTIVE OF WHETHER SUCH DAMAGES ARISE FROM
            CLAIMS BROUGHT IN CONTRACT, TORT, NEGLIGENCE, WARRANTY, STRICT
            LIABILITY, OR ANY OTHER THEORY AT LAW OR IN EQUITY, AND EVEN IF ANY
            PROTECTED PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            WITHOUT LIMITING THE FOREGOING, TO THE MAXIMUM EXTENT PERMITTED BY
            APPLICABLE LAW, IN NO EVENT WILL THE PROTECTED PARTIES’ AGGREGATE
            LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE
            EXCEED USD <B>$100</B>.
          </span>,
        ]}
      />
    </>
  );

  const renderIndemnification = () => (
    <>
      <H2>
        <Number>7.</Number>Indemnification
      </H2>
      <List
        items={[
          `You shall indemnify, defend and hold the Protected Parties harmless from and against, and shall pay all damages, costs, fees and expenses (including reasonable attorneys’ fees and expenses) relating to, any third party (including government entity) claim, action, suit or other proceeding (a &quot;Claim&quot;) to the extent arising from: (1) your gross negligence, willful misconduct or fraud; and/or (2) any misrepresentation you make regarding your permission to submit data to Aspen for your organization’s use.`,
          `Indemnification is conditioned upon the Protected Parties giving you written notice of any such Claim, and giving you control of the defense and settlement of any such Claim, and cooperating with you in such defense. Notwithstanding anything to the contrary, (1) the Protected Parties may participate in defense of such Claim with its own counsel at its own expense and (2) you may not settle any Claim without CZIF’s prior written consent, which will not be unreasonably withheld, unless it unconditionally releases the Protected Parties of all liability, obligation, and fault.`,
        ]}
      />
    </>
  );

  const renderArbitration = () => (
    <>
      <H2>
        <Number>8.</Number> Arbitration
      </H2>
      <List
        items={[
          <span key="0">
            <ListItemLabel>Final and Binding Arbitration.</ListItemLabel>
            We endeavor and trust that we will have a productive relationship
            but in the unlikely event we have a dispute that we can’t resolve
            between us, and it results in a legal dispute, BOTH YOU AND WE AGREE
            TO WAIVE OUR RESPECTIVE RIGHTS TO RESOLUTION OF DISPUTES IN A COURT
            OF LAW BY A JUDGE OR JURY AND AGREE TO RESOLVE ANY DISPUTE BY
            ARBITRATION, WHICH WILL BE FINAL AND BINDING, AS SET FORTH BELOW.
          </span>,
          <span key="1">
            <ListItemLabel>Dispute Resolution.</ListItemLabel>
            In the unlikely event we have a dispute arising out of or related to
            the use of Aspen (&quot;Dispute&quot;) that we can’t resolve between
            us, you and we agree that we shall (in good faith) meet and attempt
            to resolve the Dispute within thirty (30) days. If the Dispute is
            not resolved during such time period, then you and a representative
            of CZIF shall (in good faith) meet and attempt to resolve the
            Dispute through non-binding mediation with a mutually agreed upon
            mediator within thirty (30) additional days.
          </span>,
          <span key="2">
            <ListItemLabel>Mutual Agreement to Arbitrate.</ListItemLabel>
            If the Dispute is not resolved within such time period, the Dispute
            shall be resolved per the following arbitration terms. As the
            exclusive, final and binding means of initiating adversarial
            proceedings, you agree that it be resolved fully and finally by
            neutral and binding arbitration administered by JAMS in San Mateo
            County, California, in accordance with its Streamlined Arbitration
            Rules & Procedures, the Federal Arbitration Act, and the substantive
            laws of the State of California, exclusive of conflict or choice of
            law rules. In-person proceedings will take place in San Mateo
            County, California and your reasonable and documented travel
            expenses will be paid by CZIF. The arbitrator shall have the power
            to award any type of relief that would be available in a court of
            competent jurisdiction and will issue a written decision at the end
            of the arbitration, which will be final and binding. Judgment on any
            award rendered in any such arbitration may be entered in any court
            having jurisdiction in San Mateo County, California.
          </span>,
        ]}
      />
    </>
  );

  const renderChoiceOfLaw = () => (
    <>
      <H2>
        <Number>9.</Number>Choice of Law and Venue
      </H2>
      <List
        items={[
          `This Agreement and any Disputes will be governed, controlled, and interpreted by and under the laws of the State of California, without giving effect to any conflicts of laws principles that require the application of the law of a different state. Notwithstanding the foregoing, to the extent such laws are inconsistent with the Federal Arbitration Act, the Federal Arbitration Act will govern. Any dispute that is not subject to arbitration (e.g., if arbitration is deemed unenforceable or inapplicable) shall be, and any judgement on any arbitration award may be, brought in the U.S. District Court for the Northern District of California or a state court located in San Mateo County, California.`,
        ]}
      />
    </>
  );

  const renderGeneralTerms = () => (
    <>
      <H2>
        <Number>10.</Number>General Terms
      </H2>
      <List
        items={[
          `If any provision in these Terms is held invalid or unenforceable, the other provisions will remain enforceable, and the invalid or unenforceable provision will be modified to a valid and enforceable provision that most accurately reflects the parties intentions.`,
          `Any waiver or failure to enforce any of these Terms on one occasion will not be deemed a waiver of any other provision or of that provision on any other occasion.`,
          `You may not assign or transfer any rights or obligations under these Terms without our consent. However, you agree that we may assign these Terms in connection with a reorganization, or to a successor or assign that agrees to assume our obligations under these Terms (and Privacy Policy) without your consent.`,
          `Entire Agreement. These Terms (along with the Privacy Notice) constitute the entire agreement between you and us regarding Aspen. If you wish to modify these Terms, any amendment must be provided to us in writing and signed by our authorized representative.`,
        ]}
      />
    </>
  );

  const renderContactInfo = () => (
    <>
      <H2>
        <Number>11.</Number> How to Contact Us
      </H2>
      <List
        items={[
          <span key="0">
            If you have any questions, comments, or concerns with Terms, you may
            contact us at{" "}
            <Link
              href="mailto:aspenprivacy@chanzuckerberg.com"
              target="_blank"
              rel="noopener"
            >
              aspenprivacy@chanzuckerberg.com
            </Link>
            .
          </span>,
          <P key="1">
            Notice under these Terms must be in writing and deemed to have been
            given on the date delivered by a nationally recognized express mail
            service, such as Federal Express, or by certified and registered
            mail (signature for receipt required) to CZIF as follows:
            <br />
            <br />
            Chan Zuckerberg Initiative Foundation
            <br />
            c/o The Chan Zuckerberg Initiative
            <br />
            Attn: General Counsel
            <br />
            2682 Middlefield Road, Suite i<br />
            Redwood City, CA 94063
            <br />
            With a courtesy copy via email to:{" "}
            <Link
              href="mailto:legalczi1@chanzuckerberg.com"
              target="_blank"
              rel="noopener"
            >
              legalczi1@chanzuckerberg.com
            </Link>{" "}
            (email does not constitute notice)
            <br />
          </P>,
        ]}
      />
      <div style={{ height: "50px" }} />
    </>
  );

  return (
    <>
      <Head>
        <title>Aspen | Terms of Service</title>
      </Head>
      <NarrowContainer>
        {renderIntro()}
        {renderSummaryOfKeyThingsToKnow()}
        {renderUploadAndReportDataTerms()}
        {renderAuthorizationToUseAspen()}
        {renderLimitationsOnUse()}
        {renderChangesToAspenOrTerms()}
        {renderDisclaimerTerms()}
        {renderLimitationLiability()}
        {renderIndemnification()}
        {renderArbitration()}
        {renderChoiceOfLaw()}
        {renderGeneralTerms()}
        {renderContactInfo()}
      </NarrowContainer>
    </>
  );
}
