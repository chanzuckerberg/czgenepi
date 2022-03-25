import React, { useState } from "react";
import { pluralize } from "src/common/utils/strUtils";
import Notification from "src/components/Notification";

interface Props {
  importedFrom: string;
  numImportedSamples: number;
}

const ImportNotification = ({
  importedFrom,
  numImportedSamples,
}: Props): JSX.Element | null => {
  const [shouldShowNotification, setShouldShowNotification] =
    useState<boolean>(true);

  if (!numImportedSamples || numImportedSamples === 0) return null;

  return (
    <Notification
      autoDismiss
      buttonOnClick={() => setShouldShowNotification(false)}
      buttonText="DISMISS"
      dismissDirection="right"
      dismissed={!shouldShowNotification}
      intent="info"
    >
      {numImportedSamples} {pluralize("sample", numImportedSamples)} were
      successfully imported {importedFrom && "from"} {importedFrom} into CZ GEN
      EPI.
    </Notification>
  );
};

export { ImportNotification };
