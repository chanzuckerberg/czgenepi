import { Button } from "czifui";
import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";

interface Props {
  fieldKey: keyof Metadata;
  value: unknown;
  handleClick: (fieldKey: keyof Metadata, value: unknown) => void;
}

export default function ApplyToAllColumn({
  fieldKey,
  value,
  handleClick: handleClickFromProps,
}: Props): JSX.Element {
  const handleClick = () => {
    handleClickFromProps(fieldKey, value);
  };

  return (
    <Button size="small" sdsType="primary" variant="text" onClick={handleClick}>
      APPLY TO ALL
    </Button>
  );
}
