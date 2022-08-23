import { StyledChip } from "./style";

interface DateChipProps {
  dateLabel: string | null;
  deleteDateFilterFunc: () => void;
}

const DateChip = ({
  dateLabel,
  deleteDateFilterFunc,
}: DateChipProps): JSX.Element | null => {
  if (!dateLabel) return null;

  return (
    <StyledChip
      size="medium"
      label={dateLabel}
      onDelete={deleteDateFilterFunc}
    />
  );
};

export { DateChip };
