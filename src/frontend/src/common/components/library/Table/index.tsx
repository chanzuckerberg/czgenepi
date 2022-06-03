import React, { ReactNode } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { ITEM_HEIGHT_PX } from "../data_table";
import { Row } from "./components/Row";
import { Container, DataRows } from "./style";

interface Props {
  headers: ReactNode[];
  rows: ReactNode[][];
}

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
              {({ index }) => <Row cells={rows[index]} />}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </DataRows>
  </Container>
);

export { Table };
