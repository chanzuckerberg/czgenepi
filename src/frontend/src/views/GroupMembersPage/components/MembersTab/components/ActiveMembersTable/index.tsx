import { Table } from "src/common/components/library/Table";
import { PersonIconCell } from "../PersonIconCell";
import { Wrapper } from "./style";

interface Props {
  members: GroupMember[];
}

const ActiveMembersTable = ({ members }: Props): JSX.Element => {
  const headers = ["Member Name", "Email"];

  const rows = members.map((m: GroupMember) => {
    return [<PersonIconCell key={0} content={m.name} />, m.email];
  });

  return (
    <Wrapper>
      <Table headers={headers} rows={rows} />
    </Wrapper>
  );
};

export { ActiveMembersTable };
