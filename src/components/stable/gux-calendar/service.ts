export type IPresetRange = {
  startDate: Date;
  endDate: Date;
};

export const enum Presets {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_SEVEN_DAYS = 'lastSevenDays',
  THIS_WEEK = 'thisWeek',
  LAST_WEEK = 'lastWeek',
  LAST_THIRTY_DAYS = 'lastThirtyDays',
  THIS_MONTH = 'thisMonth',
  LAST_MONTH = 'lastMonth'
}
