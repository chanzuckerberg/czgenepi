import { Tab, Tabs } from "czifui";
import React, { useState } from "react";
import { GroupDetailsTab } from "./components/GroupDetailsTab";
import { MembersTab } from "./components/MembersTab";
import { StyledHeader, StyledPageContent } from "./style";

type PrimaryTabType = "members" | "details";

const GroupMembersPage = (): JSX.Element => {
  const [tabValue, setTabValue] = useState<PrimaryTabType>("members");

  const group = {
    name: "Santa Clara County",
    members: [
      {
        name: "Albert",
        email: "albert@fake.com",
        joinedDate: "2022-02-02",
        role: "member",
      },
      {
        name: "Charles",
        email: "charles@fake.com",
        joinedDate: "2021-06-06",
        role: "member",
      },
      {
        name: "Beatrice",
        email: "beatrice@fake.com",
        joinedDate: "2021-01-01",
        role: "member",
      },
      {
        name: "Danielle",
        email: "danielle@fake.com",
        joinedDate: "2022-03-03",
        role: "member",
      },
    ],
  };

  const invites = [
    {
      email: "erica@fake.com",
      state: "pending",
      date: "2022-05-24",
      role: "Member",
    },
    {
      email: "frank@fake.com",
      state: "expired",
      date: "2022-03-24",
      role: "Member",
    },
  ];

  // sort group members by name before display
  group.members.sort((a, b) => (a.name > b.name ? 1 : -1));
  invites.sort((a, b) => (a.date > b.date ? 1 : -1));

  const handleTabClick = (_, value) => {
    setTabValue(value);
  };

  return (
    <StyledPageContent>
      <StyledHeader>{group.name}</StyledHeader>
      <Tabs
        value={tabValue}
        sdsSize="large"
        onChange={handleTabClick}
        underlined
      >
        <Tab value="members" label="Members" />
        <Tab value="details" label="Details" />
      </Tabs>
      {tabValue === "members" && (
        <MembersTab invites={invites} members={group.members} />
      )}
      {tabValue === "details" && <GroupDetailsTab />}
    </StyledPageContent>
  );
};

export default GroupMembersPage;
