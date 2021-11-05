import { Button } from "czifui";
import { compact, filter } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { validateSampleIdentifiers } from "src/common/queries/samples";
import { pluralize } from "src/common/utils/strUtils";
import { InputInstructions } from "./components/InputInstructions";
import { StyledLabel, StyledLoadingAnimation, StyledTextArea } from "./style";

interface Props {
  handleInputModeChange(isEditing: boolean): void;
  handleInputValidation(found: string[], missing: string[]): void;
  shouldReset?: boolean;
}

const SampleIdInput = ({
  handleInputModeChange,
  handleInputValidation,
  shouldReset,
}: Props): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isInEditMode, setInEditMode] = useState<boolean>(true);
  const [isValidating, setValidating] = useState<boolean>(false);
  const [shouldShowAddButton, setShowAddButton] = useState<boolean>(false);
  const [idsInFlight, setIdsInFlight] = useState<string[]>([]);
  const [foundSampleIds, setFoundSampleIds] = useState<string[]>([]);
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);

  useEffect(() => {
    if (shouldReset) {
      setInputValue("");
    }
  }, [shouldReset]);

  const parseInputIds = useCallback(() => {
    const tokens = inputValue.split(/[\n\t,]/g);
    return compact(tokens);
  }, [inputValue]);

  const validateSampleIdentifiersMutation = useMutation(
    validateSampleIdentifiers,
    {
      onError: () => {
        setValidating(false);
        setShowAddButton(false);
        setFoundSampleIds([]);
        setIdsInFlight([]);
        handleInputValidation([], []);
      },
      onSuccess: (data: any) => {
        setValidating(false);
        setShowAddButton(false);

        const missingIds = data["missing_sample_ids"];
        const foundIds = filter(idsInFlight, (id) => !missingIds.includes(id));

        setIdsInFlight([]);
        setFoundSampleIds(foundIds);
        handleInputValidation(foundIds, missingIds);
      },
    }
  );

  useEffect(() => {
    if (shouldValidate) {
      setShouldValidate(false);
      setValidating(true);
      setInEditMode(false);
      handleInputModeChange(false);

      if (idsInFlight.length > 0) {
        validateSampleIdentifiersMutation.mutate({
          sampleIdsToValidate: idsInFlight,
        });
      }
    }
  }, [idsInFlight, shouldValidate, validateSampleIdentifiersMutation]);

  const validateIds = () => {
    const sampleIdsToValidate = parseInputIds();
    setIdsInFlight(sampleIdsToValidate);
    setShouldValidate(true);
  };

  const onClickEdit = () => {
    setInEditMode(true);
    handleInputModeChange(true);
    setShowAddButton(true);
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
          {isValidating ? (
            <StyledLabel>
              <StyledLoadingAnimation />
              Adding
            </StyledLabel>
          ) : (
            "Add"
          )}
        </Button>
      )}
      {!isInEditMode && (
        <div>
          {foundSampleIds.length} {pluralize("Sample", foundSampleIds.length)}{" "}
          Added
          {!isValidating && (
            <Button sdsStyle="minimal" sdsType="primary" onClick={onClickEdit}>
              Edit
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export { SampleIdInput };
