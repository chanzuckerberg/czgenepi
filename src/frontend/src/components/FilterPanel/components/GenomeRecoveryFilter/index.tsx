import Popper from "@material-ui/core/Popper";
import { Chip, MenuSelect } from "czifui";
import React, { useEffect, useState } from "react";
import { DefaultMenuSelectOption } from "../../index";
import { StyledInputDropdown } from "../../style";

interface Props {
  updateGenomeRecoveryFilter: (selected: string) => void;
}

const GenomeRecoveryFilter = ({
  updateGenomeRecoveryFilter,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<DefaultMenuSelectOption>();

  useEffect(() => {
    updateGenomeRecoveryFilter(value?.name);
  }, [updateGenomeRecoveryFilter, value]);

  const open = Boolean(anchorEl);
  const id = "genome-recovery";
  const OPTIONS = [
    {
      name: "Complete",
    },
    {
      name: "Failed",
    },
  ];

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }

    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChange = (
    _: React.ChangeEvent<unknown>,
    newValue: DefaultMenuSelectOption | DefaultMenuSelectOption[] | null
  ) => {
    setValue(newValue as DefaultMenuSelectOption);
  };

  const handleDelete = () => {
    setValue();
  };

  // TODO (mlila): replace with sds complex filter when complete
  return (
    <>
      <div onClick={handleClick}>
        <StyledInputDropdown sdsStyle="minimal" label="Genome Recovery" />
        <Chips value={value} onDelete={handleDelete} />
      </div>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <MenuSelect
          open
          onClose={handleClose}
          value={value}
          onChange={handleChange}
          options={OPTIONS}
        />
      </Popper>
    </>
  );
};

interface ChipsProps {
  value: DefaultMenuSelectOption | DefaultMenuSelectOption[] | null;
  onDelete: (option: DefaultMenuSelectOption) => void;
}

const Chips = ({ value, onDelete }: ChipsProps): JSX.Element | null => {
  if (!value) return null;
  const { name } = value as never;

  return <Chip size="medium" label={name} onDelete={onDelete} />;
};

export { GenomeRecoveryFilter };
