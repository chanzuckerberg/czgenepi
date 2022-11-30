import { Icon, Tooltip } from "czifui";
import { MouseEventHandler, useState } from "react";
import FeedbackIcon from "src/common/icons/feedback.svg";
import { useUserInfo } from "src/common/queries/auth";
import { HiddenLabel } from "src/common/styles/accessibility";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { InviteModal } from "src/views/GroupMembersPage/components/MembersTab/components/InviteModal";
import { GroupDetailsDropdown } from "../AppNavBar/components/GroupDetailsDropdown";
import UserMenu from "./components/UserMenu";
import {
  DropdownClickTarget,
  NavOrg,
  StyledDiv,
  StyledIconWrapper,
  StyledLink,
  StyledNavIconWrapper,
} from "./style";

export default function RightNav(): JSX.Element {
  const { data: userInfo } = useUserInfo();
  const group = getCurrentGroupFromUserInfo(userInfo);

  const name = group?.name;
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [isGroupDetailsDropdownOpen, setIsGroupDetailsDropdownOpen] =
    useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const toggleDropdown: MouseEventHandler = (e) => {
    const newAnchor = isGroupDetailsDropdownOpen ? null : e.currentTarget;
    setAnchorEl(newAnchor);
    setIsGroupDetailsDropdownOpen(!isGroupDetailsDropdownOpen);
  };
  return (
    <StyledDiv>
      {name && (
        <>
          <InviteModal
            onClose={() => setIsInviteModalOpen(false)}
            open={isInviteModalOpen}
            groupName={name}
          />
          <DropdownClickTarget onClick={toggleDropdown}>
            <NavOrg>{name}</NavOrg>
            <StyledNavIconWrapper>
              <Icon sdsIcon="chevronDown" sdsSize="xs" sdsType="static" />
            </StyledNavIconWrapper>
            <GroupDetailsDropdown
              anchorEl={anchorEl}
              onClickInvite={() => setIsInviteModalOpen(true)}
              open={isGroupDetailsDropdownOpen}
            />
          </DropdownClickTarget>
        </>
      )}
      <HiddenLabel id="feedback-label">Submit issues or feedback</HiddenLabel>
      <Tooltip
        arrow
        title="Submit Issues or Feedback"
        sdsStyle="dark"
        placement="bottom"
      >
        <StyledLink
          aria-labelledby="feedback-label"
          href="https://airtable.com/shr2SrkMN8DK1mLEK"
          target="_blank"
          rel="noreferrer"
        >
          <StyledIconWrapper>
            <FeedbackIcon aria-hidden="true" />
          </StyledIconWrapper>
        </StyledLink>
      </Tooltip>
      <UserMenu user={userInfo?.name} />
    </StyledDiv>
  );
}
