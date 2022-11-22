import { Icon, Link } from "czifui";
import { StyledInfoIconWrapper, StyledTooltip } from "./style";

export const SampleFilteringTooltip = (): JSX.Element => {
  return (
    <StyledTooltip
      arrow
      leaveDelay={1000}
      title={
        <div>
          Changing your tree’s samples of interest default definitions will
          enable you to customize your tree.{" "}
          <Link
            href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees#customizing"
            target="_blank"
          >
            Learn More.
          </Link>
        </div>
      }
      placement="top"
    >
      <StyledInfoIconWrapper>
        <Icon sdsIcon="infoCircle" sdsSize="xs" sdsType="static" />
      </StyledInfoIconWrapper>
    </StyledTooltip>
  );
};
