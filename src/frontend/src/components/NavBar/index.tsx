import { useRouter } from "next/router";
import { publicPaths } from "src/common/routes";
import AppNavBar from "src/components/NavBar/components/AppNavBar";
import StaticPageNavBar from "src/components/NavBar/components/StaticPageNavBar";

const NavBar = (): JSX.Element => {
  const router = useRouter();

  // we show a different nav bar for paths in the app vs not in the app
  return publicPaths.includes(router.asPath) ? (
    <StaticPageNavBar />
  ) : (
    <AppNavBar />
  );
};

export default NavBar;
