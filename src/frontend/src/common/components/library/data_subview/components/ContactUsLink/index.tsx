import { StyledNewTabLink } from "./style";

const ContactUsLink = (): JSX.Element => (
  <span>
    Please try again later or{" "}
    <StyledNewTabLink href="mailto:hello@czgenepi.org">
      contact us
    </StyledNewTabLink>{" "}
    for help.
  </span>
);

export { ContactUsLink };
