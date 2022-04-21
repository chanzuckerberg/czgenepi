export const MENU_OPTIONS_UPLOAD_DATE: DateMenuOption[] = [
  {
    name: "Today",
    numDaysStartOffset: 0,
  },
  {
    name: "Yesterday",
    numDaysEndOffset: 1,
    numDaysStartOffset: 1,
  },
  {
    name: "Last 7 Days",
    numDaysStartOffset: 7,
  },
];

export const MENU_OPTIONS_COLLECTION_DATE: DateMenuOption[] = [
  {
    name: "Last 7 Days",
    numDaysStartOffset: 7,
  },
  {
    name: "Last 30 Days",
    numDaysStartOffset: 30,
  },
  // Average month has ~30.4 days, so that's why the non-round numbers
  {
    name: "Last 3 Months",
    numDaysStartOffset: 91,
  },
  {
    name: "Last 6 Months",
    numDaysStartOffset: 182,
  },
  {
    name: "Last Year",
    numDaysStartOffset: 365,
  },
];
