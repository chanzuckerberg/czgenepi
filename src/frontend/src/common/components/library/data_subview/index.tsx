import { Fade } from "@material-ui/core";
import { escapeRegExp } from "lodash/fp";
import NextLink from "next/link";
import React, {
  FunctionComponent,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Input } from "semantic-ui-react";
import { DataTable } from "src/common/components";
import { VIEWNAME } from "src/common/constants/types";
import { ROUTES } from "src/common/routes";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { AfterModalAlert } from "./components/AfterModalAlert";
import { CreateNSTreeModal } from "./components/CreateNSTreeModal";
import DownloadModal from "./components/DownloadModal";
import { IconButton } from "./components/IconButton";
import { TreeCreateHelpLink } from "./components/TreeCreateHelpLink";
import { TreeSelectionMenu } from "./components/TreeSelectionMenu";
import { UsherTreeFlow } from "./components/UsherTreeFlow";
import style from "./index.module.scss";
import {
  CreateTreeModalDiv,
  Divider,
  DownloadWrapper,
  StyledButton,
  StyledChip,
  StyledDiv,
  StyledDownloadDisabledImage,
  StyledDownloadImage,
  StyledFlexChildDiv,
  StyledNewTabLink,
  TooltipDescriptionText,
  TooltipHeaderText,
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
  dataFilterFunc?: (data: TableItem[]) => TableItem[];
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
  dataFilterFunc,
}: Props) => {
  // we are modifying state using hooks, so we need a reducer
  const [state, dispatch] = useReducer(searchReducer, {
    results: data,
    searching: false,
  });

  const [checkedSamples, setCheckedSamples] = useState<string[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [failedSamples, setFailedSamples] = useState<string[]>([]);
  const [downloadFailed, setDownloadFailed] = useState<boolean>(false);
  const [isNSCreateTreeModalOpen, setIsNSCreateTreeModalOpen] =
    useState<boolean>(false);
  const [hasCreateTreeStarted, setCreateTreeStarted] = useState<boolean>(false);
  const [didCreateTreeFailed, setCreateTreeFailed] = useState<boolean>(false);
  const [shouldStartUsherFlow, setShouldStartUsherFlow] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleDownloadClickOpen = () => {
    setDownloadModalOpen(true);
  };

  const handleCreateNSTreeOpen = () => {
    setIsNSCreateTreeModalOpen(true);
  };

  const handleCreateTreeClose = () => {
    setIsNSCreateTreeModalOpen(false);
  };

  const handleCreateTreeFailed = () => {
    setCreateTreeFailed(true);
  };

  const handleSetCreateTreeStarted = () => {
    setCreateTreeStarted(true);
  };

  const handleDownloadClose = () => {
    setDownloadModalOpen(false);
  };

  useEffect(() => {
    if (shouldStartUsherFlow) setShouldStartUsherFlow(false);
  }, [shouldStartUsherFlow]);

  useEffect(() => {
    searcher(searchQuery);
  }, [data]);

  useEffect(() => {
    // Only show checkboxes on the sample datatable
    if (viewName === VIEWNAME.SAMPLES) {
      setShowCheckboxes(true);
    }
  }, [viewName]);

  useEffect(() => {
    // if there is an error then close the modal.
    if (downloadFailed) {
      setDownloadModalOpen(false);
    }
  }, [downloadFailed]);

  useEffect(() => {
    if (didCreateTreeFailed) {
      setIsNSCreateTreeModalOpen(false);
    }
  }, [didCreateTreeFailed]);

  function handleDismissDownloadErrorClick() {
    setDownloadFailed(false);
  }

  function handleDismissCreateTreeErrorClick() {
    setCreateTreeFailed(false);
  }

  function handleCreateTreeStartedModalClose() {
    setCreateTreeStarted(false);
  }

  useEffect(() => {
    setTimeout(() => {
      setCreateTreeStarted(false);
    }, 12000);
  }, [hasCreateTreeStarted]);

  const onChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    fieldInput: InputOnChangeData
  ) => {
    const query = fieldInput.value;
    searcher(query);
    setSearchQuery(query);
  };

  // search functions
  const searcher = (query: string): void => {
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

  const numCheckedSamples = checkedSamples?.length;
  const hasCheckedSamples = numCheckedSamples > 0;
  const hasTooManyCheckedSamples = numCheckedSamples > 2000;
  const isTreeMenuActive =
    (hasCheckedSamples && !hasTooManyCheckedSamples) ||
    usesFeatureFlag(FEATURE_FLAGS.gisaidIngest);

  const render = (tableData?: TableItem[]) => {
    let downloadButton: JSX.Element | null = null;
    if (viewName === VIEWNAME.SAMPLES && tableData !== undefined) {
      downloadButton = (
        <DownloadWrapper>
          <StyledChip isRounded label={checkedSamples.length} status="info" />
          <StyledDiv>Selected </StyledDiv>
          <Divider />
          <TreeSelectionMenu
            handleCreateNSTreeOpen={handleCreateNSTreeOpen}
            handleCreateUsherTreeOpen={() => setShouldStartUsherFlow(true)}
            // TODO (mlila): remove isMenuDisabled when gisaidIngest feature turned on
            isMenuDisabled={!isTreeMenuActive}
            isUsherDisabled={
              usesFeatureFlag(FEATURE_FLAGS.gisaidIngest) && !hasCheckedSamples
            }
          />
          <IconButton
            onClick={handleDownloadClickOpen}
            disabled={!hasCheckedSamples}
            svgDisabled={<StyledDownloadDisabledImage />}
            svgEnabled={<StyledDownloadImage />}
            tooltipTextDisabled={DOWNLOAD_TOOLTIP_TEXT_DISABLED}
            tooltipTextEnabled={DOWNLOAD_TOOLTIP_TEXT_ENABLED}
          />
        </DownloadWrapper>
      );
    }

    return (
      <>
        {tableData !== undefined && viewName === VIEWNAME.SAMPLES && (
          <>
            <DownloadModal
              sampleIds={checkedSamples}
              failedSamples={failedSamples}
              setDownloadFailed={setDownloadFailed}
              tsvData={tsvDataMap(
                checkedSamples,
                tableData,
                headers,
                subheaders
              )}
              open={isDownloadModalOpen}
              onClose={handleDownloadClose}
            />
            <CreateNSTreeModal
              sampleIds={checkedSamples}
              failedSamples={failedSamples}
              open={isNSCreateTreeModalOpen}
              onClose={handleCreateTreeClose}
              handleCreateTreeFailed={handleCreateTreeFailed}
              handleSetCreateTreeStarted={handleSetCreateTreeStarted}
            />
            <UsherTreeFlow
              checkedSamples={checkedSamples}
              failedSamples={failedSamples}
              shouldStartUsherFlow={shouldStartUsherFlow}
            />
          </>
        )}
        <StyledFlexChildDiv className={style.samplesRoot}>
          <div className={style.searchBar}>
            <div className={style.searchInput}>
              <Input
                icon="search"
                placeholder="Search"
                loading={state.searching}
                onChange={onChange}
                data-test-id="search"
              />
            </div>
            <div>
              {viewName === VIEWNAME.TREES && <TreeCreateHelpLink />}
              {downloadButton}
              {downloadFailed && (
                <AfterModalAlert
                  alertClassName="elevated"
                  alertSeverity="error"
                  boldText={
                    "Something went wrong and we were unable to complete one or more of your downloads"
                  }
                  lightText={
                    <>
                      Please try again later or{" "}
                      <StyledNewTabLink href="mailto:aspenprivacy@chanzuckerberg.com">
                        contact us
                      </StyledNewTabLink>{" "}
                      for help.
                    </>
                  }
                  handleDismiss={handleDismissDownloadErrorClick}
                />
              )}
              {didCreateTreeFailed && (
                <AfterModalAlert
                  alertClassName="elevated"
                  alertSeverity="error"
                  boldText={
                    "Something went wrong and we were unable to start your tree build"
                  }
                  lightText={
                    <>
                      Please try again later or{" "}
                      <StyledNewTabLink href="mailto:aspenprivacy@chanzuckerberg.com">
                        contact us
                      </StyledNewTabLink>{" "}
                      for help.
                    </>
                  }
                  handleDismiss={handleDismissCreateTreeErrorClick}
                />
              )}
              <Fade
                in={hasCreateTreeStarted}
                appear={false}
                enter={false}
                timeout={1000}
                unmountOnExit={true}
              >
                <div>
                  <AfterModalAlert
                    alertClassName="elevated"
                    alertSeverity={"info"}
                    lightText={
                      <CreateTreeModalDiv>
                        Your tree is being created. It may take up to 12 hours
                        to process. To check your tree’s status, visit the
                        Phylogenetic Tree page.
                        <NextLink href={ROUTES.PHYLO_TREES} passHref>
                          <a href="passRef">
                            <StyledButton
                              color="primary"
                              onClick={handleCreateTreeStartedModalClose}
                            >
                              VIEW MY TREES
                            </StyledButton>
                          </a>
                        </NextLink>
                      </CreateTreeModalDiv>
                    }
                  />
                </div>
              </Fade>
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
              data={
                dataFilterFunc && tableData
                  ? dataFilterFunc(tableData)
                  : tableData
              }
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
