import Popper from "@material-ui/core/Popper";
import { MenuSelect } from "czifui";
import React, { useEffect, useState } from "react";
import { DefaultMenuSelectOption } from "../../index";
import {
  StyledChip,
  StyledFilterWrapper,
  StyledInputDropdown,
} from "../../style";

interface Props {
  updateGenomeRecoveryFilter: (selected?: string) => void;
}

const GenomeRecoveryFilter = ({
  updateGenomeRecoveryFilter,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<DefaultMenuSelectOption | null>();

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
    newValue: DefaultMenuSelectOption | null
  ) => {
    setValue(newValue as DefaultMenuSelectOption);
  };

  const handleDelete = () => {
    setValue(null);
  };

  // TODO (mlila): replace with sds complex filter when complete
  return (
    <>
      <StyledFilterWrapper>
        <StyledInputDropdown
          sdsStyle="minimal"
          label="Genome Recovery"
          onClick={handleClick}
        />
        <Chips value={value} onDelete={handleDelete} />
      </StyledFilterWrapper>
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
  value?: DefaultMenuSelectOption | null;
  onDelete: () => void;
}

// TODO (mlila): replace with sds tag when it's complete
const Chips = ({ value, onDelete }: ChipsProps): JSX.Element | null => {
  if (!value) return null;
  const { name } = value as never;

  return <StyledChip size="medium" label={name} onDelete={onDelete} />;
};

export { GenomeRecoveryFilter };
