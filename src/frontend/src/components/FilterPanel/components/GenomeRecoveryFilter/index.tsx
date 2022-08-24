import { DefaultMenuSelectOption } from "czifui";
import { StyledComplexFilter } from "../../style";
import { ComplexFilterValue } from "../LineageFilter";

interface Props {
  updateGenomeRecoveryFilter: (selected?: string) => void;
}

const GENOME_RECOVERY_OPTIONS = [
  {
    name: "Complete",
  },
  {
    name: "Failed",
  },
];

// HACK Because czifui ComplexFilter expects callback that handles both
// single and multi case at same time, we sidestep type issue with this.
type CallbackTypeWorkaround = (options: ComplexFilterValue) => void;

// TODO -- With czifui 0.0.55, the `InputDropdownComponent` was exposed so it
// can be directly styled and passed in as we do with others.
// This should be swapped over so it matches the approach we do elsewhere.
// (vince) To tweak the internal style of dropdown in ComplexFilter, need to
// create a specialized set of props to insert CSS via raw `style` put into
// underlying HTML tag. Was done when we were on czifui 0.0.53.
const PROPS_FOR_INPUT_DROPDOWN = {
  sdsStyle: "minimal", // Would be defaulted, but must set everything now.
  // This `style` gets directly put in as HTML style and interpolated to CSS.
  style: {
    padding: "0",
    textTransform: "uppercase",
  },
} as const;

const GenomeRecoveryFilter = ({
  updateGenomeRecoveryFilter,
}: Props): JSX.Element => {
  const onChange = (selectedOption: DefaultMenuSelectOption | null) => {
    updateGenomeRecoveryFilter(selectedOption?.name);
  };

  return (
    <StyledComplexFilter
      label="Genome Recovery"
      options={GENOME_RECOVERY_OPTIONS}
      onChange={onChange as CallbackTypeWorkaround}
      InputDropdownProps={PROPS_FOR_INPUT_DROPDOWN}
    />
  );
};

export { GenomeRecoveryFilter };
