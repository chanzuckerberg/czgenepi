import cx from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
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
    const router = useRouter();

    const isUploadRoute = router.asPath.includes(ROUTES.UPLOAD);

    if (user) {
      const uploadHref = isUploadRoute
        ? ROUTES.DATA_SAMPLES
        : ROUTES.UPLOAD_STEP1;

      const uploadText = isUploadRoute ? "Cancel Upload" : "Upload";

      return (
        <>
          <Link href={uploadHref} passHref>
            <a href="passHref">
              <UploadButton isRounded variant="outlined">
                {uploadText}
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
