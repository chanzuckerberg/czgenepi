import { useRouter } from "next/router";
import React from "react";
import { ROUTES } from "src/common/routes";
import AppNavBar from "src/components/NavBar/components/AppNavBar";
import StaticPageNavBar from "src/components/NavBar/components/StaticPageNavBar";

// we show a different nav bar for paths in the app vs not in the app
const pathsNotInApp: string[] = [
  ROUTES.HOMEPAGE,
  ROUTES.FAQ,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
];

const NavBar = (): JSX.Element => {
  const router = useRouter();
  return pathsNotInApp.includes(router.asPath) ? (
    <StaticPageNavBar />
  ) : (
    <AppNavBar />
  );
};

export default NavBar;
