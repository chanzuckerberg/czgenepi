import { pluralize, pluralizeVerb } from "src/common/utils/strUtils";
import { StyledDiv } from "./style";

interface Props {
  failedToSendAddresses: string[];
}

const SendInviteFailureNotif = ({
  failedToSendAddresses = [],
}: Props): JSX.Element => {
  const numFailed = failedToSendAddresses.length;

  return (
    <>
      {numFailed} {pluralize("Invitation", numFailed)} could not be sent because
      the {pluralize("account", numFailed)} already{" "}
      {pluralizeVerb("exist", numFailed)} in CZ GEN EPI:
      {failedToSendAddresses.map((a) => (
        <StyledDiv key={a}>{a}</StyledDiv>
      ))}
    </>
  );
};

export { SendInviteFailureNotif };
