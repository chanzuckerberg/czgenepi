import { B } from "src/common/styles/basicStyle";
import { ContactUsLink } from "../ContactUsLink";

export const CreateNSTreeFailureNotif = (): JSX.Element => (
  <>
    <B>Something went wrong and we were unable to start your tree build.</B>{" "}
    <ContactUsLink />
  </>
);
