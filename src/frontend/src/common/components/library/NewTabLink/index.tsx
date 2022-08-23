import { Link, LinkProps } from "czifui";

const NewTabLink = ({ children, ...props }: LinkProps): JSX.Element => {
  return (
    <Link target="_blank" rel="noopener" {...props}>
      {children}
    </Link>
  );
};

export { NewTabLink };
