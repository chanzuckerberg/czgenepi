import Link from "next/link";
import FeedbackIcon from "src/common/icons/feedback.svg";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "../../../../common/routes";
import UserMenu from "./components/UserMenu";
import {
  StyledDiv,
  StyledIconWrapper,
  StyledLink,
  UploadButton,
} from "./style";

export default function RightNav(): JSX.Element {
  const { data: userInfo } = useUserInfo();

  function LoggedInNav(): JSX.Element {
    return (
      <StyledDiv>
        <Link href={ROUTES.UPLOAD_STEP1} passHref>
          <a href="passHref">
            <UploadButton sdsType="secondary" sdsStyle="rounded">
              Upload
            </UploadButton>
          </a>
        </Link>
        <Link href="https://airtable.com/shr2SrkMN8DK1mLEK" passHref>
          <StyledLink href="passHref" target="_blank" rel="noreferrer">
            <StyledIconWrapper>
              <FeedbackIcon />
            </StyledIconWrapper>
          </StyledLink>
        </Link>

        <UserMenu user={userInfo?.name} />
      </StyledDiv>
    );
  }

  return <LoggedInNav />;
}
