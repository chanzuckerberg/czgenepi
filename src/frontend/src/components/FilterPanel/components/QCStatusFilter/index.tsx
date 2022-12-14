import { CatchingPokemonSharp } from "@mui/icons-material";
import { DefaultMenuSelectOption } from "czifui";
import { useEffect, useState } from "react";
import { StyledComplexFilter } from "../../style";

interface Props {
  options: DefaultMenuSelectOption[];
  updateQCStatusFilter: (qcStatuses: string[]) => void;
}

export type ComplexFilterValue =
  | DefaultMenuSelectOption[]
  | DefaultMenuSelectOption
  | null;

// ComplexFilter defaults to checking if option is selected (is a value) by equality.
// However, because our options are objects that are dynamically generated, object
// equality is always false because they're not the same object, even if same content.
// Instead, we must create a custom selection checker to check underlying value.
const getOptionSelected = (
  option: DefaultMenuSelectOption,
  value: DefaultMenuSelectOption
) => {
  console.log("value: ", value);
  return option.name === value.name;
};
// ComplexFilter doesn't directly do the check, it's done by its child MenuSelect
const DropdownMenuProps = {
  getOptionSelected,
};

const QCStatusFilter = (props: Props): JSX.Element => {
  const { options = [], updateQCStatusFilter } = props;
  const [value, setValue] = useState<ComplexFilterValue>([]);

  useEffect(() => {
    if (value) {
        updateQCStatusFilter(
        (value as DefaultMenuSelectOption[]).map((d) => d.name)
      );
    }
  }, [updateQCStatusFilter, value]);

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

  return (
    <StyledComplexFilter
      label="QC Status"
      options={options}
      onChange={setValue}
      DropdownMenuProps={DropdownMenuProps}
      multiple
      search
      InputDropdownProps={PROPS_FOR_INPUT_DROPDOWN}
      data-test-id="sample-filter-qc-status"
    />
  );
};

export { QCStatusFilter };
