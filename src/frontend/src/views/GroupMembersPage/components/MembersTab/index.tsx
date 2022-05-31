import { Button, Tab } from "czifui";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Table } from "src/common/components/library/Table";
import { ROUTES } from "src/common/routes";
import { TabEventHandler } from "../../index";
import { Header, StyledTabs } from "./style";

enum SecondaryTabType {
  ACTIVE = "active",
  INVITATIONS = "invitations",
}

interface Props {
  secondaryQueryParam?: string;
  invites: any[];
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
  invites,
  members,
}: Props): JSX.Element => {
  const initialSecondaryTab = (
    isValidSecondaryTab(secondaryQueryParam)
      ? secondaryQueryParam
      : SecondaryTabType.ACTIVE
  ) as SecondaryTabType;

  const [tabValue, setTabValue] =
    useState<SecondaryTabType>(initialSecondaryTab);
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

  return (
    <>
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
        <Button sdsType="primary" sdsStyle="rounded">
          Invite
        </Button>
      </Header>
      <Table />
      {tabValue === SecondaryTabType.ACTIVE && (
        <div>
          {members.map((m) => (
            <div key={m.name}>{m.name}</div>
          ))}
        </div>
      )}
      {tabValue === SecondaryTabType.INVITATIONS && (
        <div>
          {invites.map((i) => (
            <div key={i.email}>{i.email}</div>
          ))}
        </div>
      )}
    </>
  );
};

export { MembersTab };
