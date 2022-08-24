import {
  Bars,
  Cell,
  CellContainer,
  Column,
  Container,
  Long,
  Short,
  Square,
} from "./style";

interface Props {
  numOfColumns: number;
}

const EmptyState = ({ numOfColumns }: Props): JSX.Element => {
  return (
    <Container>
      <EmptyCells numOfColumns={numOfColumns} />
    </Container>
  );
};

function EmptyCells({ numOfColumns = 0 }): JSX.Element {
  return (
    <>
      {Array.from(Array(numOfColumns)).map((_, index) => {
        return (
          <CellContainer key={index} data-test-id="loading-cell">
            {index ? <Cell /> : <FirstColumn />}
          </CellContainer>
        );
      })}
    </>
  );
}

function FirstColumn() {
  return (
    <Column>
      <Square />
      <Bars>
        <Long />
        <Short />
      </Bars>
    </Column>
  );
}

export { EmptyState };
