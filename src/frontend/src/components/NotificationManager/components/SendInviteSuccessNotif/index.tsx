import { Link } from "czifui";
import { useRouter } from "next/router";
import { ROUTES } from "src/common/routes";
import { pluralize } from "src/common/utils/strUtils";

interface Props {
  onDismiss(): void;
  numSent: number;
}

const SendInviteSuccessNotif = ({ numSent, onDismiss }: Props): JSX.Element => {
  const router = useRouter();
  const onClick = () => {
    router.push(ROUTES.GROUP_INVITATIONS, undefined, { shallow: true });
    onDismiss();
  };

  return (
    <>
      {numSent} {pluralize("Invitation", numSent)} {pluralize("has", numSent)}{" "}
      been sent.{" "}
      <Link component="button" sdsStyle="dashed" onClick={onClick}>
        View Invitations
      </Link>
      .
    </>
  );
};

export { SendInviteSuccessNotif };
