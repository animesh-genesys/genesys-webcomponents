import { CalendarModes } from '../../../common-enums';

export type GuxCalendarMode =
  | CalendarModes.Single
  | CalendarModes.Range
  | CalendarModes.PresetRange;

export interface IDateElement {
  class: string;
  date: Date;
  selected: boolean;
  disabled: boolean;
  hidden: boolean;
}
