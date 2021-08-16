import { Tooltip } from "czifui";
import { escapeRegExp } from "lodash/fp";
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Input } from "semantic-ui-react";
import { DataTable } from "src/common/components";
import { VIEWNAME } from "src/common/constants/types";
import { IconButtonBubble } from "src/common/styles/support/style";
import DownloadModal from "./components/DownloadModal";
import style from "./index.module.scss";
import {
  BoldText,
  DismissButton,
  Divider,
  DownloadWrapper,
  StyledAlert,
  StyledChip,
  StyledDiv,
  StyledDownloadDisabledImage,
  StyledDownloadImage,
  StyledFlexChildDiv,
  StyledLink,
  StyledSpan,
  TooltipDescriptionText,
  TooltipHeaderText,
  StyledTreeBuildImage,
  StyledTreeBuildDisabledImage,
} from "./style";

interface Props {
  data?: TableItem[];
  defaultSortKey: string[];
  headers: Header[];
  subheaders: Record<string, SubHeader[]>;
  isLoading: boolean;
  renderer?: CustomRenderer;
  headerRenderer?: CustomRenderer;
  viewName: VIEWNAME;
}

interface InputOnChangeData {
  [key: string]: string;
  value: string;
}

interface SearchState {
  searching?: boolean;
  results?: TableItem[];
}

function recursiveTest(
  item: Record<string | number, JSONPrimitive | Record<string, JSONPrimitive>>,
  query: RegExp
): boolean {
  return Object.values(item).some((value) => {
    if (typeof value === "object" && value !== null) {
      return recursiveTest(value, query);
    }
    return query.test(`${value}`);
  });
}

function searchReducer(state: SearchState, action: SearchState): SearchState {
  return { ...state, ...action };
}

function tsvDataMap(
  checkedSamples: string[],
  tableData: TableItem[] | undefined,
  headers: Header[],
  subheaders: Record<string, SubHeader[]>
): [string[], string[][]] | undefined {
  const headersDownload = [...headers];
  headersDownload[7] = {
    key: "CZBFailedGenomeRecovery",
    sortKey: ["CZBFailedGenomeRecovery"],
    text: "Genome Recovery",
  };
  if (tableData) {
    const filteredTableData = [...tableData];
    const filteredTableDataForReals = filteredTableData.filter((entry) =>
      checkedSamples.includes(String(entry["publicId"]))
    );
    const tsvData = filteredTableDataForReals.map((entry) => {
      return headersDownload.flatMap((header) => {
        if (
          typeof entry[header.key] === "object" &&
          Object.prototype.hasOwnProperty.call(subheaders, header.key)
        ) {
          const subEntry = entry[header.key] as Record<string, JSONPrimitive>;
          return subheaders[header.key].map((subheader) =>
            String(subEntry[subheader.key])
          );
        }
        if (header.key == "CZBFailedGenomeRecovery") {
          if (entry[header.key]) {
            return "Failed";
          } else {
            return "Success";
          }
        } else {
          return String(entry[header.key]);
        }
      });
    });
    const tsvHeaders = headersDownload.flatMap((header) => {
      if (Object.prototype.hasOwnProperty.call(subheaders, header.key)) {
        return subheaders[header.key].map((subheader) => subheader.text);
      }
      return header.text;
    });

    return [tsvHeaders, tsvData];
  }
}

const DataSubview: FunctionComponent<Props> = ({
  data,
  defaultSortKey,
  headers,
  subheaders,
  isLoading,
  renderer,
  headerRenderer,
  viewName,
}: Props) => {
  // we are modifying state using hooks, so we need a reducer
  const [state, dispatch] = useReducer(searchReducer, {
    results: data,
    searching: false,
  });

  const [checkedSamples, setCheckedSamples] = useState<any[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [isDownloadDisabled, setDownloadDisabled] = useState<boolean>(true);
  const [failedSamples, setFailedSamples] = useState<any[]>([]);
  const [downloadFailed, setDownloadFailed] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isFastaDisabled, setFastaDisabled] = useState<boolean>(false);

  const handleDownloadClickOpen = () => {
    setOpen(true);
  };

  const handleDownloadClose = () => {
    setOpen(false);
    setMetadataSelected(false);
    setFastaSelected(false);
  };

  useEffect(() => {
    // Only show checkboxes on the sample datatable
    if (viewName === VIEWNAME.SAMPLES) {
      setShowCheckboxes(true);
    }
  }, [viewName]);

  useEffect(() => {
    // disable sample download if no samples are selected
    if (checkedSamples.length === 0) {
      setDownloadDisabled(true);
    } else {
      setDownloadDisabled(false);
    }
  }, [checkedSamples]);

  useEffect(() => {
    // if there is an error then close the modal.
    if (downloadFailed) {
      setOpen(false);
    }
  }, [downloadFailed]);

  function handleDismissErrorClick() {
    setDownloadFailed(false);
  }

  // search functions
  const searcher = (
    _event: React.ChangeEvent<HTMLInputElement>,
    fieldInput: InputOnChangeData
  ) => {
    const query = fieldInput.value;
    if (data === undefined) {
      return;
    } else if (query.length === 0) {
      dispatch({ results: data });
      return;
    }

    dispatch({ searching: true });

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredData = data.filter((item) => recursiveTest(item, regex));
    dispatch({ results: filteredData, searching: false });
  };

  const DOWNLOAD_TOOLTIP_TEXT_DISABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
      <TooltipDescriptionText>Select at least 1 sample</TooltipDescriptionText>
    </div>
  );

  const DOWNLOAD_TOOLTIP_TEXT_ENABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
    </div>
  );

  const render = (tableData?: TableItem[]) => {
    let downloadButton: JSX.Element | null = null;
    if (viewName === VIEWNAME.SAMPLES && tableData !== undefined) {
      downloadButton = (
        <DownloadWrapper>
          <StyledChip
            size="medium"
            label={checkedSamples.length}
            status="info"
          />
          <StyledDiv>Selected </StyledDiv>
          <Divider />
          <Tooltip
            arrow
            inverted
            title={
              isDownloadDisabled
                ? DOWNLOAD_TOOLTIP_TEXT_DISABLED
                : DOWNLOAD_TOOLTIP_TEXT_ENABLED
            }
            placement="top"
          >
            <StyledSpan>
            <IconButtonBubble
                onClick={handleDownloadClickOpen}
                disabled={isDownloadDisabled}
              >
                {isDownloadDisabled ? (
                  <StyledTreeBuildDisabledImage />
                ) : (
                  <StyledTreeBuildImage />
                )}
              </IconButtonBubble>
              <IconButtonBubble
                onClick={handleDownloadClickOpen}
                disabled={isDownloadDisabled}
              >
                {isDownloadDisabled ? (
                  <StyledDownloadDisabledImage />
                ) : (
                  <StyledDownloadImage />
                )}
              </IconButtonBubble>
            </StyledSpan>
          </Tooltip>
        </DownloadWrapper>
      );
    }

    return (
      <>
        {tableData !== undefined && viewName === VIEWNAME.SAMPLES && (
          <DownloadModal
            sampleIds={checkedSamples}
            failedSamples={failedSamples}
            setDownloadFailed={setDownloadFailed}
            isMetadataSelected={isMetadataSelected}
            setMetadataSelected={setMetadataSelected}
            isFastaSelected={isFastaSelected}
            setFastaSelected={setFastaSelected}
            isFastaDisabled={isFastaDisabled}
            setFastaDisabled={setFastaDisabled}
            tsvData={tsvDataMap(checkedSamples, tableData, headers, subheaders)}
            open={open}
            onClose={handleDownloadClose}
          />
        )}
        <StyledFlexChildDiv className={style.samplesRoot}>
          <div className={style.searchBar}>
            <div className={style.searchInput}>
              <Input
                icon="search"
                placeholder="Search"
                loading={state.searching}
                onChange={searcher}
                data-test-id="search"
              />
            </div>
            <div>
              {downloadFailed ? (
                <StyledAlert className="elevated" severity="error">
                  <div>
                    <BoldText>
                      Something went wrong and we were unable to complete one or
                      more of your downloads
                    </BoldText>
                    Please try again later or{" "}
                    <StyledLink
                      href="mailto:aspenprivacy@chanzuckerberg.com"
                      target="_blank"
                      rel="noopener"
                    >
                      contact us
                    </StyledLink>{" "}
                    for help.
                  </div>
                  <DismissButton onClick={handleDismissErrorClick}>
                    DISMISS
                  </DismissButton>
                </StyledAlert>
              ) : (
                downloadButton
              )}
            </div>
          </div>
          <div className={style.samplesTable}>
            <DataTable
              isLoading={isLoading}
              checkedSamples={checkedSamples}
              setCheckedSamples={setCheckedSamples}
              failedSamples={failedSamples}
              setFailedSamples={setFailedSamples}
              showCheckboxes={showCheckboxes}
              data={tableData}
              defaultSortKey={defaultSortKey}
              headers={headers}
              headerRenderer={headerRenderer}
              renderer={renderer}
            />
          </div>
        </StyledFlexChildDiv>
      </>
    );
  };

  if (!state.results) {
    let tableData;

    if (data) {
      dispatch({ results: data });
      tableData = data;
    }

    return render(tableData);
  }

  return render(state.results);
};

export { DataSubview };
