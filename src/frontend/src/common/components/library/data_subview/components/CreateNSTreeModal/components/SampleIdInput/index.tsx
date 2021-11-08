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
  const [inputDisplayValue, setInputDisplayValue] = useState<string>("");
  const [isInEditMode, setInEditMode] = useState<boolean>(true);
  const [isValidating, setValidating] = useState<boolean>(false);
  const [shouldShowAddButton, setShowAddButton] = useState<boolean>(false);
  const [idsInFlight, setIdsInFlight] = useState<string[]>([]);
  const [foundSampleIds, setFoundSampleIds] = useState<string[]>([]);
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);

  // clear the input
  useEffect(() => {
    if (shouldReset) {
      setInputValue("");
      setInputDisplayValue("");
      setInEditMode(true);
      setValidating(false);
      setShowAddButton(false);
      setIdsInFlight([]);
      setFoundSampleIds([]);
      setShouldValidate(false);
    }
  }, [shouldReset]);

  // whenever we change the input mode, let the parent know
  useEffect(() => {
    handleInputModeChange(isInEditMode);
  }, [handleInputModeChange, isInEditMode]);

  const parseInputIds = useCallback(() => {
    const tokens = inputValue.split(/[\n\t,]/g);
    const trimmedTokens = tokens.map((t) => t.trim());
    return compact(trimmedTokens);
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
        setInputDisplayValue("");
        setInEditMode(true);
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
      setInputDisplayValue(idsInFlight.join("\n"));

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
    setShowAddButton(true);
  };

  return (
    <>
      <InputInstructions />
      <StyledTextArea
        // TODO (mlila): should be replaced with sds InputText when available
        disabled={!isInEditMode}
        onChange={(e) => setInputValue(e?.target?.value)}
        onFocus={() => setShowAddButton(true)}
        fullWidth
        multiline
        variant="outlined"
        rows={3}
        size="small"
        value={isInEditMode ? inputValue : inputDisplayValue}
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
