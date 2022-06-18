import { useRouter } from "next/router";
import React from "react";
import GroupMembersPage, { PrimaryTabType } from "src/views/GroupMembersPage";
import { SecondaryTabType } from "src/views/GroupMembersPage/components/MembersTab";

const Page = (): JSX.Element => {
  const router = useRouter();
  const { params } = router.query;
  const pathTokens = typeof params === "object" ? params : [params];

  const primaryToken = pathTokens.length > 0 && pathTokens[0];
  const secondaryToken = pathTokens.length > 1 && pathTokens[1];

  let requestedPrimaryTab = PrimaryTabType.MEMBERS;
  let requestedSecondaryTab = SecondaryTabType.ACTIVE;

  if (
    primaryToken === PrimaryTabType.MEMBERS ||
    primaryToken === PrimaryTabType.DETAILS
  ) {
    requestedPrimaryTab = primaryToken;
  }

  if (
    secondaryToken === SecondaryTabType.ACTIVE ||
    secondaryToken === SecondaryTabType.INVITATIONS
  ) {
    requestedSecondaryTab = secondaryToken;
  }

  return (
    <GroupMembersPage
      requestedPrimaryTab={requestedPrimaryTab}
      requestedSecondaryTab={requestedSecondaryTab}
    />
  );
};

export default Page;
