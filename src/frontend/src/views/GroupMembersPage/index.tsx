import { Tab } from "czifui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProtectedRoute, useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { caseInsensitiveSort } from "src/common/utils/strUtils";
import { getIsGroupAdminFromUserInfo } from "src/common/utils/userInfo";
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

type PrimaryTabEventHandler = (
  event: React.SyntheticEvent<Element, Event>,
  tabsValue: PrimaryTabType
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

  const { data: userInfo } = useUserInfo();
  const { data: members = [] } = useGroupMembersInfo();
  const { data: groupInfo } = useGroupInfo();

  const { address, location, name, prefix } = groupInfo ?? {};

  useEffect(() => {
    setTabValue(requestedPrimaryTab);
  }, [requestedPrimaryTab]);

  // sort group members by name before display
  members.sort((a, b) => caseInsensitiveSort(a.name, b.name));

  const displayLocation = stringifyGisaidLocation(location);

  const handleTabClick: PrimaryTabEventHandler = (_, value) => {
    setTabValue(value);
    router.push(`${ROUTES.GROUP}/${value}`);
  };

  const isGroupAdmin = getIsGroupAdminFromUserInfo(userInfo);

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
            shouldShowChangeDetailsCallout={isGroupAdmin}
          />
        )}
      </StyledPageContent>
    </>
  );
};

export default GroupMembersPage;
