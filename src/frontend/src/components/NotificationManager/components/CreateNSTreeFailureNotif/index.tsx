import { ContactUsLink } from "src/common/components/library/data_subview/components/ContactUsLink";
import { B } from "src/common/styles/basicStyle";

export const CreateNSTreeFailureNotif = (): JSX.Element => (
  <>
    <B>Something went wrong and we were unable to start your tree build.</B>{" "}
    <ContactUsLink />
  </>
);
