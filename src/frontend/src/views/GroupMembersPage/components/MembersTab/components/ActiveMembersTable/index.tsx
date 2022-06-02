import React from "react";
import { Table } from "src/common/components/library/Table";
import { PersonIconCell } from "../PersonIconCell";

interface Props {
  members: any;
}

const ActiveMembersTable = ({ members }: Props): JSX.Element => {
  const headers = ["Member Name", "Email", "Date Added", "Role"];

  const rows = members.map((m) => {
    return [
      <PersonIconCell key={0} content={m.name} />,
      m.email,
      m.joinedDate,
      m.role,
    ];
  });

  return <Table headers={headers} rows={rows} />;
};

export { ActiveMembersTable };
