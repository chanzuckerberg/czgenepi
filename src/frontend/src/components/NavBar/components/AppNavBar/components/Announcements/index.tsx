import { ROUTES } from "src/common/routes";
import { Banner } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { B } from "src/common/styles/basicStyle";

const PRIVACY_BANNER_EXPIRATION = "2023-02-01T00:00:00";

export const Announcements = (): JSX.Element => {
  // Remove on or after Feb 1, 2023
  const shouldRenderPrivacyBanner = () => {
    const today = new Date();
    const expirationDate = new Date(PRIVACY_BANNER_EXPIRATION);
    return today.getTime() < expirationDate.getTime();
  };

  const renderPrivacyBanner = () => (
    <>
      <Banner sdsType="primary">
        <B>
          We are updating our Privacy Policy to comply with CCPA, effective
          January 3, 2023.
        </B>{" "}
        &nbsp;
        <NewTabLink href={ROUTES.PRIVACY} sdsStyle="dashed">
          View the updates.
        </NewTabLink>
      </Banner>
    </>
  );

  return <>{shouldRenderPrivacyBanner() && renderPrivacyBanner()}</>;
};
