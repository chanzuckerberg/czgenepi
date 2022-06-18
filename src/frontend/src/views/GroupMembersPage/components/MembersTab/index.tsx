import { Button, Tab } from "czifui";
import { find } from "lodash";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useGroupInvitations } from "src/common/queries/groups";
import { ROUTES } from "src/common/routes";
import { TabEventHandler } from "../../index";
import { ActiveMembersTable } from "./components/ActiveMembersTable";
import { InviteModal } from "./components/InviteModal";
import { MemberInvitationsTable } from "./components/MemberInvitationsTable";
import { Container, Header, StyledTabs } from "./style";

export enum SecondaryTabType {
  ACTIVE = "active",
  INVITATIONS = "invitations",
}

interface Props {
  initialSecondaryTab: SecondaryTabType;
  groupName?: string;
  groupId: number;
  members: GroupMember[];
  userInfo: User | undefined;
}

const MembersTab = ({
  initialSecondaryTab,
  groupName,
  groupId,
  members,
  userInfo,
}: Props): JSX.Element | null => {
  const [tabValue, setTabValue] =
    useState<SecondaryTabType>(initialSecondaryTab);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: invitations = [] } = useGroupInvitations(groupId);
  const currentUser = find(members, (m) => m.id === userInfo?.id);

  const isOwner = currentUser?.isGroupAdmin === true;
  const numActive = Object.keys(members).length;

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
    router.push(`${ROUTES.GROUP_MEMBERS}/${value}/`);
  };

  invitations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <Container>
      <HeadAppTitle subTitle="Group Details" />
      {groupName && (
        <InviteModal
          onClose={() => setIsInviteModalOpen(false)}
          groupName={groupName}
          open={isInviteModalOpen}
        />
      )}
      <Header>
        <StyledTabs value={tabValue} sdsSize="small" onChange={handleTabClick}>
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
        {isOwner && (
          <Button
            sdsType="primary"
            sdsStyle="rounded"
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite
          </Button>
        )}
      </Header>
      {tabValue === SecondaryTabType.ACTIVE && (
        <ActiveMembersTable members={members} />
      )}
      {tabValue === SecondaryTabType.INVITATIONS && (
        <MemberInvitationsTable invites={invitations} />
      )}
    </Container>
  );
};

export { MembersTab };
