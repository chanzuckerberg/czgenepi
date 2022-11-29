import { NewTabLink } from "src/common/components/library/NewTabLink";
import usherLogo from "src/common/images/usher.png";
import { RedirectConfirmationModal } from "src/views/Data/components/RedirectConfirmationModal";

interface Props {
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
}

const UsherConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
}: Props): JSX.Element => {
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your genomic data to
      UCSC’s UShER visualization service, and that you understand this may make
      the data accessible to others. UShER is a separate service from CZ GEN
      EPI. Your data will be subject to their{" "}
      <NewTabLink href="https://genome.ucsc.edu/conditions.html">
        Conditions of Use
      </NewTabLink>
      .
    </>
  );

  const footer =
    "Your tree will open in a new tab. It may take a few minutes for UShER to prepare your placement.";

  return (
    <div>
      <RedirectConfirmationModal
        content={content}
        img={usherLogo}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        footer={footer}
        logoWidth={115}
      />
    </div>
  );
};

export { UsherConfirmationModal };
