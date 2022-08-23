import { Icon } from "czifui";
import AlertAccordion from "src/components/AlertAccordion";

interface Props {
  filename: string;
}

export default function Success({ filename }: Props): JSX.Element {
  const title = `${filename} loaded`;
  const message =
    "We automatically filled in the metadata from your import in the fields below. Please double check and correct any errors.";
  return (
    <AlertAccordion
      intent="info"
      icon={<Icon sdsIcon="checkCircle" sdsSize="l" sdsType="iconButton" />}
      title={title}
      collapseContent={message}
    />
  );
}
