import { Button, Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { ROUTES } from "src/common/routes";
import { TabEventHandler } from "../../index";
import { ActiveMembersTable } from "./components/ActiveMembersTable";
import { InviteModal } from "./components/InviteModal";
import { MemberInvitationsTable } from "./components/MemberInvitationsTable";
import { Header, StyledTabs } from "./style";

enum SecondaryTabType {
  ACTIVE = "active",
  INVITATIONS = "invitations",
}

//TODO (mlila): types
interface Props {
  secondaryQueryParam?: string;
  groupName: string;
  members: any[];
}

const isValidSecondaryTab = (token?: string) => {
  if (!token) return false;
  return (
    token === SecondaryTabType.ACTIVE || token === SecondaryTabType.INVITATIONS
  );
};

const MembersTab = ({
  secondaryQueryParam,
  groupName,
  members,
}: Props): JSX.Element => {
  const initialSecondaryTab = (
    isValidSecondaryTab(secondaryQueryParam)
      ? secondaryQueryParam
      : SecondaryTabType.ACTIVE
  ) as SecondaryTabType;

  const [tabValue, setTabValue] =
    useState<SecondaryTabType>(initialSecondaryTab);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    router.push(`${ROUTES.GROUP_MEMBERS}/${tabValue}`, undefined, {
      shallow: true,
    });
  }, [tabValue]);

  const numActive = Object.keys(members).length;

  const handleTabClick: TabEventHandler = (_, value) => {
    setTabValue(value);
  };

  // TODO (mlila): api call
  const invites = [
    {
      email: "erica@fake.com",
      status: "pending",
      dateSent: "2022-05-24",
      role: "Member",
    },
    {
      email: "frank@fake.com",
      status: "expired",
      dateSent: "2022-03-24",
      role: "Member",
    },
  ];

  invites.sort((a, b) => (a.dateSent > b.dateSent ? 1 : -1));

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
            count={invites.length}
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
        <MemberInvitationsTable invites={invites} />
      )}
    </>
  );
};

export { MembersTab };
