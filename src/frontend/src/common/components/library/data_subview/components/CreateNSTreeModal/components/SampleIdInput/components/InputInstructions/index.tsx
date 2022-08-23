import { NewTabLink } from "src/common/components/library/NewTabLink";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import { SemiBold, StyledWrapper } from "./style";

const InputInstructions = (): JSX.Element => {
  return (
    <StyledWrapper>
      <CollapsibleInstructions
        header="Force-Include Samples by ID (optional)"
        headerSize="m"
        items={[
          <div key={0}>
            <SemiBold>
              Samples selected on the Sample table or added here will be
              force-included on your tree without undergoing QC.
            </SemiBold>{" "}
            <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees#generating">
              Learn More
            </NewTabLink>
          </div>,
          <div key={1}>
            Add <SemiBold>GISAID IDs</SemiBold> (e.g. USA/CA-CZB-0000/2021,
            hCoV-19/USA/CA-CZB-0000/2021 or EPI_ISL_0000),{" "}
            <SemiBold>CZ GEN EPI Public IDs</SemiBold>, or{" "}
            <SemiBold>CZ GEN EPI Private IDs</SemiBold> below to include samples
            in your tree.
          </div>,
          <div key={2}>
            IDs must be separated by tabs, commas, or enter one ID per row.
          </div>,
          <div key={3}>
            Adding more than 2000 samples will increase the tree building run
            time.
          </div>,
        ]}
      />
    </StyledWrapper>
  );
};

export { InputInstructions };
