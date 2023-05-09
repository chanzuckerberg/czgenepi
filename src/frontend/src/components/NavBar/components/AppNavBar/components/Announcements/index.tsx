import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { B } from "src/common/styles/basicStyle";
import { SplitPathogenWrapper } from "src/components/Split/SplitPathogenWrapper";
import { PATHOGEN_FEATURE_FLAGS } from "src/components/Split/types";
import { StyledBanner, StyledNewTabLink } from "./style";

// Note: this was previously for privacy policy announcements
// It was pretty convenient to reuse - maybe we want to keep
// it around for one-off banners.

// Show Banner on Covid pages to let the user know that we
// are currently unable to ingest GISAID data
export const Announcements = (): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);

  return (
    <>
      <SplitPathogenWrapper
        pathogen={pathogen}
        feature={PATHOGEN_FEATURE_FLAGS.show_gisaid_ingestion_banner}
      >
        <StyledBanner sdsType="primary">
          <B>
            As of 4/13/23, we have switched from using GISAID for phylo tree
            focal and contextual samples to using GenBank.&nbsp;
          </B>
          <StyledNewTabLink
            href={
              "https://help.czgenepi.org/hc/en-us/articles/14696829683860-GISAID-to-GenBank-Transition"
            }
          >
            Learn more
          </StyledNewTabLink>
        </StyledBanner>
      </SplitPathogenWrapper>
    </>
  );
};
