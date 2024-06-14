import { B } from "src/common/styles/basicStyle";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { StyledBanner, StyledNewTabLink } from "./style";
import { useTreatments } from "@splitsoftware/splitio-react";
import { isUserFlagOn } from "src/components/Split";

// Note: this was previously for privacy policy announcements
// It was pretty convenient to reuse so we use it for one off announcements.

// Show Banner to let users know we are transferring the app
export const Announcements = (): JSX.Element => {
  const flag = useTreatments([USER_FEATURE_FLAGS.transfer_banner]);

  const shouldShowTransferBanner = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.transfer_banner
  );

  return (
    <>
      {shouldShowTransferBanner && (
        <StyledBanner sdsType="primary">
          <B>
            THEIAGEN GLOBAL HEALTH INITIATIVE WILL MANAGE CZ GEN EPI ON OCTOBER
            25, 2024. CLICK&nbsp;
          </B>
          <StyledNewTabLink
            href="https://help.czgenepi.org/hc/en-us/articles/20083077583764-FAQs-CZ-GEN-EPI-Transfer-to-Theiagen-Global-Health-Initiative-TGHI"
            sdsStyle="dashed"
          >
            HERE
          </StyledNewTabLink>
          <B>&nbsp;FOR MORE INFORMATION.</B>
        </StyledBanner>
      )}
    </>
  );
};
