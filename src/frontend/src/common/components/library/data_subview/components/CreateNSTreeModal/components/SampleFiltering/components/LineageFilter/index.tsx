import { FilterOptionsState, PopperProps } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { DefaultMenuSelectOption } from "czifui";
import { isEqual } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { SplitPathogenWrapper } from "src/components/Split/SplitPathogenWrapper";
import { PATHOGEN_FEATURE_FLAGS } from "src/components/Split/types";
import {
  StyledDropdown,
  StyledDropdownPopper,
  StyledFilterGroup,
  StyledFilterGroupName,
} from "../../style";

export type LineageFilterType = {
  availableLineages: string[];
  selectedLineages: string[];
  setSelectedLineages: (lineages: string[]) => void;
};

function makeDropdownOption(name: string): DefaultMenuSelectOption {
  return { name: name };
}

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

  // Cap the actual search results returned to keep render speed sane.
  return baseFilteredResults.slice(0, 99);
}
// `Dropdown` doesn't directly handle above, it's done by its child MenuSelect.
// This prop was renamed to DropdownMenuProps
const lineageDropdownMenuProps = {
  getOptionSelected,
  filterOptions: filterLineageOptions,
};

// Label of lineages dropdown varies based on number lineages selected.
function getLineageDropdownLabel(selectedLineages: string[]): string {
  const count = selectedLineages.length;
  return count ? `${count} Selected` : "All";
}

// For lineages dropdown, "All" is shown as chosen when user has selected
// no lineages to filter down to yet. (`value` here means chosen options)
function getLineageDropdownValue(
  selectedLineages: string[]
): DefaultMenuSelectOption[] {
  // Default to case of empty selection. Swap out if there is real selection.
  let selectedLineagesOptions: DefaultMenuSelectOption[] = [];
  if (selectedLineages.length > 0) {
    selectedLineagesOptions = selectedLineages.map(makeDropdownOption);
  }
  console.log({ selectedLineages, selectedLineagesOptions });
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
    ...sortedSelection.map(makeDropdownOption),
    ...remainingAvailable.map(makeDropdownOption),
  ];
}

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
/*
 * NOTE about lineages:
 * While all references to "lineage" are generic, currently we are assuming the
 * use of only one kind of lineage: Pango lineages. Using the generic term is
 * mostly for ease, but we might need to approach breaking out by type if we
 * start to support others eventually (like WHO greek letters, etc).
 */

export function LineageFilter({
  availableLineages,
  selectedLineages,
  setSelectedLineages,
}: LineageFilterType): JSX.Element {
  const pathogen = useSelector(selectCurrentPathogen);

  const [lineageDropdownOptions, setLineageDropdownOptions] = useState(
    generateLineageDropdownOptions(selectedLineages, availableLineages)
  );

  const [lineageDropdownLabel, setLineageDropdownLabel] = useState(
    getLineageDropdownLabel(selectedLineages)
  );
  const [lineageDropdownValue, setLineageDropdownValue] = useState(
    getLineageDropdownValue(selectedLineages)
  );

  useEffect(() => {
    setLineageDropdownOptions(
      generateLineageDropdownOptions(selectedLineages, availableLineages)
    );
    setLineageDropdownLabel(getLineageDropdownLabel(selectedLineages));
    setLineageDropdownValue(getLineageDropdownValue(selectedLineages));
  }, [selectedLineages, availableLineages]);

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
    newSelectedOptions:
      | DefaultMenuSelectOption
      | DefaultMenuSelectOption[]
      | null
  ): void {
    // No selection at all means empty all lineage choices.
    // (Vince) Poked around: I don't think Dropdown emits this in our case?
    // But interface for the component says it's there, so defensive code here.
    if (newSelectedOptions === null) {
      setSelectedLineages([]);
      return;
    }

    // czifui v 7.0.0 upgrade - now newSelectOptions can be a single option
    // (at least according to typescript).
    // To keep this consistent, check for the single option and return a list
    // with jus the one option. It's unclear if this will happen when multi-
    // select is enabled.
    if (!Array.isArray(newSelectedOptions)) {
      setSelectedLineages([newSelectedOptions.name]);
      return;
    }

    const newSelectedLineages = newSelectedOptions.map(
      (option: DefaultMenuSelectOption) => option.name
    );

    // When beginning selection process, had nothing selected / "All" selected
    if (selectedLineages.length === 0 && newSelectedLineages.length === 0) {
      return;
    }
    // When beginning selection process, had actual lineages chosen
    // Opened and closed dropdown, but didn't change selection, so a no-op
    if (isEqual(newSelectedLineages, selectedLineages)) {
      return; // short-circuit to avoid infinite render loop
    }

    setSelectedLineages(newSelectedLineages);
  }

  return (
    <SplitPathogenWrapper
      pathogen={pathogen}
      feature={PATHOGEN_FEATURE_FLAGS.lineage_filter_enabled}
    >
      <StyledFilterGroup>
        <StyledFilterGroupName>Lineage</StyledFilterGroupName>
        <StyledDropdown
          label={lineageDropdownLabel}
          onChange={handleLineageDropdownChange}
          options={lineageDropdownOptions}
          value={lineageDropdownValue}
          multiple
          search
          DropdownMenuProps={lineageDropdownMenuProps}
          InputDropdownProps={InputDropdownProps}
          PopperComponent={BottomPlacementDropdownPopper}
          data-test-id="lineage-dropdown"
        />
      </StyledFilterGroup>
    </SplitPathogenWrapper>
  );
}
