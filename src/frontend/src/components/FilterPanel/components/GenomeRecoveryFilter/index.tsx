import { ComplexFilter, DefaultMenuSelectOption, ComplexFilterValue } from "czifui";
import React from "react";

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

// Because czifui ComplexFilter expects callback that handles both single
// and multi case at same time, we sidestep type issue with this.
type CallbackTypeWorkaround = (options: ComplexFilterValue) => void;

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

  // TODO (mlila): replace with sds complex filter when complete
  // (vince): For the most part, will be a simple drop-in replacement, but there
  // are some styling difficulties right now. See notes in LineageFilter about
  // czifui 0.0.55, but also, even with that version I think it won't work
  // immediately because of the `Wrapper` component in how ComplexFilter is
  // implemented locking it to 150px width. Whenever we make the change over,
  // expect to need to figure that out as part of it.
  return (
    <ComplexFilter
      label="Genome Recovery"
      options={GENOME_RECOVERY_OPTIONS}
      onChange={onChange as CallbackTypeWorkaround}
      InputDropdownProps={PROPS_FOR_INPUT_DROPDOWN}
    />
  );
};

export { GenomeRecoveryFilter };
