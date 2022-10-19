import { ContactUsLink } from "src/common/components/library/data_subview/components/ContactUsLink";
import { B } from "src/common/styles/basicStyle";

export const DownloadFilesFailureNotif = (): JSX.Element => (
  <>
    <B>
      Something went wrong and we were unable to complete one or more of
      downloads.
    </B>{" "}
    <ContactUsLink />
  </>
);
