import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import { SemiBold, StyledWrapper } from "./style";

const InputInstructions = (): JSX.Element => {
  return (
    <StyledWrapper>
      <CollapsibleInstructions
        header="Add Samples by ID (optional)"
        items={[
          <div key={0}>
            Add <SemiBold>GISAID IDs</SemiBold> (e.g. USA/CA-CZB-0000/2021 or
            hCoV-19/USA/CA-CZB-0000/2021), <SemiBold>Aspen Public IDs</SemiBold>
            , or <SemiBold>Aspen Private IDs</SemiBold> below to include samples
            in your tree.
          </div>,
          <div key={1}>
            IDs must be separated by tabs, commas, or new lines.
          </div>,
          <div key={2}>
            Depending on the Tree Type, add up to 2000 samples.{" "}
            <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4">
              Learn More
            </NewTabLink>
          </div>,
          <div key={3}>
            <SemiBold>
              As with samples uploaded directly to Aspen, sequences added by ID
              do not undergo any QC before being added to your tree.
            </SemiBold>
          </div>,
        ]}
      />
    </StyledWrapper>
  );
};

export { InputInstructions };
