import { Link, LinkProps } from "czifui";
import React from "react";

const NewTabLink = ({ children, ...props }: LinkProps): JSX.Element => {
  return (
    <Link target="_blank" rel="noopener" {...props}>
      {children}
    </Link>
  );
};

export { NewTabLink };
