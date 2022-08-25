import { Icon, Link, Tooltip } from "czifui";
import { B } from "src/common/styles/basicStyle";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import {
  Content,
  DetailDisplay,
  DetailHeader,
  DetailPage,
  DetailSection,
  DetailSubheader,
  StyledCallout,
  StyledInfoIconWrapper,
  Text,
} from "./style";

interface Props {
  group?: GroupDetails;
  shouldShowChangeDetailsCallout: boolean;
}

const GroupDetailsTab = ({
  group,
  shouldShowChangeDetailsCallout,
}: Props): JSX.Element | null => {
  if (!group) return null;

  const { address, name, prefix, location } = group;
  const displayLocation = stringifyGisaidLocation(location);

  const InfoTooltip = ({ title }: { title: string }) => (
    <Tooltip arrow title={title} placement="top">
      <StyledInfoIconWrapper>
        <Icon sdsIcon="infoCircle" sdsSize="s" sdsType="interactive" />
      </StyledInfoIconWrapper>
    </Tooltip>
  );

  return (
    <DetailPage>
      {shouldShowChangeDetailsCallout && (
        <StyledCallout intent="info">
          Contact us at{" "}
          <Link sdsStyle="dashed" href="mailto:support@czgenepi.org">
            support@czgenepi.org
          </Link>{" "}
          to add or update your group’s details.
        </StyledCallout>
      )}
      <Content>
        <DetailSection>
          <DetailHeader>General</DetailHeader>
          <Text>
            The information in this section is used to support CZ GEN EPI
            functionality.
          </Text>
          <DetailSubheader>
            Default Location for Trees
            <InfoTooltip title="Group’s full Nextstrain location ID. CZ GEN EPI uses this as the default location parameters when building trees for this group." />
          </DetailSubheader>
          <DetailDisplay>{displayLocation}</DetailDisplay>
        </DetailSection>
        <DetailSection>
          <DetailHeader>GISAID Submission Details</DetailHeader>
          <Text>
            The information in this section is used to pre-fill metadata in CZ
            GEN EPI’s GISAID sample submission template.
          </Text>
          <DetailSubheader>
            Submitting Lab
            <InfoTooltip title="Where sequence data have been generated and submitted to GISAID." />
          </DetailSubheader>
          <DetailDisplay>
            <B>{name}</B>
            <div>{address}</div>
          </DetailDisplay>
        </DetailSection>
      </Content>
    </DetailPage>
  );
};

export { GroupDetailsTab };
