import { Button, Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useGroupInvitations } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { TabEventHandler } from "../../index";
import { ActiveMembersTable } from "./components/ActiveMembersTable";
import { InviteModal } from "./components/InviteModal";
import { MemberInvitationsTable } from "./components/MemberInvitationsTable";
import { Header, StyledTabs } from "./style";

export enum SecondaryTabType {
  ACTIVE = "active",
  INVITATIONS = "invitations",
}

interface Props {
  initialSecondaryTab?: SecondaryTabType;
  groupName: string;
  groupId?: number;
  members: GroupMember[];
}

const MembersTab = ({
  initialSecondaryTab,
  groupName,
  groupId,
  members,
}: Props): JSX.Element => {
  const [tabValue, setTabValue] =
    useState<SecondaryTabType>(initialSecondaryTab);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: invitations = [] } = useGroupInvitations(groupId);

  const numActive = Object.keys(members).length;

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
    router.push(`${ROUTES.GROUP_MEMBERS}/${value}`);
  };

  invitations.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  return (
    <>
      <HeadAppTitle subTitle="Group Details" />
      <InviteModal
        onClose={() => setIsInviteModalOpen(false)}
        groupName={groupName}
        open={isInviteModalOpen}
      />
      <Header>
        <StyledTabs
          value={tabValue}
          sdsSize="small"
          onChange={handleTabClick}
          underlined
        >
          <Tab
            value={SecondaryTabType.ACTIVE}
            label="Active"
            count={numActive}
          />
          <Tab
            value={SecondaryTabType.INVITATIONS}
            label="Invitations"
            count={invitations.length}
          />
        </StyledTabs>
        <Button
          sdsType="primary"
          sdsStyle="rounded"
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite
        </Button>
      </Header>
      {tabValue === SecondaryTabType.ACTIVE && (
        <ActiveMembersTable members={members} />
      )}
      {tabValue === SecondaryTabType.INVITATIONS && (
        <MemberInvitationsTable invites={invitations} />
      )}
    </>
  );
};

export { MembersTab };
