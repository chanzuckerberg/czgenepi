import React from "react";
import { HeadAppTitle } from "src/common/components";
import { AuthenticationError } from "src/components/AuthenticationError";

const InviteAccepted = (): JSX.Element => {
  return (
    <>
      <HeadAppTitle subTitle="Authentication Error" />
      <AuthenticationError
        title="Authenication Error"
        text="This invitation can only be used once. Please contact the group owner to send you a new invite."
      />
    </>
  );
};

export default InviteAccepted;
