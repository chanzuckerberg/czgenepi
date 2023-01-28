import { ReactNode } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Row } from "./components/Row";
import { Container, DataRows } from "./style";

const ITEM_HEIGHT_PX = 68;

interface Props {
  headers: ReactNode[];
  rows: ReactNode[][];
}

// * This is an old table component, please do not use it.
// * Prefer to use src/frontend/src/components/Table/index.tsx.

const Table = ({ headers, rows }: Props): JSX.Element => (
  <Container>
    <Row cells={headers} isHeader />
    <DataRows>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <FixedSizeList
              height={height}
              itemCount={rows.length}
              itemSize={ITEM_HEIGHT_PX}
              width={width}
            >
              {({ index, style }) => <Row cells={rows[index]} style={style} />}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </DataRows>
  </Container>
);

export { Table };
