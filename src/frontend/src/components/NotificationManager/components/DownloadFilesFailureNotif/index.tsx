import { B } from "src/common/styles/basicStyle";
import { ContactUsLink } from "../../../../common/components/library/data_subview/components/ContactUsLink";

export const DownloadFilesFailureNotif = (): JSX.Element => (
  <>
    <B>
      Something went wrong and we were unable to complete one or more of your
      downloads.
    </B>{" "}
    <ContactUsLink />
  </>
);
