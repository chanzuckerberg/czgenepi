import React from "react";
import { Table } from "semantic-ui-react";
import style from "./index.module.scss";

const DEFAULT_ROW_COUNT = 10;

interface Props {
  numOfColumns: number;
}

const EmptyState = ({ numOfColumns }: Props): JSX.Element => {
  return (
    <>
      {Array.from(Array(DEFAULT_ROW_COUNT)).map((_, index) => (
        <Table.Row key={index}>
          <EmptyCells numOfColumns={numOfColumns} />
        </Table.Row>
      ))}
    </>
  );
};

function EmptyCells({ numOfColumns = 0 }): JSX.Element {
  return (
    <>
      {Array.from(Array(numOfColumns)).map((_, index) => {
        return (
          <Table.Cell key={index}>
            {index ? <div className={style.cell} /> : <FirstColumn />}
          </Table.Cell>
        );
      })}
    </>
  );
}

function FirstColumn() {
  return (
    <div className={style.firstColumn}>
      <div className={style.square} />
      <div className={style.bars}>
        <div className={style.long} />
        <div className={style.short} />
      </div>
    </div>
  );
}

export { EmptyState };
