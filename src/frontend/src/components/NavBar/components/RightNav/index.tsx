import cx from "classnames";
import Link from "next/link";
import React from "react";
import ENV from "src/common/constants/ENV";
import { useUserInfo } from "src/common/queries/auth";
import { API } from "../../../../common/api";
import { ROUTES } from "../../../../common/routes";
import style from "../../index.module.scss";
import UserMenu from "./components/UserMenu";
import { UploadButton } from "./style";

export default function RightNav(): JSX.Element {
  const { data } = useUserInfo();

  const user = data?.user;

  const signInLink = (
    <a href={ENV.API_URL + API.LOG_IN} data-test-id="navbar-sign-in-link">
      <div className={cx(style.item, style.link)}>Sign In</div>
    </a>
  );

  function IsLoggedIn(): JSX.Element {
    if (user) {
      return (
        <>
          <Link href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <UploadButton isRounded variant="outlined">
                Upload
              </UploadButton>
            </a>
          </Link>

          <UserMenu user={user.name} />
        </>
      );
    } else {
      return signInLink;
    }
  }

  return <IsLoggedIn />;
}
