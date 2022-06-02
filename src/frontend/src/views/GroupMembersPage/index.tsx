import { Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { getGroupIdFromUser } from "src/common/utils/userUtils";
import { GroupDetailsTab } from "./components/GroupDetailsTab";
import { MembersTab } from "./components/MembersTab";
import {
  StyledHeader,
  StyledName,
  StyledPageContent,
  StyledTabs,
} from "./style";

enum PrimaryTabType {
  MEMBERS = "members",
  DETAILS = "details",
}

export type TabEventHandler = (
  _: React.SyntheticEvent<Record<string, unknown>>,
  tabsValue: never
) => void;

interface Props {
  pathTokens?: string[];
}

const isValidPrimaryTab = (token?: string) => {
  return token === PrimaryTabType.MEMBERS || token === PrimaryTabType.DETAILS;
};

const GroupMembersPage = ({ pathTokens }: Props): JSX.Element => {
  const [primaryQueryParam, secondaryQueryParam] = pathTokens ?? [];
  const initialPrimaryTab = (
    isValidPrimaryTab(primaryQueryParam)
      ? primaryQueryParam
      : PrimaryTabType.MEMBERS
  ) as PrimaryTabType;

  const [tabValue, setTabValue] = useState<PrimaryTabType>(initialPrimaryTab);
  const router = useRouter();

  const { data: userInfo } = useUserInfo();
  const groupId = getGroupIdFromUser(userInfo);
  const { data: members = [] } = useGroupMembersInfo(groupId);
  const { data: groupInfo = {} } = useGroupInfo(groupId);
  const { address, location, name, prefix } = groupInfo;

  useEffect(() => {
    router.push(`${ROUTES.GROUP}/${tabValue}`, undefined, { shallow: true });
  }, [tabValue]);

  // TODO (mlila): api calls
  const invites = [
    {
      email: "erica@fake.com",
      status: "pending",
      dateSent: "2022-05-24",
      role: "Member",
    },
    {
      email: "frank@fake.com",
      status: "expired",
      dateSent: "2022-03-24",
      role: "Member",
    },
  ];

  // sort group members by name before display
  members.sort((a, b) => (a.name > b.name ? 1 : -1));
  invites.sort((a, b) => (a.dateSent > b.dateSent ? 1 : -1));

  const displayLocation = stringifyGisaidLocation(location);

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
  };

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
          <Tab value={PrimaryTabType.MEMBERS} label="Members" />
          <Tab value={PrimaryTabType.DETAILS} label="Details" />
        </StyledTabs>
      </StyledHeader>
      <StyledPageContent>
        {tabValue === PrimaryTabType.MEMBERS && (
          <MembersTab
            secondaryQueryParam={secondaryQueryParam}
            invites={invites}
            members={members}
          />
        )}
        {tabValue === PrimaryTabType.DETAILS && (
          <GroupDetailsTab
            address={address}
            location={displayLocation}
            prefix={prefix}
          />
        )}
      </StyledPageContent>
    </>
  );
};

export default GroupMembersPage;
