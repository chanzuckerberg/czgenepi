import { Notification } from "czifui";
import { pluralize, pluralizeVerb } from "src/common/utils/strUtils";
import { StyledDiv } from "./style";

interface Props {
  onDismiss(): void;
  open: boolean;
  failedToSendAddresses: string[];
}

const FailedToSendNotification = ({
  failedToSendAddresses = [],
  onDismiss,
  open,
}: Props): JSX.Element => {
  const numFailed = failedToSendAddresses.length;

  return (
    <Notification
      buttonText="DISMISS"
      buttonOnClick={onDismiss}
      dismissDirection="right"
      intent="warning"
      dismissed={!open}
    >
      {numFailed} {pluralize("Invitation", numFailed)} could not be sent because
      the {pluralize("account", numFailed)} already{" "}
      {pluralizeVerb("exist", numFailed)} in CZ GEN EPI:
      {failedToSendAddresses.map((a) => (
        <StyledDiv key={a}>{a}</StyledDiv>
      ))}
    </Notification>
  );
};

export { FailedToSendNotification };
