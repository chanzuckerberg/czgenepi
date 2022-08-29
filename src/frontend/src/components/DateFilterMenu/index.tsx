import { Menu, MenuItem } from "czifui";
import { useFormik } from "formik";
import { noop } from "lodash";
import { FC, useMemo } from "react";
import DateField from "src/components/DateField";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import * as yup from "yup";
import {
  ErrorMessageHolder,
  StyledButton,
  StyledDateRange,
  StyledErrorMessage,
  StyledManualDate,
  StyledText,
} from "./style";

const formatDateForDisplay = (d: DateType) => {
  if (d === undefined) return d;
  if (typeof d === "string") return d;

  return d.toISOString().substring(0, 10);
};

interface Props {
  anchorEl?: HTMLElement;
  fieldKeyEnd: string;
  fieldKeyStart: string;
  updateDateFilter: UpdateDateFilterType;
  menuOptions: DateMenuOption[];
  onClose(): void;
  onStartDateChange(date: FormattedDateType): void;
  onEndDateChange(date: FormattedDateType): void;
  selectedDateMenuOption: DateMenuOption | null;
  setSelectedDateMenuOption(o: DateMenuOption | null): void;
}

export const DateFilterMenu: FC<Props> = ({
  anchorEl,
  fieldKeyEnd,
  fieldKeyStart,
  updateDateFilter, // Don't directly call, use below `setDatesFromRange` instead
  menuOptions,
  onClose,
  onStartDateChange,
  onEndDateChange,
  selectedDateMenuOption,
  setSelectedDateMenuOption,
}) => {
  const validationSchema = useMemo(
    () =>
      yup.object({
        [fieldKeyEnd]: yup
          .string()
          .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
          .min(10, DATE_ERROR_MESSAGE)
          .max(10, DATE_ERROR_MESSAGE),
        [fieldKeyStart]: yup
          .string()
          .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
          .min(10, DATE_ERROR_MESSAGE)
          .max(10, DATE_ERROR_MESSAGE),
      }),
    [fieldKeyStart, fieldKeyEnd] // Should never actually change, but JIC
  );

  const formik = useFormik({
    initialValues: {
      [fieldKeyEnd]: undefined,
      [fieldKeyStart]: undefined,
    },
    onSubmit: noop,
    validationSchema,
  });

  // formik `isValid` actually gets set after `isValidating` goes back to false
  // So we have to check both to avoid visual flicker in Apply button.
  const { values, setFieldValue, isValid, isValidating, errors } = formik;

  const errorMessageFieldKeyStart = errors[fieldKeyStart];
  const errorMessageFieldKeyEnd = errors[fieldKeyEnd];

  // Use this over directly using `updateDateFilter` prop so we track filter changes.
  const setDatesFromRange: UpdateDateFilterType = (start, end) => {
    const newStartDate = formatDateForDisplay(start);
    const newEndDate = formatDateForDisplay(end);

    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);

    updateDateFilter(start, end);
    onClose();
  };

  const setDatesFromMenuOption = (dateOption: DateMenuOption) => {
    setSelectedDateMenuOption(dateOption);

    // Selecting a menu option clears out anything entered in the fields.
    setFieldValue(fieldKeyStart, undefined);
    setFieldValue(fieldKeyEnd, undefined);

    let start = undefined;
    if (dateOption.numDaysStartOffset) {
      start = new Date();
      start.setDate(start.getDate() - dateOption.numDaysStartOffset);
      start.setHours(0, 0, 0);
    }

    let end = undefined;
    if (dateOption.numDaysEndOffset) {
      end = new Date();
      end.setDate(end.getDate() - dateOption.numDaysEndOffset);
      end.setHours(23, 59, 59);
    }
    setDatesFromRange(start, end);
  };

  const setDatesFromFields: UpdateDateFilterType = (start, end) => {
    // Since using fields instead, clear out selected menu option
    setSelectedDateMenuOption(null);
    setDatesFromRange(start, end);
  };

  //TODO when it's available, use sds component for single select on preset date ranges
  return (
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <StyledManualDate>
        <StyledDateRange>
          <DateField fieldKey={fieldKeyStart} formik={formik} />
          <StyledText>to</StyledText>
          <DateField fieldKey={fieldKeyEnd} formik={formik} />
        </StyledDateRange>
        <ErrorMessageHolder>
          {errorMessageFieldKeyStart ? (
            <StyledErrorMessage>{errors[fieldKeyStart]}</StyledErrorMessage>
          ) : (
            <StyledErrorMessage />
          )}
          {errorMessageFieldKeyEnd ? (
            <StyledErrorMessage>{errors[fieldKeyEnd]}</StyledErrorMessage>
          ) : (
            <StyledErrorMessage />
          )}
        </ErrorMessageHolder>
        {(values[fieldKeyStart] || values[fieldKeyEnd]) && (
          <StyledButton
            sdsType="primary"
            sdsStyle="square"
            onClick={() => {
              const startValue = values[fieldKeyStart];
              const endValue = values[fieldKeyEnd];
              const start = startValue ? new Date(startValue) : undefined;
              const end = endValue ? new Date(endValue) : undefined;
              return setDatesFromFields(start, end);
            }}
            disabled={isValidating || !isValid}
          >
            Apply
          </StyledButton>
        )}
      </StyledManualDate>
      {/* TODO (mlila): use a single select here instead */}
      {menuOptions.map((dateOption: DateMenuOption) => (
        <MenuItem
          key={dateOption.name}
          onClick={() => setDatesFromMenuOption(dateOption)}
          selected={Boolean(selectedDateMenuOption?.name === dateOption.name)}
        >
          {dateOption.name}
        </MenuItem>
      ))}
    </Menu>
  );
};
