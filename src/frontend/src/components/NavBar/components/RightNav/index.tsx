import { Tooltip } from "czifui";
import FeedbackIcon from "src/common/icons/feedback.svg";
import { useUserInfo } from "src/common/queries/auth";
import { HiddenLabel } from "src/common/styles/accessibility";
import UserMenu from "./components/UserMenu";
import { StyledDiv, StyledIconWrapper, StyledLink } from "./style";

export default function RightNav(): JSX.Element {
  const { data: userInfo } = useUserInfo();

  function LoggedInNav(): JSX.Element {
    return (
      <StyledDiv>
        <HiddenLabel id="feedback-label">Submit issues or feedback</HiddenLabel>
        <Tooltip
          arrow
          title="Submit Issues or Feedback"
          sdsStyle="dark"
          placement="bottom"
        >
          <StyledLink
            aria-labelledby="feedback-label"
            href="https://airtable.com/shr2SrkMN8DK1mLEK"
            target="_blank"
            rel="noreferrer"
          >
            <StyledIconWrapper>
              <FeedbackIcon aria-hidden="true" />
            </StyledIconWrapper>
          </StyledLink>
        </Tooltip>
        <UserMenu user={userInfo?.name} />
      </StyledDiv>
    );
  }

  return <LoggedInNav />;
}
