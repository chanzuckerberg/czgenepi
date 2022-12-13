import { useTreatments } from "@splitsoftware/splitio-react";
import Link from "next/link";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { HiddenLabel } from "src/common/styles/accessibility";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import RightNav from "../RightNav";
import { PathogenTabs } from "./components/PathogenTabs";
import { Announcements } from "./components/Announcements";
import { LeftNav, Logo, LogoAnchor, NavBar, Separator } from "./style";

/*
 * This nav bar is shown when a user is both authenticated and
 * viewing pages that are "inside" the application
 * aka behind auth logic
 */
const AppNavBar = (): JSX.Element => {
  const { data: userInfo } = useUserInfo();

  const flag = useTreatments([USER_FEATURE_FLAGS.multi_pathogen]);
  const isMultiPathogenFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.multi_pathogen
  );

  const route = userInfo ? ROUTES.DATA : ROUTES.HOMEPAGE;

  return (
    <>
      <NavBar data-test-id="navbar">
        <LeftNav>
          <HiddenLabel id="logo-label">CZ Gen Epi Logo. Go to data.</HiddenLabel>
          <Link href={route} passHref>
            <LogoAnchor aria-labelledby="logo-label" href="passHref">
              <Logo data-test-id="logo" aria-hidden="true" />
            </LogoAnchor>
          </Link>
          {isMultiPathogenFlagOn && (
            <>
              <Separator />
              <PathogenTabs />
            </>
          )}
        </LeftNav>
        <RightNav />
      </NavBar>
      <Announcements />
    </>
  );
};

export default AppNavBar;
