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

const GENOME_RECOVERY_OPTIONS = [
  {
    name: "Complete",
  },
  {
    name: "Failed",
  },
];

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
  // (vince): For the most part, will be a simple drop-in replacement, but there
  // are some styling difficulties right now. See notes in LineageFilter about
  // czifui 0.0.55, but also, even with that version I think it won't work
  // immediately because of the `Wrapper` component in how ComplexFilter is
  // implemented locking it to 150px width. Whenever we make the change over,
  // expect to need to figure that out as part of it.
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
          options={GENOME_RECOVERY_OPTIONS}
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
