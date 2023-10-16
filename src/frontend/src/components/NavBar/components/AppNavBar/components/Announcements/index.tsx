import { B } from "src/common/styles/basicStyle";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { StyledBanner, StyledNewTabLink } from "./style";
import { useTreatments } from "@splitsoftware/splitio-react";
import { isUserFlagOn } from "src/components/Split";

// Note: this was previously for privacy policy announcements
// It was pretty convenient to reuse - maybe we want to keep
// it around for one-off banners.

// Show Banner to let users know we are sunsetting the app
export const Announcements = (): JSX.Element => {
  const flag = useTreatments([USER_FEATURE_FLAGS.sunset_banner]);

  const shouldShowSunsetBanner = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.sunset_banner
  );

  return (
    <>
      {shouldShowSunsetBanner && (
        <StyledBanner sdsType="primary">
          <B>CZ GEN EPI will shut down on March 7, 2024. Click&nbsp;</B>
          <StyledNewTabLink href={"https://help.czgenepi.org/hc/en-us"}>
            here
          </StyledNewTabLink>
          <B>&nbsp;to learn more.</B>
        </StyledBanner>
      )}
    </>
  );
};
