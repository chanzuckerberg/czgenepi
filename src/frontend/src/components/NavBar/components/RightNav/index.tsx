import Link from "next/link";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "../../../../common/routes";
import UserMenu from "./components/UserMenu";
import { UploadButton } from "./style";

export default function RightNav(): JSX.Element {
  const { data } = useUserInfo();
  const user = data;

  function LoggedInNav(): JSX.Element {
    return (
      <>
        <Link href={ROUTES.UPLOAD_STEP1} passHref>
          <a href="passHref">
            <UploadButton sdsType="secondary" sdsStyle="rounded">
              Upload
            </UploadButton>
          </a>
        </Link>

        <UserMenu user={user?.name} />
      </>
    );
  }

  return <LoggedInNav />;
}
