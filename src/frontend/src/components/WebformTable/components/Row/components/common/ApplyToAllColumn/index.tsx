import { Metadata } from "src/components/WebformTable/common/types";
import { StyledButton } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  value: unknown;
  handleClick: (fieldKey: keyof Metadata, value: unknown) => void;
}

export default function ApplyToAllColumn({
  fieldKey,
  value,
  handleClick: handleClickFromProps,
}: Props): JSX.Element {
  const handleClick = () => {
    handleClickFromProps(fieldKey, value);
  };

  return (
    <StyledButton sdsType="secondary" sdsStyle="minimal" onClick={handleClick}>
      APPLY TO ALL
    </StyledButton>
  );
}
