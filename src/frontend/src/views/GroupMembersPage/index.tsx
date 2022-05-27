import { Tab } from "czifui";
import React, { useState } from "react";
import { GroupDetailsTab } from "./components/GroupDetailsTab";
import { MembersTab } from "./components/MembersTab";
import {
  StyledHeader,
  StyledName,
  StyledPageContent,
  StyledTabs,
} from "./style";

type PrimaryTabType = "members" | "details";

const GroupMembersPage = (): JSX.Element => {
  const [tabValue, setTabValue] = useState<PrimaryTabType>("members");

  const group = {
    address: `1234 South Main Street
Suite 210
Santa Clara, CA 95050
United States`,
    location: "North America/USA/California/Santa Clara County",
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
    name: "Santa Clara County",
    prefix: "CA-CZB",
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

  const { address, location, name, prefix } = group;

  return (
    <>
      <StyledHeader>
        <StyledName>{name}</StyledName>
        <StyledTabs
          value={tabValue}
          sdsSize="large"
          onChange={handleTabClick}
          underlined
        >
          <Tab value="members" label="Members" />
          <Tab value="details" label="Details" />
        </StyledTabs>
      </StyledHeader>
      <StyledPageContent>
        {tabValue === "members" && (
          <MembersTab invites={invites} members={group.members} />
        )}
        {tabValue === "details" && (
          <GroupDetailsTab
            address={address}
            location={location}
            prefix={prefix}
          />
        )}
      </StyledPageContent>
    </>
  );
};

export default GroupMembersPage;
