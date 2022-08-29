import { HeadAppTitle } from "src/common/components";
import { AuthenticationError } from "src/components/AuthenticationError";

const InviteExpired = (): JSX.Element => {
  return (
    <>
      <HeadAppTitle subTitle="Invitation Expired" />
      <AuthenticationError
        title="Invitation Expired"
        text="Please contact the group owner to send you a new invitation."
      />
    </>
  );
};

export default InviteExpired;
