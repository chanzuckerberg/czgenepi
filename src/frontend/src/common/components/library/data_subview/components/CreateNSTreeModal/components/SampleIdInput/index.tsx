import { compact, filter } from "lodash";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { INPUT_DELIMITERS } from "src/common/constants/inputDelimiters";
import {
  SampleValidationResponseType,
  useValidateSampleIds,
} from "src/common/queries/samples";
import { pluralize } from "src/common/utils/strUtils";
import { InputInstructions } from "./components/InputInstructions";
import {
  BaselineFlexContainer,
  FlexContainer,
  StyledAddButton,
  StyledEditButton,
  StyledLoadingAnimation,
  StyledSampleCount,
  StyledTextArea,
} from "./style";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [hasEverSubmittedSampleIds, setHasEverSubmittedSampleIds] =
    useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputDisplayValue, setInputDisplayValue] = useState<string>("");
  const [isInEditMode, setInEditMode] = useState<boolean>(true);
  const [isValidating, setValidating] = useState<boolean>(false);
  const [shouldShowAddButton, setShowAddButton] = useState<boolean>(false);
  const [idsInFlight, setIdsInFlight] = useState<string[]>([]);
  const [foundSampleIds, setFoundSampleIds] = useState<string[]>([]);
  const [missingSampleIds, setMissingSampleIds] = useState<string[]>([]);
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);

  // clear the input
  useEffect(() => {
    if (shouldReset) {
      setHasUnsavedChanges(false);
      setHasEverSubmittedSampleIds(false);
      setInputValue("");
      setInputDisplayValue("");
      setInEditMode(true);
      setValidating(false);
      setShowAddButton(false);
      setIdsInFlight([]);
      setFoundSampleIds([]);
      setMissingSampleIds([]);
      setShouldValidate(false);
    }
  }, [shouldReset]);

  // whenever we change the input mode, let the parent know. This controls
  // disabling the create button and tooltip associated with edit mode.
  // if they never clicked into the input, don't force them to add something
  // and save before moving forward
  useEffect(() => {
    const shouldShowEditingTooltip = hasUnsavedChanges && isInEditMode;
    handleInputModeChange(shouldShowEditingTooltip);
  }, [handleInputModeChange, hasUnsavedChanges, isInEditMode]);

  const parseInputIds = useCallback(() => {
    const tokens = inputValue.split(INPUT_DELIMITERS);
    const trimmedTokens = tokens.map((t) => t.trim());
    return compact(trimmedTokens);
  }, [inputValue]);

  // TODO (mlila): we don't actually surface this error to the user anywhere, but in the
  // TODO          future we probably should if this happens with any frequency.
  const validateSampleIdentifiersMutation = useValidateSampleIds({
    componentOnError: () => {
      setValidating(false);
      setShowAddButton(false);
      setFoundSampleIds([]);
      setMissingSampleIds([]);
      setIdsInFlight([]);
      handleInputValidation([], []);
      setInputDisplayValue("");
      setInEditMode(true);
    },
    componentOnSuccess: (data: SampleValidationResponseType) => {
      setValidating(false);
      setShowAddButton(false);
      setHasUnsavedChanges(false);

      const missingIds = data["missing_sample_ids"];
      const foundIds = filter(idsInFlight, (id) => !missingIds.includes(id));

      setIdsInFlight([]);
      setFoundSampleIds(foundIds);
      setMissingSampleIds(missingIds);
      handleInputValidation(foundIds, missingIds);
    },
  });

  useEffect(() => {
    if (shouldValidate) {
      setHasEverSubmittedSampleIds(true);
      setShouldValidate(false);
      setValidating(true);
      setInEditMode(false);
      setInputDisplayValue(idsInFlight.join("\n"));

      validateSampleIdentifiersMutation.mutate({
        sampleIdsToValidate: idsInFlight,
      });
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

  const onInputBlur = () => {
    if (!hasUnsavedChanges && !hasEverSubmittedSampleIds) {
      setShowAddButton(false);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value;
    setInputValue(value);
    setHasUnsavedChanges(!!value);
  };

  const numParsedSamples = foundSampleIds.length + missingSampleIds.length;

  return (
    <>
      <InputInstructions />
      <StyledTextArea
        // TODO (mlila): should be replaced with sds InputText when available
        disabled={!isInEditMode}
        onChange={onInputChange}
        onFocus={() => setShowAddButton(true)}
        onBlur={onInputBlur}
        fullWidth
        multiline
        variant="outlined"
        rows={!isInEditMode ? 4 : 3}
        value={isInEditMode ? inputValue : inputDisplayValue}
        placeholder="e.g. USA/CA-CZB-0000/2021, USA/CA-CDPH-000000/2021"
      />
      {shouldShowAddButton && (
        <StyledAddButton
          disabled={isValidating}
          onClick={validateIds}
          sdsStyle="square"
          sdsType="primary"
        >
          {isValidating ? (
            <FlexContainer>
              <StyledLoadingAnimation />
              Adding
            </FlexContainer>
          ) : (
            "Add"
          )}
        </StyledAddButton>
      )}
      {!isInEditMode && (
        <BaselineFlexContainer>
          <StyledSampleCount>
            {numParsedSamples} {pluralize("Sample", numParsedSamples)} Added
          </StyledSampleCount>
          {!isValidating && (
            <StyledEditButton
              sdsStyle="minimal"
              sdsType="primary"
              onClick={onClickEdit}
            >
              Edit
            </StyledEditButton>
          )}
        </BaselineFlexContainer>
      )}
    </>
  );
};

export { SampleIdInput };
