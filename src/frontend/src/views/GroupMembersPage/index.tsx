import { Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useProtectedRoute, useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { useSelector } from "src/common/redux/hooks";
import { selectCurrentGroup } from "src/common/redux/selectors";
import { ROUTES } from "src/common/routes";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
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
  requestedPrimaryTab: PrimaryTabType;
  requestedSecondaryTab: SecondaryTabType;
}

const GroupMembersPage = ({
  requestedPrimaryTab,
  requestedSecondaryTab,
}: Props): JSX.Element | null => {
  useProtectedRoute();

  const [tabValue, setTabValue] = useState<PrimaryTabType>(requestedPrimaryTab);
  const router = useRouter();

  const groupId = useSelector(selectCurrentGroup);
  const { data: userInfo } = useUserInfo();
  const { data: members = [] } = useGroupMembersInfo(groupId);
  const { data: groupInfo } = useGroupInfo(groupId);

  const { address, location, name, prefix } = groupInfo ?? {};

  useEffect(() => {
    setTabValue(requestedPrimaryTab);
  }, [requestedPrimaryTab]);

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
            requestedSecondaryTab={requestedSecondaryTab}
            groupName={name}
            members={members}
            userInfo={userInfo}
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
