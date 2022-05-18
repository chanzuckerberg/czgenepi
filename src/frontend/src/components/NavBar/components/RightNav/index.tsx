import Link from "next/link";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "../../../../common/routes";
import UserMenu from "./components/UserMenu";
import { StyledDiv, UploadButton } from "./style";

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

        <UserMenu user={userInfo?.name} />
      </StyledDiv>
    );
  }

  return <LoggedInNav />;
}
