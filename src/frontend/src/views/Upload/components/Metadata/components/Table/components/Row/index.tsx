import deepEqual from "deep-equal";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  const {
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: metadata,
    mode: "onTouched",
  });

  const watchAllFields = watch();

  // DEBUG
  // DEBUG
  // DEBUG
  console.log("---errors", errors);

  useEffect(() => {
    if (!deepEqual(metadata, watchAllFields)) {
      handleMetadata(id, watchAllFields);
    }
  }, [watchAllFields]);

  return (
    <div>
      {id}
      <div>
        <DateField register={register} fieldKey="collectionDate" />
        <DateField register={register} fieldKey="sequencingDate" />
      </div>
    </div>
  );
}
