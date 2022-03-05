import { CommonThemeProps } from "czifui";

export interface ExtraProps extends CommonThemeProps {
  narrow?: boolean;
}

export function narrow(props: ExtraProps): string {
  const { narrow } = props;

  if (!narrow) return "";

  return `
    width: 400px;
  `;
}
