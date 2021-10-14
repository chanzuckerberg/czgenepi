import { Dialog } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Dropdown } from "czifui";
import { debounce, forEach } from "lodash";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { getFastaURL, getUsherOptions } from "src/common/queries/trees";
import { pluralize } from "src/common/utils/strUtils";
import {
  Content,
  StyledDialogContent,
  StyledDialogTitle,
  StyledInfoOutlinedIcon,
  StyledTooltip,
  Title,
  TreeNameInfoWrapper,
  TreeNameSection,
} from "../CreateNSTreeModal/style";
import { Header, StyledIconButton } from "../DownloadModal/style";
import { FailedSampleAlert } from "../FailedSampleAlert";
import {
  FieldTitle,
  FieldTitleSettings,
  FlexWrapper,
  StyledButton,
  StyledInputDropdown,
  StyledList,
  StyledListItem,
  StyledSuggestionText,
  StyledTextField,
  StyledWarningIcon,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: string[];
  open: boolean;
  onClose: () => void;
  setUsherFastaUrl(): string;
}
interface DropdownOptionProps {
  id: number;
  description: string;
  name?: string;
  value: string;
  priority: number;
}

export const SUGGESTED_MIN_SAMPLES = 50;
const getDefaultNumSamplesPerSubtree = (numSelected: number): number => {
  const DEFAULT_MULTIPLIER = 5;
  return Math.max(SUGGESTED_MIN_SAMPLES, numSelected * DEFAULT_MULTIPLIER);
};

export const UsherPlacementModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
  setUsherFastaUrl,
}: Props): JSX.Element => {
  const [dropdownLabel, setDropdownLabel] = useState<string>("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptionProps[]>(
    []
  );
  const [isUsherDisabled, setUsherDisabled] = useState<boolean>(false);
  const [shouldShowWarning, setShouldShowWarning] = useState<boolean>(false);

  const defaultNumSamples = getDefaultNumSamplesPerSubtree(sampleIds?.length);

  useEffect(() => {
    const fetchUsherOpts = async () => {
      const resp = await getUsherOptions();
      const options = resp.usher_options;
      forEach(options, (opt) => (opt.name = opt.description));

      options.sort((a, b) => {
        const aPri = a?.priority ?? 0;
        const bPri = b?.priority ?? 0;
        return aPri - bPri;
      });

      setDropdownOptions(options);
    };

    fetchUsherOpts();
  }, []);

  const mutation = useMutation(getFastaURL, {
    onError: (err) => {
      onClose();
    },
    onSuccess: (data) => {
      setUsherFastaUrl(data.url);
      onClose();
    },
  });

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    sampleIds = sampleIds.filter((id) => !failedSamples.includes(id));
    mutation.mutate({ sampleIds });
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

  const onOptionChange = (opt: DropdownOptionProps) => {
    setDropdownLabel(opt?.name);
  };

  const onNumSamplesChange = debounce(
    (e) => {
      const numSamples = e?.target?.value;
      const showWarning = !numSamples || numSamples < SUGGESTED_MIN_SAMPLES;
      setShouldShowWarning(showWarning);
    },
    1000,
    { maxWait: 1000 }
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
        <StyledIconButton onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
        <FlexWrapper>
          <Header>Run Phylogenetic Placement with UShER</Header>
          <StyledTooltip
            arrow
            leaveDelay={200}
            title={MAIN_USHER_TOOLTIP_TEXT}
            placement="top"
          >
            <StyledInfoOutlinedIcon />
          </StyledTooltip>
        </FlexWrapper>
        <Title>
          {sampleIds.length} {pluralize("Sample", sampleIds.length)} Selected
        </Title>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Content data-test-id="modal-content">
          <form onSubmit={handleSubmit}>
            <TreeNameSection>
              <TreeNameInfoWrapper>
                <FieldTitle>Use UShER for: </FieldTitle>
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
                    <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing">
                      Learn more.
                    </NewTabLink>
                  </div>
                </StyledListItem>
              </StyledList>
              <FieldTitle>Settings</FieldTitle>
              <FlexWrapper>
                <FieldTitleSettings>
                  Place Samples onto Phylogenetic Tree Version:
                </FieldTitleSettings>
                <StyledTooltip
                  arrow
                  leaveDelay={200}
                  title={PHYLOGENETIC_TREE_VERSION_TOOLTIP_TEXT}
                  placement="top"
                >
                  <StyledInfoOutlinedIcon />
                </StyledTooltip>
              </FlexWrapper>
              <Dropdown
                label={dropdownLabel}
                onChange={onOptionChange}
                InputDropdownComponent={StyledInputDropdown}
                InputDropdownProps={{ sdsStyle: "square" }}
                options={dropdownOptions}
              />
              <FlexWrapper>
                <FieldTitleSettings>
                  Number of samples per subtree showing sample placement:
                </FieldTitleSettings>
                <StyledTooltip
                  arrow
                  title={SAMPLES_PER_SUBTREE_TOOLTIP_TEXT}
                  placement="top"
                >
                  <StyledInfoOutlinedIcon />
                </StyledTooltip>
              </FlexWrapper>
              <StyledTextField
                id="outlined-basic"
                variant="outlined"
                defaultValue={defaultNumSamples}
                onChange={onNumSamplesChange}
                showWarning={shouldShowWarning}
              />
              {shouldShowWarning && (
                <FlexWrapper>
                  <StyledWarningIcon />
                  <StyledSuggestionText>
                    We recommend a value no lower than 50.
                  </StyledSuggestionText>
                </FlexWrapper>
              )}
              <FailedSampleAlert numFailedSamples={failedSamples?.length} />
            </TreeNameSection>
            <StyledButton
              color="primary"
              variant="contained"
              isRounded
              disabled={isUsherDisabled}
              type="submit"
              value="Submit"
            >
              Create Placement
            </StyledButton>
          </form>
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
