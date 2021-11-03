import { Button } from "czifui";
import { compact, filter } from "lodash";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { validateSampleIdentifiers } from "src/common/queries/samples";
import { pluralize } from "src/common/utils/strUtils";
import { InputInstructions } from "./components/InputInstructions";
import { StyledTextArea } from "./style";

const SampleIdInput = (): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isInEditMode, setInEditMode] = useState<boolean>(true);
  const [isValidating, setValidating] = useState<boolean>(false);
  const [shouldShowAddButton, setShowAddButton] = useState<boolean>(false);
  const [idsInFlight, setIdsInFlight] = useState<string[]>([]);
  const [foundSampleIds, setFoundSampleIds] = useState<string[]>([]);
  // @ts-expect-error: this piece of state will be used when warning is implemented
  const [missingSampleIds, setMissingSampleIds] = useState<string[]>([]);

  const parseInputIds = () => {
    const tokens = inputValue.split(/[\n\t,]/g);
    return compact(tokens);
  };

  const validateSampleIdentifiersMutation = useMutation(
    validateSampleIdentifiers,
    {
      onError: () => {
        setValidating(false);
        setShowAddButton(false);
        setMissingSampleIds([]);
        setFoundSampleIds([]);
        setIdsInFlight([]);
      },
      onSuccess: (data: any) => {
        // set samples identifiers that were not found in the aspen
        // database as missing
        setValidating(false);
        setShowAddButton(false);

        const missingIds = data["missing_sample_ids"];
        const foundIds = filter(idsInFlight, (id) => !missingIds.includes(id));

        setMissingSampleIds(missingIds);
        setFoundSampleIds(foundIds);
        setIdsInFlight([]);
      },
    }
  );

  const validateIds = () => {
    setValidating(true);
    setInEditMode(false);

    const sampleIdsToValidate = parseInputIds();
    setIdsInFlight(sampleIdsToValidate);
    validateSampleIdentifiersMutation.mutate({ sampleIdsToValidate });
  };

  return (
    <>
      <InputInstructions />
      <StyledTextArea
        disabled={!isInEditMode}
        onChange={(e) => setInputValue(e?.target?.value)}
        onFocus={() => setShowAddButton(true)}
        fullWidth
        multiline
        variant="outlined"
        rows={3}
        size="small"
        value={inputValue}
      />
      {shouldShowAddButton && (
        <Button
          disabled={isValidating}
          onClick={validateIds}
          sdsStyle="square"
          sdsType="primary"
        >
          {/* TODO (mlila): add loading spinner */}
          {isValidating ? "Adding" : "Add"}
        </Button>
      )}
      {!isInEditMode && (
        <div>
          {foundSampleIds.length} {pluralize("Sample", foundSampleIds.length)}{" "}
          Added
          {!isValidating && (
            <Button
              sdsStyle="minimal"
              sdsType="primary"
              onClick={() => setInEditMode(true)}
            >
              Edit
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export { SampleIdInput };
