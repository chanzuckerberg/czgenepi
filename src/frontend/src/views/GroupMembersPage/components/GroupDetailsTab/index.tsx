import React from "react";
import {
  Content,
  DetailDisplay,
  DetailHeader,
  DetailPage,
  DetailSection,
  DetailSubheader,
  Text,
} from "./style";

interface Props {
  address?: string;
  location?: string;
  prefix?: string;
}

const GroupDetailsTab = ({ address, location, prefix }: Props): JSX.Element => {
  return (
    <DetailPage>
      <DetailHeader>Group Details</DetailHeader>
      <Content>
        <DetailSection>
          <DetailSubheader>Default Location for Trees</DetailSubheader>
          <Text>
            Group’s full Nextstrain location ID. CZ GEN EPI uses this as the
            default location parameters when building trees for this group.
            Learn More.
          </Text>
          <DetailDisplay>{location}</DetailDisplay>
          <DetailSubheader>Address</DetailSubheader>
          <Text>
            Group’s primary address. CZ GEN EPI uses this information to help
            prepare samples for GISAID submisions. Learn More.
          </Text>
          <DetailDisplay>{address}</DetailDisplay>
        </DetailSection>
        <DetailSection>
          <DetailSubheader>Sample Public ID Prefix</DetailSubheader>
          <Text>
            This set of characters is used when auto-generating unique Public
            IDs for samples uploaded to this Group if a Public or GISAID ID is
            not provided. Learn More.
          </Text>
          <DetailDisplay>{prefix}</DetailDisplay>
        </DetailSection>
      </Content>
    </DetailPage>
  );
};

export { GroupDetailsTab };
