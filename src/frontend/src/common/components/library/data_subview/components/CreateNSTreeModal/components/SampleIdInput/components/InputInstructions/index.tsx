import { useTreatments } from "@splitsoftware/splitio-react";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import { FEATURE_FLAGS, isFlagOn } from "src/components/Split";
import { SemiBold, StyledWrapper } from "./style";

const InputInstructions = (): JSX.Element => {
  const flag = useTreatments([FEATURE_FLAGS.sample_filtering_tree_creation]);
  const isSampleFilteringEnabled = isFlagOn(
    flag,
    FEATURE_FLAGS.sample_filtering_tree_creation
  );

  if (isSampleFilteringEnabled) {
    return (
      <StyledWrapper>
        <CollapsibleInstructions
          header="Add Samples by ID (optional)"
          items={[
            <div key={0}>
              Add <SemiBold>GISAID IDs</SemiBold> (e.g. USA/CA-CZB-0000/2021 or
              hCoV-19/USA/CA-CZB-0000/2021),{" "}
              <SemiBold>CZ GEN EPI Public IDs</SemiBold>, or{" "}
              <SemiBold>CZ GEN EPI Private IDs</SemiBold> below to include
              samples in your tree.
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
                As with samples uploaded directly to CZ GEN EPI, sequences added
                by ID do not undergo any QC before being added to your tree.
              </SemiBold>
            </div>,
          ]}
        />
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <CollapsibleInstructions
        header="Force-Include Samples by ID (optional)"
        items={[
          <div key={0}>
            <SemiBold>
              Samples selected on the Sample table or added here will be
              force-included on your tree without undergoing QC.
            </SemiBold>{" "}
            <NewTabLink href="https://docs.google.com/document/d/1qjS6gRaKwpiw8WE2LbBNh9-m5ZFXm9X_H7O6UsXXiAw/edit#heading=h.61og0yhc0ua3">
              Learn More
            </NewTabLink>
          </div>,
          <div key={1}>
            Add <SemiBold>GISAID IDs</SemiBold> (e.g. USA/CA-CZB-0000/2021 or
            hCoV-19/USA/CA-CZB-0000/2021),{" "}
            <SemiBold>CZ GEN EPI Public IDs</SemiBold>, or{" "}
            <SemiBold>CZ GEN EPI Private IDs</SemiBold> below to include samples
            in your tree.
          </div>,
          <div key={2}>
            IDs must be separated by tabs, commas, or enter one ID per row.
          </div>,
        ]}
      />
    </StyledWrapper>
  );
};

export { InputInstructions };
