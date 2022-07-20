import { TextField } from "@material-ui/core";
import { DefaultMenuSelectOption, Dropdown, Icon, InputDropdown } from "czifui";
import { cloneDeep, debounce } from "lodash";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import {
  FastaResponseType,
  getUsherOptions,
  useFastaFetch,
} from "src/common/queries/trees";
import { useSelector } from "src/common/redux/hooks";
import { selectCurrentGroup } from "src/common/redux/selectors";
import { pluralize } from "src/common/utils/strUtils";
import Dialog from "src/components/Dialog";
import {
  StyledDialogTitle,
  StyledTooltip,
  Title,
  TreeNameInfoWrapper,
} from "../../../CreateNSTreeModal/style";
import { Header } from "../../../DownloadModal/style";
import { FailedSampleAlert } from "../../../FailedSampleAlert";
import {
  Content,
  FlexWrapper,
  StyledButton,
  StyledCloseIcon,
  StyledDialogContent,
  StyledFieldTitleText,
  StyledInfoIconWrapper,
  StyledInputDropdown,
  StyledList,
  StyledListItem,
  StyledSectionHeader,
  StyledSuggestionText,
  StyledSuggestionWrapper,
  StyledTextField,
  StyledWarningIcon,
} from "./style";

interface Props {
  checkedSampleIds: string[];
  failedSampleIds: string[];
  open: boolean;
  onClose: () => void;
  onLinkCreateSuccess(url: string, treeType: string): void;
}

interface DropdownOptionProps extends DefaultMenuSelectOption {
  id: number;
  description: string;
  value: string;
  priority: number;
}

interface UsherDataType {
  usher_options: DropdownOptionProps[];
}

export const SUGGESTED_MIN_SAMPLES = 50;
const getDefaultNumSamplesPerSubtree = (numSelected: number): number => {
  const DEFAULT_MULTIPLIER = 5;
  return Math.max(SUGGESTED_MIN_SAMPLES, numSelected * DEFAULT_MULTIPLIER);
};

export const UsherPlacementModal = ({
  failedSampleIds,
  checkedSampleIds,
  onClose,
  onLinkCreateSuccess,
  open,
}: Props): JSX.Element => {
  const [dropdownLabel, setDropdownLabel] = useState<string>("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptionProps[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUsherDisabled, setUsherDisabled] = useState<boolean>(false);
  const [shouldShowWarning, setShouldShowWarning] = useState<boolean>(false);
  const [treeType, setTreeType] = useState<string>("");

  const defaultNumSamples = getDefaultNumSamplesPerSubtree(
    checkedSampleIds?.length
  );

  useEffect(() => {
    const fetchUsherOpts = async () => {
      const resp = (await getUsherOptions()) as UsherDataType;
      const apiOptions = resp.usher_options;
      const options = apiOptions.map((opt) => {
        const newOpt = cloneDeep(opt);
        newOpt.name = opt.description;
        return newOpt;
      });

      options.sort((a: DropdownOptionProps, b: DropdownOptionProps) => {
        const aPri = a?.priority ?? 0;
        const bPri = b?.priority ?? 0;
        return aPri - bPri;
      });

      setDropdownOptions(options);
    };

    fetchUsherOpts();
  }, []);

  useEffect(() => {
    const hasValidSamplesSelected =
      checkedSampleIds?.length > failedSampleIds?.length;
    const shouldDisable = !hasValidSamplesSelected || isLoading;
    setUsherDisabled(shouldDisable);
  }, [checkedSampleIds, failedSampleIds, isLoading]);

  const groupId = useSelector(selectCurrentGroup);
  const fastaFetch = useFastaFetch(groupId, {
    componentOnError: () => {
      setIsLoading(false);
      onClose();
    },
    componentOnSuccess: (data: FastaResponseType) => {
      const url = data?.url;
      if (url) onLinkCreateSuccess(data.url, treeType);
      setIsLoading(false);
    },
  });

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    const sampleIdsToSubmit = checkedSampleIds.filter(
      (id) => !failedSampleIds.includes(id)
    );
    fastaFetch.mutate({
      sampleIds: sampleIdsToSubmit,
      downstreamConsumer: "USHER", // Let backend know eventual destination for this fasta
    });
    setIsLoading(true);
  };

  const MAIN_USHER_TOOLTIP_TEXT = (
    <div>
      UShER is a third-party tool and has its own policies.{" "}
      <NewTabLink href="https://genome.ucsc.edu/cgi-bin/hgPhyloPlace">
        Learn more about UShER.
      </NewTabLink>
    </div>
  );

  const PHYLOGENETIC_TREE_VERSION_TOOLTIP_TEXT = (
    <div>
      Phylogenetic trees are updated daily by UShER.{" "}
      <NewTabLink href="https://pubmed.ncbi.nlm.nih.gov/34469548">
        Learn more.
      </NewTabLink>
    </div>
  );

  const SAMPLES_PER_SUBTREE_TOOLTIP_TEXT = (
    <div>
      We recommend setting this number to at least 5x the number of selected
      samples, and no less than 50.
    </div>
  );

  const onOptionChange = (opt: DefaultMenuSelectOption | null): void => {
    if (!opt) {
      setDropdownLabel("");
      setTreeType("");
      return;
    }

    const { name, value } = opt as DropdownOptionProps;

    setDropdownLabel(name);
    setTreeType(value);
  };

  const ONE_SECOND = 1000;
  const onNumSamplesChange = debounce(
    (e) => {
      const numSamples = e?.target?.value;
      const showWarning = !numSamples || numSamples < SUGGESTED_MIN_SAMPLES;
      setShouldShowWarning(showWarning);
    },
    ONE_SECOND,
    { maxWait: ONE_SECOND }
  );

  return (
    <Dialog
      disableBackdropClick
      disableEnforceFocus
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={"sm"}
    >
      <StyledDialogTitle>
        <StyledCloseIcon onClick={onClose} />
        <FlexWrapper>
          <Header>Run Phylogenetic Placement with UShER</Header>
          <StyledTooltip
            arrow
            leaveDelay={200}
            title={MAIN_USHER_TOOLTIP_TEXT}
            placement="top"
          >
            <StyledInfoIconWrapper>
              <Icon sdsIcon="infoCircle" sdsSize="s" sdsType="interactive" />
            </StyledInfoIconWrapper>
          </StyledTooltip>
        </FlexWrapper>
        <Title>
          {checkedSampleIds.length}{" "}
          {pluralize("Sample", checkedSampleIds.length)} Selected
        </Title>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Content data-test-id="modal-content">
          <form onSubmit={handleSubmit}>
            <div>
              <TreeNameInfoWrapper>
                <StyledSectionHeader>Use UShER for: </StyledSectionHeader>
              </TreeNameInfoWrapper>
              <StyledList>
                <StyledListItem>
                  Finding complete genome sequences from public repositories
                  that are most genetically-similar to your selected samples.
                </StyledListItem>
                <StyledListItem>
                  Placing your samples onto subtrees with closely-related public
                  sequences.
                </StyledListItem>
                <StyledListItem>
                  Ultrafast runtimes with comparable accuracy to Nextstrain for
                  inferring relationships between samples.
                </StyledListItem>
                <StyledListItem>
                  <div>
                    Note: To see all of your samples together on one tree with
                    closely-related contextual sequences, or to enable more
                    Nextstrain visualization features, use the Nextstrain tree
                    build option.{" "}
                    <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees">
                      Learn more.
                    </NewTabLink>
                  </div>
                </StyledListItem>
              </StyledList>
              <StyledSectionHeader>Settings</StyledSectionHeader>
              <StyledFieldTitleText>
                <span>Place Samples onto Phylogenetic Tree Version:</span>
                <StyledTooltip
                  arrow
                  leaveDelay={200}
                  title={PHYLOGENETIC_TREE_VERSION_TOOLTIP_TEXT}
                  placement="top"
                >
                  <StyledInfoIconWrapper>
                    <Icon
                      sdsIcon="infoCircle"
                      sdsSize="xs"
                      sdsType="interactive"
                    />
                  </StyledInfoIconWrapper>
                </StyledTooltip>
              </StyledFieldTitleText>
              <Dropdown
                label={dropdownLabel}
                onChange={onOptionChange}
                InputDropdownComponent={
                  StyledInputDropdown as typeof InputDropdown
                }
                InputDropdownProps={{ sdsStyle: "square" }}
                options={dropdownOptions}
              />
              <StyledFieldTitleText>
                <span>
                  Number of samples per subtree showing sample placement:
                </span>
                <StyledTooltip
                  arrow
                  title={SAMPLES_PER_SUBTREE_TOOLTIP_TEXT}
                  placement="top"
                >
                  <StyledInfoIconWrapper>
                    <Icon
                      sdsIcon="infoCircle"
                      sdsSize="xs"
                      sdsType="interactive"
                    />
                  </StyledInfoIconWrapper>
                </StyledTooltip>
              </StyledFieldTitleText>
              <StyledTextField>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  defaultValue={defaultNumSamples}
                  onChange={onNumSamplesChange}
                />
                {shouldShowWarning && (
                  <StyledSuggestionWrapper>
                    <StyledWarningIcon />
                    <StyledSuggestionText>
                      We recommend a value no lower than 50.
                    </StyledSuggestionText>
                  </StyledSuggestionWrapper>
                )}
              </StyledTextField>
              <FailedSampleAlert numFailedSamples={failedSampleIds?.length} />
            </div>
            <StyledButton
              sdsType="primary"
              sdsStyle="rounded"
              disabled={isUsherDisabled}
              type="submit"
              value="Submit"
            >
              {isLoading ? "Loading ..." : "Create Placement"}
            </StyledButton>
          </form>
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
