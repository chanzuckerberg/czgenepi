import Popper from "@material-ui/core/Popper";
import { AutocompleteCloseReason } from "@material-ui/lab";
import { Chip, MenuSelect } from "czifui";
import React, { useEffect, useState } from "react";
import { DefaultMenuSelectOption } from "../../index";
import { StyledInputDropdown } from "../../style";

interface Props {
  options: DefaultMenuSelectOption[];
  updateLineageFilter: (lineages: string[]) => void;
}

const LineageFilter = (props: Props): JSX.Element => {
  const { options = [], updateLineageFilter } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<DefaultMenuSelectOption[] | undefined>([]);
  const [pendingValue, setPendingValue] = useState<
    DefaultMenuSelectOption[] | undefined
  >([]);

  useEffect(() => {
    if (value) {
      updateLineageFilter(value.map((d) => d.name));
    }
  }, [updateLineageFilter, value]);

  const open = Boolean(anchorEl);
  const id = open ? "lineage-filter" : undefined;

  return (
    <div>
      <div>
        <StyledInputDropdown
          sdsStyle="minimal"
          label="Lineage"
          // @ts-expect-error remove line when inputdropdown types fixed in sds
          onClick={handleClick}
        />
        <Chips value={value} onDelete={handleDelete} />
      </div>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <MenuSelect
          disableCloseOnSelect
          multiple
          open
          search
          onClose={handleClose}
          value={pendingValue}
          onChange={handleChange}
          options={options}
        />
      </Popper>
    </div>
  );

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setPendingValue(value as DefaultMenuSelectOption[]);
    setAnchorEl(event.currentTarget);
  }

  function handleClose(
    _: React.ChangeEvent<unknown>,
    reason: AutocompleteCloseReason
  ) {
    if (reason === "toggleInput") {
      return;
    }

    setValue(pendingValue);

    if (anchorEl) {
      anchorEl.focus();
    }

    setAnchorEl(null);
  }

  function handleChange(
    _: React.ChangeEvent<unknown>,
    newValue: DefaultMenuSelectOption[] | undefined
  ) {
    return setPendingValue(newValue as DefaultMenuSelectOption[]);
  }

  function handleDelete(option: DefaultMenuSelectOption) {
    const newValue = (value as DefaultMenuSelectOption[]).filter(
      (item) => item !== option
    );

    setValue(newValue);
  }
};

interface ChipsProps {
  value?: DefaultMenuSelectOption[];
  onDelete: (option: DefaultMenuSelectOption) => void;
}

function Chips({ value, onDelete }: ChipsProps): JSX.Element | null {
  if (!value) return null;

  return (
    <div>
      {(value as DefaultMenuSelectOption[]).map((item) => {
        const { name } = item;

        return (
          <Chip
            size="medium"
            key={name}
            label={name}
            onDelete={() => onDelete(item)}
          />
        );
      })}
    </div>
  );
}

export { LineageFilter };
