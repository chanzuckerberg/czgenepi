import React from "react";
import { Metadata, Props as CommonProps } from "../../../common/types";
import Row from "./components/Row";

interface Props {
  metadata: CommonProps["metadata"];
  setMetadata: CommonProps["setMetadata"];
}

export default function Table({ metadata, setMetadata }: Props): JSX.Element {
  const handleRowMetadata = (id: string, sampleMetadata: Metadata) => {
    setMetadata({ ...metadata, [id]: sampleMetadata });
  };

  return (
    <div>
      Table
      <div>
        {metadata &&
          Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
            return (
              <Row
                key={sampleId}
                id={sampleId}
                metadata={sampleMetadata}
                handleMetadata={handleRowMetadata}
              />
            );
          })}
      </div>
    </div>
  );
}
