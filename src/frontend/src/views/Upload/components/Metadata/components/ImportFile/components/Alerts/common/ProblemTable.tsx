import {
  CappedHeightScrollableContainer,
  FullWidthContainer,
  Table,
  TbodyZebra,
  Td,
  Th,
} from "./style";

interface Props {
  tablePreamble?: React.ReactNode | string;
  columnHeaders: string[];
  rows: string[][];
}

/**
 * Very simple table that uses zebra-striped rows to display info.
 *
 * Displays column headers at top of table with each row beneath.
 * Assumes that the order of column headers and each row inside of `rows`
 * is matched already. There is no extraction based on object keys or anything,
 * it's just a simple table for when we don't need a complex data view.
 *
 * Currently just intended for use in Metadata warnings and errors because
 * all those components -- when showing issues via a table -- share this
 * design for the expanded message showing everything going wrong.
 * If we continue to use this design elsewhere in the app, we should extract this
 * component to somewhere higher up in app and share it around generally.
 * The capped height aspect might be a difficulty for generalizing though.
 *
 * IMPORTANT NOTE:
 * Every row array in the `rows` array-of-arrays should be the **same length**
 * and that length should also be the same as the `columnHeaders` length.
 * There is no safety checking around this, it's up to you to enforce it in
 * parent when this data gets prepped. Technically, the component will render
 * and won't error out, but it will look very ugly and be obviously wrong.
 *
 * NOTE on React keys and uniqueness in entries:
 * Because this uses `.map` internally, React is expecting unique `key` usage.
 * It's assumed that the **first entry of each row** is unique. Similarly,
 * within a row, each entry should be unique and each column header should be
 * unique as well. For its current usage, this will always be true.
 */
export function ProblemTable({
  tablePreamble,
  columnHeaders,
  rows,
}: Props): JSX.Element {
  return (
    <FullWidthContainer>
      {tablePreamble || null}
      <CappedHeightScrollableContainer>
        <Table>
          <thead>
            <tr>
              {columnHeaders.map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </tr>
          </thead>
          <TbodyZebra>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((entry) => (
                  <Td key={entry}>{entry}</Td>
                ))}
              </tr>
            ))}
          </TbodyZebra>
        </Table>
      </CappedHeightScrollableContainer>
    </FullWidthContainer>
  );
}
