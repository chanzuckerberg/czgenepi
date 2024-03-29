import { Table as MuiTable, TableBody, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { SAMPLE_COUNT } from "../../../common/constants";
import { Samples } from "../../../common/types";
import {
  LoadingMessage,
  Overflow,
  StyledHeaderTableCell,
  StyledTableCell,
  StyledTableContainer,
  StyledTableHead,
} from "./style";

interface Props {
  samples: Samples;
}

export default function Table({ samples }: Props): JSX.Element {
  const [isReadyToRenderTable, setIsReadyToTenderTable] = useState(false);

  useEffect(() => {
    if (!samples) {
      return setIsReadyToTenderTable(true);
    }

    const timeout = setTimeout(
      () => {
        setIsReadyToTenderTable(true);
      },
      Object.keys(samples).length > SAMPLE_COUNT ? 1 * 1000 : 0
    );

    return () => clearTimeout(timeout);
  }, [samples]);

  if (!isReadyToRenderTable) {
    return (
      <Overflow>
        <LoadingMessage>Loading samples...</LoadingMessage>
      </Overflow>
    );
  }

  return (
    <Overflow>
      <StyledTableContainer>
        <MuiTable aria-label="simple table" component="div">
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore: spread types error */}
          <StyledTableHead {...({ component: "div" } as unknown)}>
            <TableRow component="div">
              <StyledHeaderTableCell component="div">
                Sample Name (from FASTA)
              </StyledHeaderTableCell>
              <StyledHeaderTableCell align="left" component="div">
                File Name
              </StyledHeaderTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody component="div">
            {Object.entries(samples).map(([key, value]) => (
              <TableRow key={key} component="div">
                <StyledTableCell
                  scope="row"
                  component="div"
                  data-test-id="sample-id"
                >
                  {key}
                </StyledTableCell>
                <StyledTableCell
                  align="left"
                  component="div"
                  data-test-id="file-name"
                >
                  {value.filename}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
    </Overflow>
  );
}
