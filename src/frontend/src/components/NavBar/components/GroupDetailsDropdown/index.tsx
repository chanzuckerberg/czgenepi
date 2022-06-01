import { Icon } from "czifui";
import { find } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { useGroupMembersInfo } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { pluralize } from "src/common/utils/strUtils";
import { getGroupIdFromUser } from "src/common/utils/userUtils";
import { GroupMenuItem } from "./components/GroupMenuItem";
import {
  CurrentGroup,
  Details,
  Dropdown,
  GroupList,
  GroupName,
  StyledButton,
  StyledIcon,
} from "./style";

interface Props {
  anchorEl?: Element | null;
  onClickInvite(): void;
  open: boolean;
}

const GroupDetailsDropdown = ({
  anchorEl,
  onClickInvite,
  open,
}: Props): JSX.Element | null => {
  const router = useRouter();
  const { data: userInfo } = useUserInfo();
  const groupId = getGroupIdFromUser(userInfo);
  const { data: members } = useGroupMembersInfo(groupId);

  // how many people are in the current group
  const memberCount = members?.length;

  if (!open) return null;

  // TODO (mlila): remove fake data
  const groupInfo = {
    id: 123,
    name: "Santa Clara County",
    location: "California/Santa Clara County",
    memberCount: 4,
  };

  const groupInfo2 = {
    id: 234,
    name: "Santa Clara County and this group has a really really long name idk why",
    location: "California/Santa Clara County",
    memberCount: 6,
  };

  const usersGroups = [groupInfo, groupInfo2];
  const { name, location } = groupInfo;

  // is the current user a group owner
  const currentUser = find(members, (m) => m.id === userInfo.id);
  const isOwner = currentUser.isGroupAdmin === true;

  const onClickGroupDetails = () => {
    // TODO (mlila): will 404 until final group details PR merged in
    router.push(ROUTES.GROUP);
  };

  return (
    <Dropdown
      open
      anchorEl={anchorEl}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <CurrentGroup>
        <GroupName>{name}</GroupName>
        <Details>
          <StyledIcon>
            <Icon sdsIcon="pinLocation" sdsSize="s" sdsType="static" />
          </StyledIcon>
          {location}
        </Details>
        <Details>
          <StyledIcon>
            <Icon sdsIcon="people" sdsSize="s" sdsType="static" />
          </StyledIcon>
          {memberCount} {pluralize("Member", memberCount)}
        </Details>
        <div>
          {isOwner && (
            <StyledButton
              sdsType="primary"
              sdsStyle="rounded"
              onClick={onClickInvite}
            >
              Invite Members
            </StyledButton>
          )}
          <StyledButton
            sdsType="secondary"
            sdsStyle="rounded"
            onClick={onClickGroupDetails}
          >
            Group Details
          </StyledButton>
        </div>
      </CurrentGroup>
      {usersGroups.length > 1 && (
        <GroupList>
          {usersGroups.map((group) => (
            <GroupMenuItem key={group.id} id={group.id} name={group.name} />
          ))}
        </GroupList>
      )}
    </Dropdown>
  );
};

export { GroupDetailsDropdown };
