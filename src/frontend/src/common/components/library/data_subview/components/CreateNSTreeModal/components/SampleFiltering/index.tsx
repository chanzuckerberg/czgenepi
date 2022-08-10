import { PopperProps } from "@material-ui/core";
import { FilterOptionsState } from "@material-ui/lab";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { DefaultMenuSelectOption, Icon } from "czifui";
import { isEqual } from "lodash";
import React from "react";
import { noop } from "src/common/constants/empty";
import {
  MENU_OPTIONS_COLLECTION_DATE,
  MENU_OPTION_ALL_TIME,
} from "src/components/DateFilterMenu/constants";
import { StyledTooltip } from "../../style";
import { CollectionDateFilter } from "./components/CollectionDateFilter";
import {
  StyledContainer,
  StyledDropdown,
  StyledDropdownPopper,
  StyledExplainerTitle,
  StyledFilterGroup,
  StyledFilterGroupName,
  StyledFiltersSection,
  StyledInfoIconWrapper,
  StyledNewTabLink,
} from "./style";

interface Props {
  availableLineages: string[];
  selectedLineages: string[];
  setSelectedLineages: (lineages: string[]) => void;
  startDate: FormattedDateType;
  endDate: FormattedDateType;
  setStartDate(d: FormattedDateType): void;
  setEndDate(d: FormattedDateType): void;
}

// We present a pseudo-option to the user to enable choosing "All" lineages,
// but internally this means no lineages were chosen to filter down to.
const ALL_LINEAGES_KEYWORD = "All";

function makeDropdownOption(name: string): DefaultMenuSelectOption {
  return { name: name };
}
// Generate only once because we need to reference same object throughout.
const ALL_LINEAGES_CHOICE = makeDropdownOption(ALL_LINEAGES_KEYWORD);

/**
 * `Dropdown` defaults to checking if option is selected (`value`) by equality.
 * However, because we dynamically generate our option objects as selection
 * changes, object equality won't work because they're not the same object,
 * even if same content. Instead, we create a custom selection checker to
 * compare underlying data and pass that to `Dropdown` component.
 */
const getOptionSelected = (
  option: DefaultMenuSelectOption,
  value: DefaultMenuSelectOption
) => {
  return option.name === value.name;
};
/**
 * The lineages Dropdown has a couple special requirements for filtering when
 * user searches with the Dropdown open.
 * - "All" option must always be present and always comes first.
 * - If we allow all of the possible options to match, the Dropdown slows to
 *   a crawl because it's rendering 1000+ options at once. We could fix with
 *   virtualizing, but we can also just limit to showing first 100 results.
 */
function filterLineageOptions(
  options: DefaultMenuSelectOption[],
  state: FilterOptionsState<DefaultMenuSelectOption>
): DefaultMenuSelectOption[] {
  // MUI has a nice set of defaults for its Autocomplete filter, we use those
  const baseFilter = createFilterOptions<DefaultMenuSelectOption>();
  const baseFilteredResults = baseFilter(options, state);
  // We conditionally add the "All" choice if not already in results.
  let addlPrependResults: DefaultMenuSelectOption[] = [];
  if (!baseFilteredResults.includes(ALL_LINEAGES_CHOICE)) {
    addlPrependResults = [ALL_LINEAGES_CHOICE];
  }
  // Cap the actual search results returned to keep render speed sane.
  return [...addlPrependResults, ...baseFilteredResults.slice(0, 99)];
}
// `Dropdown` doesn't directly handle above, it's done by its child MenuSelect
const lineageMenuSelectProps = {
  getOptionSelected,
  filterOptions: filterLineageOptions,
};

// Label of lineages dropdown varies based on number lineages selected.
function getLineageDropdownLabel(selectedLineages: string[]): string {
  const count = selectedLineages.length;
  return count ? `${count} Selected` : ALL_LINEAGES_KEYWORD;
}

// For lineages dropdown, "All" is shown as chosen when user has selected
// no lineages to filter down to yet. (`value` here means chosen options)
function getLineageDropdownValue(
  selectedLineages: string[]
): DefaultMenuSelectOption[] {
  // Default to case of empty selection. Swap out if there is real selection.
  let selectedLineagesOptions = [ALL_LINEAGES_CHOICE];
  if (selectedLineages.length > 0) {
    selectedLineagesOptions = selectedLineages.map(makeDropdownOption);
  }
  return selectedLineagesOptions;
}

/**
 * Creates `options` for lineages Dropdown to display as choices.
 *
 * This handles a few things. First, the Dropdown component expects the options
 * to come in a certain format, so this converts the internal lineage arrays
 * into something Dropdown can display. Second, it handles moving up selected
 * lineages to the top of the list to be displayed above unchosen lineages.
 * Third, it ensures that the "All" choice -- reset back to having no selected
 * lineages -- is always available and at the top of the list.
 *
 * Notes:
 * - Could be optimized for speed somewhat, everything is just based around
 *   arrays and `includes` calls, but seems fast enough that trying a different
 *   approach (eg, using `Set`, etc) doesn't seem worth it.
 * - This depends on the original sorting of overall `availableLineages`. We
 *   maintain that ordering for how the `selectedLineages` are presented at
 *   top as well: those are displayed /not/ by user selection order, but rather
 *   by maintaining the same order they were in original `availableLineages`.
 */
function generateLineageDropdownOptions(
  selectedLineages: string[],
  availableLineages: string[]
): DefaultMenuSelectOption[] {
  const sortedSelection = availableLineages
    .filter((lineage) => selectedLineages.includes(lineage))
    .sort();
  const remainingAvailable = availableLineages
    .filter((lineage) => !selectedLineages.includes(lineage))
    .sort();
  return [
    ALL_LINEAGES_CHOICE,
    ...sortedSelection.map(makeDropdownOption),
    ...remainingAvailable.map(makeDropdownOption),
  ];
}

const SAMPLE_FILTERING_TOOLTIP_TEXT = (
  <div>
    Samples already selected on the sample table or included by ID in the box
    below will still be force-included on your tree.{" "}
    <StyledNewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit#heading=h.lmtbntly6tx9">
      Learn More
    </StyledNewTabLink>
  </div>
);

// Styling for the InputDropdown child of general Dropdown component
const InputDropdownProps = {
  sdsStage: "userInput",
  sdsStyle: "square",
} as const;

// DropdownPopper (for use with Dropdown's PopperComponent prop) needs to
// have a `placement` prop to set where it anchors against Dropdown opener.
const BottomPlacementDropdownPopper = (props: PopperProps) => {
  return <StyledDropdownPopper placement="bottom-start" {...props} />;
};

/**
 * Provides filtering of samples that are automatically added to trees.
 *
 * For tree creation, the user can select samples to create a tree. But that
 * only makes up some of the samples that go into the tree: others are chosen
 * automatically through the tree building process and added. These filters
 * are intended to restrict that second category of samples: those chosen
 * automatically by downstream tree creation. These filters have no impact on
 * the samples explicitly chosen by the user.
 *
 * NOTE about lineages:
 * While all references to "lineage" are generic, currently we are assuming the
 * use of only one kind of lineage: Pango lineages. Using the generic term is
 * mostly for ease, but we might need to approach breaking out by type if we
 * start to support others eventually (like WHO greek letters, etc).
 */
export function SampleFiltering({
  availableLineages,
  selectedLineages,
  setSelectedLineages,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props): JSX.Element {
  const lineageDropdownOptions = generateLineageDropdownOptions(
    selectedLineages,
    availableLineages
  );
  const lineageDropdownLabel = getLineageDropdownLabel(selectedLineages);
  const lineageDropdownValue = getLineageDropdownValue(selectedLineages);

  /**
   * Handles setting selected lineages from user's lineage Dropdown choices.
   *
   * Depending on if user had started with the "All" choice selected -- that
   * is, if no lineages had been chosen to filter to; the "All" choice can
   * both be explicitly selected by the user or implicitly selected b/c no
   * actual lineages are chosen -- emitted result changes. If "All" is selected
   * when Dropdown is opened, we ignore that option choice in preference of the
   * newly selected lineages. On the other hand, if "All" is not selected when
   * Dropdown is opened (b/c lineages are chosen), we ignore any other lineages
   * that get chosen if "All" is also chosen, instead preferring to reset the
   * lineage filter back to allowing all lineages.
   *
   * HACK (Vince):
   * I don't particularly like my implementation, but it's the best I could
   * come up with over a few hours of work and thinking about it. Because "All"
   * is not really a choice, but rather a pseudo-choice that means no lineages
   * are selected or that the lineage filter should be reset, we get into some
   * weird places. The Dropdown component expects every option to just be an
   * object that is either selected or not selected. But b/c of the above, the
   * options now have side-effects: choosing a lineage removes "All" from being
   * selected, or choosing "All" can reset and de-select all the other options.
   * So in addition to needing to handle this side-effect logic, we also have
   * to avoid infinite render loops due to the side-effect setting a new
   * `selectedLineages` upstream, which then goes down into the Dropdown, which
   * then kicks off the onChange (b/c it's controlled), which can then trigger
   * another new side-effect handling and spiral into an infinite loop...
   *
   * If this winds up being refactored into something better, that would be
   * great, but make sure to test your work pretty aggressively if you do that
   * refactor -- the above interactions cause a lot of edge cases.
   */
  function handleLineageDropdownChange(
    newSelectedOptions: DefaultMenuSelectOption[] | null
  ): void {
    // No selection at all means empty all lineage choices.
    // (Vince) Poked around: I don't think Dropdown emits this in our case?
    // But interface for the component says it's there, so defensive code here.
    if (newSelectedOptions === null) {
      setSelectedLineages([]);
      return;
    }

    const newSelectedLineages = newSelectedOptions.map((option) => option.name);
    // What we actually emit as selection does not always match user selected.
    let emittedSelection: string[];

    // When beginning selection process, had nothing selected / "All" selected
    if (selectedLineages.length === 0) {
      // Only value "chosen" was All so this is a no-op
      if (isEqual(newSelectedLineages, [ALL_LINEAGES_KEYWORD])) {
        return; // short-circuit to avoid infinite render loop
      }
      if (newSelectedLineages.length === 0) {
        // Mild HACK -- this means no choices, so effectively "All". Would
        // want a no-op, BUT if we do nothing the internal Dropdown state
        // drifts and "All" is visually deselected. So we emit a selection
        // to force refresh the internal state and keep visuals good.
        emittedSelection = [];
      } else {
        // Made a meaningful choice, so need to drop "All"
        emittedSelection = newSelectedLineages.filter(
          (lineage) => lineage !== ALL_LINEAGES_KEYWORD
        );
      }
    } else {
      // When beginning selection process, had actual lineages chosen
      // Opened and closed dropdown, but didn't change selection, so a no-op
      if (isEqual(newSelectedLineages, selectedLineages)) {
        return; // short-circuit to avoid infinite render loop
      } else if (newSelectedLineages.includes(ALL_LINEAGES_KEYWORD)) {
        // User chose "All" option, so we reset selection.
        // Verified with Design that this is intention, even when user had also
        // chosen additional real lineages along with "All" choice. "All" wins!
        emittedSelection = [];
      } else {
        // User did not choose "All", made new choices
        emittedSelection = newSelectedLineages;
      }
    }

    setSelectedLineages(emittedSelection);
  }

  return (
    <StyledContainer>
      <StyledExplainerTitle>
        Limit samples from my jurisdiction to:
        <StyledTooltip
          arrow
          leaveDelay={1000}
          title={SAMPLE_FILTERING_TOOLTIP_TEXT}
          placement="top"
        >
          <StyledInfoIconWrapper>
            <Icon sdsIcon="infoCircle" sdsSize="xs" sdsType="static" />
          </StyledInfoIconWrapper>
        </StyledTooltip>
      </StyledExplainerTitle>

      <StyledFiltersSection>
        <StyledFilterGroup>
          <StyledFilterGroupName>Lineage</StyledFilterGroupName>
          <StyledDropdown
            label={lineageDropdownLabel}
            onChange={handleLineageDropdownChange}
            options={lineageDropdownOptions}
            value={lineageDropdownValue}
            multiple
            search
            MenuSelectProps={lineageMenuSelectProps}
            InputDropdownProps={InputDropdownProps}
            PopperComponent={BottomPlacementDropdownPopper}
          />
        </StyledFilterGroup>
        <StyledFilterGroup>
          <StyledFilterGroupName>Collection Date</StyledFilterGroupName>
          <CollectionDateFilter
            fieldKeyEnd="collectionDateEnd"
            fieldKeyStart="collectionDateStart"
            updateDateFilter={noop}
            menuOptions={[
              ...MENU_OPTIONS_COLLECTION_DATE,
              MENU_OPTION_ALL_TIME,
            ]}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </StyledFilterGroup>
      </StyledFiltersSection>
    </StyledContainer>
  );
}
