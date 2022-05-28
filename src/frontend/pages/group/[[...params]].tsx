import { useRouter } from "next/router";
import React from "react";
import GroupMembersPage from "src/views/GroupMembersPage";

const Page = (): JSX.Element => {
  const router = useRouter();
  const { params } = router.query;

  return <GroupMembersPage pathTokens={params} />;
};

export default Page;
