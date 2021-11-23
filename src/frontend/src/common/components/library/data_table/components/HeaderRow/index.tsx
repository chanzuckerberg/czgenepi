import { isEqual } from "lodash";
import React from "react";
import { TableHeader } from "./components/TableHeader";
import { HeaderCheckbox, StyledHeaderRow } from "./style";

interface Props {
  handleHeaderCheckboxClick(): void;
  handleSortClick(key: string): void;
  headers: Header[];
  isHeaderChecked: boolean;
  isHeaderIndeterminant: boolean;
  isSortedAscending: boolean;
  shouldShowCheckboxes: boolean;
  sortColKey: string;
}

const HeaderRow = ({
  handleHeaderCheckboxClick,
  handleSortClick,
  headers,
  isHeaderChecked,
  isHeaderIndeterminant,
  isSortedAscending,
  shouldShowCheckboxes,
  sortColKey,
}: Props): JSX.Element => (
  <StyledHeaderRow
    data-test-id="header-row"
    shouldShowCheckboxes={shouldShowCheckboxes}
  >
    {shouldShowCheckboxes && (
      <HeaderCheckbox
        checked={isHeaderChecked}
        onClick={handleHeaderCheckboxClick}
        stage={
          isHeaderIndeterminant
            ? "indeterminate"
            : isHeaderChecked
            ? "checked"
            : "unchecked"
        }
      />
    )}
    {headers.map((header: Header) => {
      const { sortKey } = header;

      return (
        <TableHeader
          header={header}
          key={sortKey.join("-")}
          onClick={() => handleSortClick(sortKey)}
          doesSortOnThisCol={isEqual(sortKey, sortColKey)}
          isSortedAscending={isSortedAscending}
        />
      );
    })}
  </StyledHeaderRow>
);

export { HeaderRow };
