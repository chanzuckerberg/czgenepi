import Image from "next/image";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledHeader, StyledP } from "./style";

interface Props {
  content: string | JSX.Element;
  footer?: string;
  img: string;
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
  // logoWidth and logoHeight needed for next image to resize image properly
  // note that the number value refers to pixels (ex 45 -> 45px)
  logoWidth: number;
  logoHeight?: number; // optional, defaults to 45 since both modals have shared image height
  customConfirmButton?: JSX.Element;
}

const RedirectConfirmationModal = ({
  content,
  footer,
  img,
  isOpen,
  onClose,
  onConfirm,
  logoWidth,
  logoHeight = 45, // 45 px
  ...props
}: Props): JSX.Element => {
  const title = (
    <>
      <Image // using next image for png files, see https://nextjs.org/docs/basic-features/image-optimization#image-sizing
        src={img}
        height={logoHeight}
        width={logoWidth}
        layout={"intrinsic"} // Scale down to fit width of container, up to image size
      />
      <StyledHeader>You are now leaving CZ GEN EPI.</StyledHeader>
    </>
  );

  const formattedContent = (
    <div>
      <StyledP>{content}</StyledP>
    </div>
  );

  return (
    <div>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        content={formattedContent}
        footer={footer}
        {...props}
      />
    </div>
  );
};

export { RedirectConfirmationModal };
