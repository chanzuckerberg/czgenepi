import { ComplexFilter } from "czifui";
import React, { useEffect, useState } from "react";
import { DefaultMenuSelectOption } from "../../index";

interface Props {
  options: DefaultMenuSelectOption[];
  updateLineageFilter: (lineages: string[]) => void;
}

const LineageFilter = (props: Props): JSX.Element => {
  const { options = [], updateLineageFilter } = props;

  // FIXME (Vince) -- TypeScript has slayed me. Or maybe the intereaction with czifui?
  // Types break because the `onChange` value must accept single DefaultMenuSelectOption
  // and null as possible input args. But if we do that, then `value` is implied to possibly
  // be those, which it can't be because of required `.map` below.
  // Not sure how to go about fixing this. Probably some forced assertion? But where?
  const [value, setValue] = useState<DefaultMenuSelectOption[]>([]);

  useEffect(() => {
    if (value) {
      updateLineageFilter(value.map((d: DefaultMenuSelectOption) => d.name));
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

  // TODO (vince) -- BUG -- Need to talk to Timmy
  // The ComplexFilter is not displaying previously selected options as I'd expect.
  // It shouldn't need an explicit `value` passed in (this would make it isControlled
  // in the czifui ComplexFilter interally), the non-controlled versions in Storybook
  // maintain state of selected options on open and close. But here it's not...
  return (
    <ComplexFilter
      label="Lineage"
      options={options}
      onChange={setValue}
      multiple
      search
      InputDropdownProps={PROPS_FOR_INPUT_DROPDOWN}
    />
  );
};

export { LineageFilter };
