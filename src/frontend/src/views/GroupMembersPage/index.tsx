import { Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { getGroupIdFromUser } from "src/common/utils/userUtils";
import { GroupDetailsTab } from "./components/GroupDetailsTab";
import { MembersTab, SecondaryTabType } from "./components/MembersTab";
import {
  StyledHeader,
  StyledName,
  StyledPageContent,
  StyledTabs,
} from "./style";

export enum PrimaryTabType {
  MEMBERS = "members",
  DETAILS = "details",
}

export type TabEventHandler = (
  _: React.SyntheticEvent<Record<string, unknown>>,
  tabsValue: never
) => void;

interface Props {
  initialPrimaryTab: PrimaryTabType;
  initialSecondaryTab: SecondaryTabType;
}

const GroupMembersPage = ({
  initialPrimaryTab,
  initialSecondaryTab,
}: Props): JSX.Element | null => {
  const [tabValue, setTabValue] = useState<PrimaryTabType>(initialPrimaryTab);
  const router = useRouter();

  const { data: userInfo } = useUserInfo();
  const groupId = getGroupIdFromUser(userInfo);
  const { data: members = [] } = useGroupMembersInfo(groupId);
  const { data: groupInfo } = useGroupInfo(groupId);

  const { address, location, name, prefix } = groupInfo ?? {};

  // sort group members by name before display
  members.sort((a, b) => (a.name > b.name ? 1 : -1));

  const displayLocation = stringifyGisaidLocation(location);

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
    router.push(`${ROUTES.GROUP}/${value}`);
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
            initialSecondaryTab={initialSecondaryTab}
            groupName={name}
            groupId={groupId}
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
