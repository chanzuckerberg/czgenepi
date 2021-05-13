import { Props } from "czifui";

export interface ExtraProps extends Props {
  narrow?: boolean;
}

export function narrow(props: ExtraProps): string {
  const { narrow } = props;

  if (!narrow) return "";

  return `
    width: 400px;
  `;
}
