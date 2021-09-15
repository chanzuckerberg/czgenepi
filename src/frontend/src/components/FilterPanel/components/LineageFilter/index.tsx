import {
  ComplexFilter,
  ComplexFilterValue,
  DefaultMenuSelectOption,
} from "czifui";
import React, { useEffect, useState } from "react";

interface Props {
  options: DefaultMenuSelectOption[];
  updateLineageFilter: (lineages: string[]) => void;
}

// ComplexFilter defaults to checking if option is selected (is a value) by equality.
// However, because our options are objects that are dynamically generated, object
// equality is always false because they're not the same object, even if same content.
// Instead, we must create a custom selection checker to check underlying value.
const getOptionSelected = (
  option: DefaultMenuSelectOption,
  value: DefaultMenuSelectOption
) => {
  return option.name === value.name;
};
// ComplexFilter doesn't directly do the check, it's done by its child MenuSelect
const optionCheckingMenuSelectProps = {
  getOptionSelected: getOptionSelected,
};

const LineageFilter = (props: Props): JSX.Element => {
  const { options = [], updateLineageFilter } = props;
  const [value, setValue] = useState<ComplexFilterValue>([]);

  useEffect(() => {
    if (value) {
      updateLineageFilter(
        (value as DefaultMenuSelectOption[]).map((d) => d.name)
      );
    }
  }, [updateLineageFilter, value]);

  // (vince) To tweak the internal style of dropdown in ComplexFilter, need to
  // create a specialized set of props to insert CSS via raw `style` put into
  // underlying HTML tag.
  // TODO -- This approach is very different. Talk to SDS team about ways to avoid.
  const PROPS_FOR_INPUT_DROPDOWN = {
    sdsStyle: "minimal", // Would be defaulted, but must set everything now.
    // This `style` gets directly put in as HTML style and interpolated to CSS.
    style: {
      padding: "0",
      textTransform: "uppercase",
    },
  } as const;

  return (
    <ComplexFilter
      label="Lineage"
      options={options}
      onChange={setValue}
      MenuSelectProps={optionCheckingMenuSelectProps}
      multiple
      search
      InputDropdownProps={PROPS_FOR_INPUT_DROPDOWN}
    />
  );
};

export { LineageFilter };
