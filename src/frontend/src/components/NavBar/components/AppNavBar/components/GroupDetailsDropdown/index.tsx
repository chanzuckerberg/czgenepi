import { Icon } from "czifui";
import { useRouter } from "next/router";
import { useUserInfo } from "src/common/queries/auth";
import { useGroupInfo, useGroupMembersInfo } from "src/common/queries/groups";
import { useSelector } from "src/common/redux/hooks";
import { selectCurrentGroup } from "src/common/redux/selectors";
import { ROUTES } from "src/common/routes";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { pluralize } from "src/common/utils/strUtils";
import { getIsGroupAdminFromUserInfo } from "src/common/utils/userInfo";
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

  const currentGroupId = useSelector(selectCurrentGroup);
  const { data: userInfo } = useUserInfo();
  const { data: members = [] } = useGroupMembersInfo();
  const { data: groupInfo } = useGroupInfo();

  if (!open || !userInfo) return null;

  const { groups } = userInfo;
  const isGroupAdmin = getIsGroupAdminFromUserInfo(userInfo);

  // how many people are in the current group
  const memberCount = members?.length ?? 0;

  const { name, location } = groupInfo ?? {};
  const displayLocation = stringifyGisaidLocation(location);

  const onClickGroupDetails = () => {
    router.push(ROUTES.GROUP_DETAILS);
  };

  return (
    <Dropdown
      open
      anchorEl={anchorEl}
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
          {isGroupAdmin && (
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
      {groups.length > 1 && (
        <GroupList>
          {groups
            .filter((group) => group.id !== currentGroupId)
            .map((group) => (
              <GroupMenuItem key={group.id} id={group.id} name={group.name} />
            ))}
        </GroupList>
      )}
    </Dropdown>
  );
};

export { GroupDetailsDropdown };
