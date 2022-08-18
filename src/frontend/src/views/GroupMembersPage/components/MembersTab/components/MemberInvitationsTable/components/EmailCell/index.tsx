import { PersonIconCell } from "../../../PersonIconCell";
import { StyledChip, Wrapper } from "./style";

interface Props {
  email: string;
  status: "pending" | "expired";
}

const EmailCell = ({ email, status }: Props): JSX.Element => {
  const color = status === "expired" ? "warning" : "info";

  return (
    <Wrapper>
      <PersonIconCell content={email} />
      <StyledChip status={color} isRounded size="small" label={status} />
    </Wrapper>
  );
};

export { EmailCell };
