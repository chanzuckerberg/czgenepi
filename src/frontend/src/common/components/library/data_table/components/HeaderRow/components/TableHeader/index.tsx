import { Tooltip } from "czifui";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import SortArrowDownIcon from "src/common/icons/IconArrowDownSmall.svg";
import SortArrowUpIcon from "src/common/icons/IconArrowUpSmall.svg";
import { StyledHeaderCellContent, StyledTableHeader } from "./style";

interface Props {
  doesSortOnThisCol: boolean;
  header: Header;
  isSortedAscending: boolean;
  onClick(): void;
  shouldArrowPointUp: boolean;
}

const TableHeader = ({
  doesSortOnThisCol,
  header,
  isSortedAscending,
  onClick,
}: Props): JSX.Element => {
  const { align, key, text, tooltip } = header;

  let tooltipTitle = "";

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
      <SortArrowUpIcon />
    ) : (
      <SortArrowDownIcon />
    );
  }

  return (
    <StyledTableHeader
      align={align}
      data-test-id="header-cell"
      onClick={onClick}
      // * Tree name column should be slightly wider than the rest to accommodate status tags
      wide={key === "name"}
    >
      <Tooltip arrow title={tooltipTitle} placement="bottom">
        <StyledHeaderCellContent>{text}</StyledHeaderCellContent>
      </Tooltip>
      {sortIndicator}
    </StyledTableHeader>
  );
};

export { TableHeader };
