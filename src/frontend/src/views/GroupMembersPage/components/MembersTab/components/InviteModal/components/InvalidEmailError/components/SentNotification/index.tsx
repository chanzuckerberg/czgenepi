import { Link } from "czifui";
import { useRouter } from "next/router";
import React from "react";
import { ROUTES } from "src/common/routes";
import { pluralize } from "src/common/utils/strUtils";
import Notification from "src/components/Notification";

interface Props {
  onDismiss(): void;
  open: boolean;
  numSent: number;
}

const SentNotification = ({ numSent, onDismiss, open }: Props): JSX.Element => {
  const router = useRouter();
  const onClick = () => {
    router.push(ROUTES.GROUP_INVITATIONS, undefined, { shallow: true });
    onDismiss();
  };

  return (
    <Notification
      buttonText="DISMISS"
      buttonOnClick={onDismiss}
      dismissDirection="right"
      intent="info"
      dismissed={!open}
      autoDismiss
    >
      {numSent} {pluralize("Invitation", numSent)} {pluralize("has", numSent)}{" "}
      been sent.{" "}
      <Link sdsStyle="dashed" onClick={onClick}>
        View Invitations
      </Link>
      .
    </Notification>
  );
};

export { SentNotification };
