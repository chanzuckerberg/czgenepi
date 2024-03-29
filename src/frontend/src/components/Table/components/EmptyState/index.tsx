import {
  Bars,
  Cell,
  CellContainer,
  Column,
  Container,
  Long,
  Short,
  Square,
  Wrapper,
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

function EmptyTable({ numOfColumns }: Props): JSX.Element {
  return (
    <>
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <Wrapper key={i}>
            <EmptyState numOfColumns={numOfColumns} />
          </Wrapper>
        ))}
    </>
  );
}

export { EmptyTable };
