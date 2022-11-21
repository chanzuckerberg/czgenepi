import { B } from "src/common/styles/basicStyle";
import { ContactUsLink } from "../../../../common/components/library/data_subview/components/ContactUsLink";

export const CreateNSTreeFailureNotif = (): JSX.Element => (
  <>
    <B>Something went wrong and we were unable to start your tree build.</B>{" "}
    <ContactUsLink />
  </>
);
