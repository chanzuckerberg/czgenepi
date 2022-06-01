import { Button, Tab } from "czifui";
import React, { useState } from "react";
import { Table } from "src/common/components/library/Table";
import { TabEventHandler } from "../../index";
import { Header, StyledTabs } from "./style";

type TabType = "active" | "invitations";

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
      <Table />
      {tabValue === "active" && (
        <div>
          {members.map((m) => (
            <div key={m.name}>{m.name}</div>
          ))}
        </div>
      )}
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
