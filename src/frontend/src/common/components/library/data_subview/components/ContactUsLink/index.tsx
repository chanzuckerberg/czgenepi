import React from "react";
import { StyledNewTabLink } from "./style";

const ContactUsLink = (): JSX.Element => (
  <span>
    Please try again later or{" "}
    <StyledNewTabLink href="mailto:helloaspen@chanzuckerberg.com">
      contact us
    </StyledNewTabLink>{" "}
    for help.
  </span>
);

export { ContactUsLink };
