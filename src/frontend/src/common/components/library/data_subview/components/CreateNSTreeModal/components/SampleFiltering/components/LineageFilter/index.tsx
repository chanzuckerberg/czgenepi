import { FilterOptionsState, PopperProps } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { DefaultMenuSelectOption } from "czifui";
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
 * The lineages Dropdown has a special requirements for filtering when
 * user searches with the Dropdown open.
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
  return [...baseFilteredResults.slice(0, 99)];
}
// `Dropdown` doesn't directly handle above, it's done by its child MenuSelect.
// This prop was renamed to DropdownMenuProps
const lineageDropdownMenuProps = {
  filterOptions: filterLineageOptions,
};

// Label of lineages dropdown varies based on number lineages selected.
// If 0 lineages are selected, all lineages are used
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
  return selectedLineagesOptions;
}

/**
 * Creates `options` for lineages Dropdown to display as choices.
 *
 * This handles a few things. First, the Dropdown component expects the options
 * to come in a certain format, so this converts the internal lineage arrays
 * into something Dropdown can display. Second, it handles moving up selected
 * lineages to the top of the list to be displayed above unchosen lineages.
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

  function handleLineageDropdownChange(
    newSelectedOptions:
      | DefaultMenuSelectOption
      | DefaultMenuSelectOption[]
      | null
  ): void {
    // No selection at all means empty all lineage choices.
    // (Vince) Poked around: I don't think Dropdown emits this in our case?
    // But interface for the component says it's there, so defensive code here.
    if (newSelectedOptions === null && selectedLineages.length !== 0) {
      setSelectedLineages([]);
    }

    if (newSelectedOptions === null) {
      return;
    }

    // czifui v 7.0.0 upgrade - now newSelectOptions can be a single option
    // (at least according to typescript).
    // To keep this consistent, check for the single option and return a list
    // with jus the one option. It's unclear if this will happen when multi-
    // select is enabled.
    if (newSelectedOptions && !Array.isArray(newSelectedOptions)) {
      setSelectedLineages([newSelectedOptions.name]);
      return;
    }

    const newSelectedLineages = newSelectedOptions.map(
      (option: DefaultMenuSelectOption) => option.name
    );

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
