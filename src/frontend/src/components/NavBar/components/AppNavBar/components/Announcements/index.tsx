import { ROUTES } from "src/common/routes";
import { Banner } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { B } from "src/common/styles/basicStyle";

export const Announcements = (): JSX.Element => {
  return (
    <>
      <Banner sdsType="primary">
        <B>
          We are updating our Privacy Policy to comply with CCPA, effective
          January 3, 2023.
        </B>{" "}
        &nbsp;
        <NewTabLink href={ROUTES.PRIVACY_PREVIEW} sdsStyle="dashed">
          Preview the updates.
        </NewTabLink>
      </Banner>
    </>
  );
};
