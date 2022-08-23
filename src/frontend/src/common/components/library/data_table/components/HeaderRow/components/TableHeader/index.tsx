import { Icon, Tooltip } from "czifui";
import { ReactNode } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import {
  StyledHeaderCellContent,
  StyledSampleTableHeader,
  StyledTreeTableHeader,
} from "./style";

interface Props {
  doesSortOnThisCol: boolean;
  header: Header;
  isSortedAscending: boolean;
  onClick(): void;
  isSampleTable: boolean;
}

const TableHeader = ({
  doesSortOnThisCol,
  header,
  isSortedAscending,
  onClick,
  isSampleTable,
}: Props): JSX.Element => {
  const { align, text, tooltip } = header;

  let tooltipTitle: JSX.Element | string = "";

  if (tooltip) {
    const { boldText, regularText, link } = tooltip;
    const { href, linkText } = link ?? {};

    tooltipTitle = (
      <div>
        <b>{boldText}</b>: {regularText}{" "}
        {link && <NewTabLink href={href}>{linkText}</NewTabLink>}
      </div>
    );
  }

  let sortIndicator: JSX.Element | null = null;

  if (doesSortOnThisCol) {
    sortIndicator = isSortedAscending ? (
      <Icon sdsIcon="chevronUp" sdsSize="xs" sdsType="static" />
    ) : (
      <Icon sdsIcon="chevronDown" sdsSize="xs" sdsType="static" />
    );
  }

  const HeaderWrapper = ({ children }: { children: ReactNode }): JSX.Element =>
    isSampleTable ? (
      <StyledSampleTableHeader
        align={align}
        data-test-id="header-cell"
        onClick={onClick}
      >
        {children}
      </StyledSampleTableHeader>
    ) : (
      <StyledTreeTableHeader data-test-id="header-cell" onClick={onClick}>
        {children}
      </StyledTreeTableHeader>
    );

  return (
    <HeaderWrapper>
      <Tooltip arrow title={tooltipTitle} placement="bottom" leaveDelay={0}>
        <StyledHeaderCellContent>{text}</StyledHeaderCellContent>
      </Tooltip>
      {sortIndicator}
    </HeaderWrapper>
  );
};

export { TableHeader };
