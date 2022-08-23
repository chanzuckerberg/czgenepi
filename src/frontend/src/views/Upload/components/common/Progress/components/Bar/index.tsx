import { Status } from "../common";
import { Left, Right } from "./style";

interface Props {
  status: Status;
  className?: string;
}

export default function Bar({ status, className }: Props): JSX.Element {
  return (
    <span className={className}>
      <Right isActive={isRightActive(status)}>
        <Left isActive={isLeftActive(status)} />
      </Right>
    </span>
  );
}

function isLeftActive(status: Status) {
  if (status === "default") return false;

  return true;
}

function isRightActive(status: Status) {
  if (status === "complete") return true;

  return false;
}
