import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import DateField from "./components/DateField";

interface Props {
  id: string;
  metadata: Metadata;
  handleMetadata: (id: string, sampleMetadata: Metadata) => void;
}

export default function Row({
  id,
  metadata,
  handleMetadata,
}: Props): JSX.Element {
  const handleValue = (fieldKey: string, value: string) => {
    handleMetadata(id, { ...metadata, [fieldKey]: value });
  };

  return (
    <div>
      {id}
      <div>
        <DateField fieldKey="collectionDate" handleValue={handleValue} />
        <DateField fieldKey="sequencingDate" handleValue={handleValue} />
      </div>
    </div>
  );
}
