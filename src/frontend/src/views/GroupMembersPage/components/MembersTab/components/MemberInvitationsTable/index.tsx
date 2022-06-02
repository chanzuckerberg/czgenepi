import React from "react";
import { Table } from "src/common/components/library/Table";
import { EmailCell } from "./components/EmailCell";

interface Props {
  invites: any;
}

const MemberInvitationsTable = ({ invites }: Props): JSX.Element => {
  const headers = ["Email", "Date Sent", "Role"];

  // TODO (mlila): types
  const rows = invites.map((i: any) => [
    <EmailCell key={0} email={i.email} status={i.status} />,
    i.dateSent,
    i.role,
  ]);

  return <Table headers={headers} rows={rows} />;
};

export { MemberInvitationsTable };
