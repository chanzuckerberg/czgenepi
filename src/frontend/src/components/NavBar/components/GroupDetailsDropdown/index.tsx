import { Icon } from "czifui";
import React from "react";
import { pluralize } from "src/common/utils/strUtils";
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
  open: boolean;
}

const GroupDetailsDropdown = ({
  anchorEl,
  open,
}: Props): JSX.Element | null => {
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
  const { memberCount, name, location } = groupInfo;

  const userInfo = {
    isOwner: true,
  };
  const { isOwner } = userInfo;

  const onClickGroupDetails = () => {
    // redirect to group details page when it exists
  };

  const onClickInvite = () => {
    //open invite modal
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
