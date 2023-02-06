import { NewTabLink } from "src/common/components/library/NewTabLink";
import { TooltipTextType } from "src/views/Data/tableHeaders/types";

interface TooltipTextProps {
  tooltipStrings?: TooltipTextType;
}

export const TooltipText = ({
  tooltipStrings,
}: TooltipTextProps): JSX.Element | null => {
  if (!tooltipStrings) return null;

  const { boldText, regularText, link } = tooltipStrings;
  const { href, linkText } = link ?? {};

  return (
    <div>
      <b>{boldText}</b>: {regularText}{" "}
      {link && <NewTabLink href={href}>{linkText}</NewTabLink>}
    </div>
  );
};
