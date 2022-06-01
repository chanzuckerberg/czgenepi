import { Icon } from "czifui";
import { find } from "lodash";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
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
  const { data: userInfo } = useUserInfo();
  const groupId = getGroupIdFromUser(userInfo);
  const { data: members } = useGroupMembersInfo(groupId) ?? [];
  const { data: groupInfo } = useGroupInfo(groupId);

  if (!open || !userInfo || !groupInfo) return null;

  // how many people are in the current group
  const memberCount = members?.length ?? 0;

  // right now users can only have one group, but will be able to have more in the future.
  // ui already knows how to render for multiple groups, so we still want to give an array.
  const usersGroups: Group[] = [groupInfo];

  const { name, location } = groupInfo ?? {};
  const displayLocation = stringifyGisaidLocation(location);

  // is the current user a group owner
  const currentUser = find(members, (m) => m.id === userInfo.id);

  if (!currentUser) return null;

  const isOwner = currentUser.isGroupAdmin === true;

  const onClickGroupDetails = () => {
    // redirect to group details page when it exists
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
          {displayLocation}
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
