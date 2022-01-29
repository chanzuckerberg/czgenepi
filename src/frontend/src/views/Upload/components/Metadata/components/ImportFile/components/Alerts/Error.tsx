import React from "react";
import AlertAccordion from "src/components/AlertAccordion";
import { ERROR_CODE } from "src/views/Upload/components/common/types";
import { maybePluralize } from "./common/pluralize";
import { Td, Th } from "./common/style";
import { B } from "src/common/styles/support/style";

interface Props {
  names?: string[];
  errorCode?: ERROR_CODE;
}

const ERROR_CODE_TO_MESSAGE: Record<
  ERROR_CODE,
  ((props: MessageProps) => JSX.Element) | string
> = {
  [ERROR_CODE.INVALID_NAME]: InvalidNameMessage,
  [ERROR_CODE.MISSING_FIELD]: MissingFieldMessage,
  [ERROR_CODE.OVER_MAX_SAMPLES]: "placeholder",
  [ERROR_CODE.DEFAULT]: DefaultMessage,
};

export default function Error({
  names,
  errorCode = ERROR_CODE.DEFAULT,
}: Props): JSX.Element | null {
  if (!names) return null;

  const count = names.length;

  const errorCodeToTitle = {
    [ERROR_CODE.INVALID_NAME]: `Please double check the following ${maybePluralize(
      "sample",
      count
    )} to correct any errors before proceeding:`,
    [ERROR_CODE.MISSING_FIELD]: "Import Failed, file missing required field.",
    [ERROR_CODE.OVER_MAX_SAMPLES]: "placeholder",
    [ERROR_CODE.DEFAULT]:
      "Something went wrong, please try again or contact us!",
  };

  const title = errorCodeToTitle[errorCode];
  const Message = ERROR_CODE_TO_MESSAGE[errorCode];

  return (
    <AlertAccordion
      title={title}
      message={<Message names={names} />}
      severity="error"
    />
  );
}

interface MessageProps {
  names: string[];
}

function MissingFieldMessage({ names }: MessageProps) {
  return (
    <div>
      We were unable to find all of the required fields in your import file.
      Please check that your data fields match
      our <B>current metadata template</B> and try again.
      <table>
        <thead>
          <tr>
            <Th>Missing Data Fields</Th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <Row key={name} name={name} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvalidNameMessage({ names }: MessageProps) {
  return (
    <div>
      You can add the required data in the table below, or update your file and
      re-import.
      <table>
        <thead>
          <tr>
            <Th>Sample Private ID</Th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <Row key={name} name={name} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ name }: { name: string }) {
  return (
    <tr>
      <Td>{name}</Td>
    </tr>
  );
}

function DefaultMessage({ names }: MessageProps) {
  return (
    <div>
      Please see following for the related data:
      <table>
        <thead>
          <tr>
            <Th>Data name</Th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <Row key={name} name={name} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
