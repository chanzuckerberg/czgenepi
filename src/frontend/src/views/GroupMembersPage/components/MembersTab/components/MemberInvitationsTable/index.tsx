import { Table } from "src/common/components/library/Table";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { EmailCell } from "./components/EmailCell";

interface Props {
  invites: Invitation[];
}

const MemberInvitationsTable = ({ invites }: Props): JSX.Element => {
  const headers = ["Email", "Date Sent", "Role"];

  const rows = invites.map((i: Invitation) => {
    const { invitee, expiresAt, createdAt } = i;
    const expirationDate = Date.parse(expiresAt);
    const hasExpired = expirationDate < Date.now();
    const status = hasExpired ? "expired" : "pending";

    return [
      <EmailCell key={0} email={invitee.email} status={status} />,
      datetimeWithTzToLocalDate(createdAt),
      "Member", // this may vary in the future, but for now only one type of invitation is available
    ];
  });

  return <Table headers={headers} rows={rows} />;
};

export { MemberInvitationsTable };
