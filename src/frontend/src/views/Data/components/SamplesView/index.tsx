import { map } from "lodash";
import { useEffect, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useSampleInfo } from "src/common/queries/samples";

const SamplesView = (): JSX.Element => {
  // initialize state
  const [isDataLoading, setIsDataLoading] = useState(false);

  // load sample data from server
  const sampleResponse = useSampleInfo();
  const { data: samples, isLoading, isFetching } = sampleResponse;

  // determine whether we should show loading ui or interactive ui
  useEffect(() => {
    setIsDataLoading(true);

    if (isLoading || isFetching) return;

    setIsDataLoading(false);
  }, [isLoading, isFetching]);

  if (isDataLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      <HeadAppTitle subTitle="Samples" />
      {map(samples, (s) => (
        <div>{s.publicId}</div>
      ))}
    </>
  );
};

export { SamplesView };
