import { Button, Tab } from "czifui";
import React, { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { TabEventHandler } from "../../index";
import { ActiveMembersTable } from "./components/ActiveMembersTable";
import { MemberInvitationsTable } from "./components/MemberInvitationsTable";
import { Header, StyledTabs } from "./style";

type TabType = "active" | "invitations";

//TODO (mlila): types
interface Props {
  invites: any[];
  members: any[];
}

const MembersTab = ({ invites, members }: Props): JSX.Element => {
  const [tabValue, setTabValue] = useState<TabType>("active");
  const numActive = Object.keys(members).length;

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
  };

  return (
    <>
      <HeadAppTitle subTitle="Group Details" />
      <Header>
        <StyledTabs
          value={tabValue}
          sdsSize="small"
          onChange={handleTabClick}
          underlined
        >
          <Tab value="active" label="Active" count={numActive} />
          <Tab value="invitations" label="Invitations" count={invites.length} />
        </StyledTabs>
        <Button sdsType="primary" sdsStyle="rounded">
          Invite
        </Button>
      </Header>
      {tabValue === "active" && <ActiveMembersTable members={members} />}
      {tabValue === "invitations" && (
        <div>
          {invites.map((i) => (
            <div key={i.email}>{i.email}</div>
          ))}
        </div>
      )}
    </>
  );
};

export { MembersTab };
