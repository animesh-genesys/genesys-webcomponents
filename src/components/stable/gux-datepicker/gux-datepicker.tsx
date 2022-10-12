import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  JSX,
  Listen,
  Prop,
  State,
  Watch
} from '@stencil/core';
import { createPopper, Instance } from '@popperjs/core';

import { randomHTMLId } from '@utils/dom/random-html-id';
import { afterNextRenderTimeout } from '@utils/dom/after-next-render';
import {
  asIsoDateRange,
  asIsoDate,
  fromIsoDateRange,
  fromIsoDate
} from '@utils/date/iso-dates';
import { OnClickOutside } from '@utils/decorator/on-click-outside';

import { trackComponent } from '../../../usage-tracking';
import { CalendarModes } from '../../../common-enums';
import { buildI18nForComponent, GetI18nValue } from '../../../i18n';

import translationResources from './i18n/en.json';
import {
  GuxDatepickerMode,
  GuxDatepickerIntervalRange
} from './gux-datepicker.types';
import {
  getCalendarLabels,
  isOutOfBoundsDate,
  incrementDay,
  incrementMonth,
  incrementYear,
  getFormattedDate,
  getIntervalLetter,
  getFormatSeparator,
  getPreviousIntervalRange,
  getNextIntervalRange,
  getIntervalOrder,
  getIntervalRange
} from './gux-datepicker.service';

@Component({
  styleUrl: 'gux-datepicker.less',
  tag: 'gux-datepicker',
  shadow: true
})
export class GuxDatepicker {
  yearFormat: string = 'yyyy';
  intervalOrder: string[];
  datepickerElement: HTMLElement;
  inputElement: HTMLInputElement;
  toInputElement: HTMLInputElement;
  calendarElement: HTMLGuxCalendarElement;
  intervalRange: GuxDatepickerIntervalRange;
  focusedField: HTMLInputElement;
  /**
   * Indicates if the user is selecting the range with the mouse.
   * This prevents other events from processing on the input range.
   */
  isSelectingRangeWithMouse: boolean = false;
  lastIntervalRange: GuxDatepickerIntervalRange;
  lastYear: number = new Date().getFullYear();
  startInputId: string = randomHTMLId('gux-datepicker');
  endInputId: string = randomHTMLId('gux-datepicker');
  i18n: GetI18nValue;

  private popperInstance: Instance;

  @Element()
  root: HTMLElement;

  /**
   * The datepicker current value
   */
  @Prop({ mutable: true })
  value: string;

  /**
   * The datepicker label (can be a single label, or two separated by a comma if it's a range datepicker)
   */
  @Prop()
  label: string = '';

  /**
   * The datepicker number of months displayed
   */
  @Prop({ mutable: true })
  numberOfMonths: number = 1;

  /**
   * The min date selectable
   */
  @Prop()
  minDate: string = '';

  /**
   * The max date selectable
   */
  @Prop()
  maxDate: string = '';

  /**
   * The calendar mode (can be single or range)
   */
  @Prop()
  mode: GuxDatepickerMode = CalendarModes.Single;

  /**
   * The datepicker date format (default to mm/dd/yyyy, or specified)
   */
  @Prop()
  format: string = 'mm/dd/yyyy';

  /**
   * Disable the input and prevent interactions.
   */
  @Prop()
  disabled: boolean = false;

  /**
   * The datepicker current value
   */
  @State()
  formattedValue: string = '';

  @State()
  minDateDate: Date;

  @State()
  maxDateDate: Date;

  /**
   * The datepicker current value
   */
  @State()
  toFormattedValue: string = '';

  /**
   * Uses styling to control visibility of the calendar element
   */
  @State()
  active: boolean = false;

  @Watch('value')
  watchValue() {
    this.updateDate();
  }

  @Watch('minDate')
  watchMinDate(newDate: string) {
    if (newDate) {
      this.minDateDate = fromIsoDate(newDate);
    } else {
      this.minDateDate = null;
    }
  }

  @Watch('maxDate')
  watchMaxDate(newDate: string) {
    if (newDate) {
      this.maxDateDate = fromIsoDate(newDate);
    } else {
      this.maxDateDate = null;
    }
  }

  @Watch('format')
  watchFormat(newFormat: string) {
    if (!newFormat.includes('yyyy')) {
      this.yearFormat = 'yy';
    }

    this.intervalOrder = getIntervalOrder(newFormat);

    this.lastIntervalRange = this.initialIntervalRange;
  }

  @Watch('active')
  watchActiveCalendar(active: boolean) {
    if (active === true) {
      const startDateValue = fromIsoDate(this.value.split('/')[0]);
      // calendar should open to month containing the start date
      void this.calendarElement.resetCalendarView(startDateValue);
    }
  }

  /**
   * Triggered when user selects a date
   */
  @Event()
  input: EventEmitter<string>;

  @Listen('keydown', { passive: false })
  onKeyDown(event: KeyboardEvent) {
    if (this.isInputFieldEvent(event)) {
      this.focusedField = this.getInputFieldFromEvent(event);

      switch (event.key) {
        case 'Enter':
        case 'Escape':
          this.focusedField.blur();
          this.active = false;
          break;
        case 'Tab':
          // Allow default behavior of tabbing to the next element - the calendar toggle button
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.increment(-1);
          this.setCursorRange();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.increment(1);
          this.setCursorRange();
          break;
        case 'ArrowLeft': {
          event.preventDefault();

          const previousIntervalRange = getPreviousIntervalRange(
            this.format,
            this.intervalRange
          );
          this.setIntervalRange(previousIntervalRange);
          this.setCursorRange();
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();

          const nextIntervalRange = getNextIntervalRange(
            this.format,
            this.intervalRange
          );
          this.setIntervalRange(nextIntervalRange);
          this.setCursorRange();
          break;
        }
        default:
          event.preventDefault();
          if (!this.isSelectingRangeWithMouse) {
            this.setIntervalRange({
              selectionStart: this.focusedField.selectionStart,
              selectionEnd: this.focusedField.selectionEnd
            });
            this.updateIntervalValue(event);
            this.setCursorRange();
          }
          break;
      }
    } else {
      switch (event.key) {
        case 'Enter':
        case 'Escape':
        case ' ': {
          this.active = false;
          const button: HTMLButtonElement = this.root.shadowRoot.querySelector(
            '.gux-calendar-toggle-button'
          );
          afterNextRenderTimeout(() => {
            button.focus();
          });
          break;
        }
        case 'Tab':
          if (this.active) {
            this.active = false;
          }
          break;
      }
    }
  }

  @Listen('mousedown')
  onMouseDown(event: MouseEvent) {
    if (this.isInputFieldEvent(event)) {
      this.isSelectingRangeWithMouse = true;
    }

    const composedPath = event.composedPath();
    const inDatepicker = composedPath.includes(this.datepickerElement);

    const notToggleButton = Array.from(
      this.root.shadowRoot.querySelectorAll('.gux-calendar-toggle-button')
    ).every(
      (toggleButtonElement: HTMLButtonElement) =>
        !composedPath.includes(toggleButtonElement)
    );

    if (notToggleButton) {
      this.active = inDatepicker;
    }
  }

  @OnClickOutside({ triggerEvents: 'mousedown' })
  onClickOutside() {
    this.active = false;
  }

  /*********  Event Handlers  **********/

  onInputFocusIn(event: FocusEvent) {
    this.focusedField = this.getInputFieldFromEvent(event);
    if (!this.isSelectingRangeWithMouse) {
      // When focusing the input the Safari browser will fight for control of the cursor unless it is done asynchronously
      afterNextRenderTimeout(() => this.setRange());
    }
  }

  onInputFocusOut() {
    this.lastIntervalRange = this.initialIntervalRange;
  }

  onInputMouseUp(event: MouseEvent) {
    event.preventDefault();

    this.lastIntervalRange = getIntervalRange(
      this.format,
      getIntervalLetter(this.format, this.focusedField.selectionStart)
    );
    this.setRange();

    this.isSelectingRangeWithMouse = false;
  }

  /********  Other Methods  **********/

  isInputFieldEvent(event: Event): boolean {
    const composedPath = event.composedPath();

    return (
      composedPath.includes(this.inputElement) ||
      composedPath.includes(this.toInputElement)
    );
  }

  get initialIntervalRange() {
    return getIntervalRange(this.format, getIntervalLetter(this.format, 0));
  }

  getInputFieldFromEvent(event: Event): HTMLInputElement {
    const composedPath = event.composedPath();

    return composedPath[0] as HTMLInputElement;
  }

  updateIntervalValue(event: KeyboardEvent): void {
    const inputNumber = parseInt(event.key, 10);

    if (!isNaN(inputNumber)) {
      const currentSectionValue = this.focusedField.value.slice(
        this.focusedField.selectionStart,
        this.focusedField.selectionEnd
      );

      if (
        getIntervalLetter(this.format, this.focusedField.selectionStart) ===
          'y' &&
        this.yearFormat === 'yyyy'
      ) {
        this.typeYearValue(currentSectionValue, event.key);
      } else {
        if (this.canSetDate(inputNumber)) {
          this.updateSelection(
            this.focusedField,
            `${currentSectionValue[1]}${event.key}`
          );
          this.setValue();
        } else {
          this.updateSelection(
            this.focusedField,
            `0${event.key}`.replace('00', '01')
          );
          this.setValue();
        }
      }
    }
  }

  updateSelection(field: HTMLInputElement, text: string): void {
    field.value =
      field.value.substr(0, this.intervalRange.selectionStart) +
      text +
      field.value.substr(this.intervalRange.selectionEnd);
  }

  getCalendarLabels(): string[] {
    return getCalendarLabels(this.label, this.mode, [
      this.i18n('start'),
      this.i18n('end'),
      this.i18n('date')
    ]);
  }

  stringToDate(stringDate: string) {
    const formatSeparator = getFormatSeparator(this.format);
    const formatItems = this.format.toLowerCase().split(formatSeparator);
    const dateItems = stringDate.split(formatSeparator);
    const year = parseInt(dateItems[formatItems.indexOf(this.yearFormat)], 10);
    const month = parseInt(dateItems[formatItems.indexOf('mm')], 10) - 1;
    const day = parseInt(dateItems[formatItems.indexOf('dd')], 10);
    const date = new Date(year, month, day);

    if (
      this.yearFormat === 'yy' &&
      date.getFullYear() < 1970 &&
      this.lastYear > 1970
    ) {
      date.setFullYear(date.getFullYear() + 100);
    }

    return date;
  }

  onCalendarSelect(inputEvent: Event) {
    const calendar = inputEvent.target as HTMLGuxCalendarElement;
    this.value = calendar.value;
    inputEvent.stopPropagation(); // Don't let both events bubble.
    this.input.emit(this.value);
    this.updateDate();
    this.inputElement.value = this.formattedValue;
    if (
      this.mode === CalendarModes.Range ||
      this.mode === CalendarModes.PresetRange
    ) {
      this.toInputElement.value = this.toFormattedValue;
    }
    if (
      document.activeElement !== this.inputElement ||
      document.activeElement !== this.toInputElement
    ) {
      this.active = false;
    }
  }

  setValue() {
    if (
      this.mode === CalendarModes.Range ||
      this.mode === CalendarModes.PresetRange
    ) {
      const fromValue = this.stringToDate(this.inputElement.value);
      const toValue = this.stringToDate(this.toInputElement.value);
      this.value = asIsoDateRange(fromValue, toValue);
      this.updateDate();
      void this.calendarElement.setValue([fromValue, toValue]);
    } else {
      const date = this.stringToDate(this.inputElement.value);
      this.value = asIsoDate(date);
      this.updateDate();
      void this.calendarElement.setValue(date);
    }
    this.input.emit(this.value);
  }

  setRange() {
    this.setIntervalRange(this.lastIntervalRange);
    this.setCursorRange();
  }

  typeYearValue(selection: string, key: string) {
    if (selection[0] !== ' ') {
      this.updateSelection(this.focusedField, `   ${key}`);
    } else {
      this.updateSelection(this.focusedField, `${selection.substr(1)}${key}`);
      if (!(selection.substr(1) + key).includes(' ')) {
        this.setValue();
      }
    }
  }

  canSetDate(key: number) {
    const newValue = parseInt(
      [
        this.focusedField.value[this.intervalRange.selectionEnd - 1].toString(),
        key
      ].join(''),
      10
    );

    if (newValue) {
      switch (
        getIntervalLetter(this.format, this.focusedField.selectionStart)
      ) {
        case 'd': {
          const dateValue = fromIsoDate(this.value);
          if (
            newValue <=
            new Date(
              dateValue.getFullYear(),
              dateValue.getMonth() + 1,
              0
            ).getDate()
          ) {
            return true;
          }
          break;
        }
        case 'm':
          if (newValue <= 12) {
            return true;
          }
          break;
        case 'y':
          return true;
      }
    }

    return false;
  }

  getMapAndRegexFromField(value: Date) {
    const map: {
      dd: string;
      mm: string;
      yy?: string;
      yyyy?: string;
    } = {
      dd: `0${value.getDate()}`.slice(-2),
      mm: `0${value.getMonth() + 1}`.slice(-2)
    };
    if (this.yearFormat === 'yyyy') {
      map.yyyy = value.getFullYear().toString();
    } else {
      map.yy = value.getFullYear().toString().slice(-2);
    }
    const regexp = new RegExp(Object.keys(map).join('|'), 'gi');
    return {
      map,
      regexp
    };
  }

  updateDate() {
    if (
      this.mode === CalendarModes.Range ||
      this.mode === CalendarModes.PresetRange
    ) {
      const [from, to] = fromIsoDateRange(this.value);
      const { map: map1, regexp: regexp1 } = this.getMapAndRegexFromField(from);
      this.formattedValue = this.format.replace(regexp1, match => {
        return map1[match] as string;
      });
      const { map: map2, regexp: regexp2 } = this.getMapAndRegexFromField(to);
      this.toFormattedValue = this.format.replace(regexp2, match => {
        return map2[match] as string;
      });
    } else {
      const dateValue = fromIsoDate(this.value);
      const { map: map3, regexp: regexp3 } =
        this.getMapAndRegexFromField(dateValue);
      this.formattedValue = this.format.replace(regexp3, match => {
        return map3[match] as string;
      });
    }
  }

  /** Selects a range of the input text based on the intervalRange property. */
  setCursorRange() {
    if (this.intervalRange) {
      // If the selection is the same as what you are trying to set, setSelectionRange will deselect it.
      // To prevent this, the line below sets the selection to the full field before setting the range we actually want.
      this.focusedField.setSelectionRange(0, 100);

      // Select the range we want
      this.focusedField.setSelectionRange(
        this.intervalRange.selectionStart,
        this.intervalRange.selectionEnd
      );
    }
  }

  toggleCalendar() {
    this.active = !this.active;
    if (this.active) {
      afterNextRenderTimeout(() => {
        void this.calendarElement.focusPreviewDate();
      });
    }
  }

  setIntervalRange(intervalRange: GuxDatepickerIntervalRange): void {
    this.intervalRange = intervalRange;
  }

  getCombinedFocusedDateValue(): Date {
    return this.mode === CalendarModes.Range ||
      this.mode === CalendarModes.PresetRange
      ? this.getRangeFocusedDateValue()
      : this.getFocusedDateValue();
  }

  getFocusedDateValue(): Date {
    return fromIsoDate(this.value);
  }

  getRangeFocusedDateValue(): Date {
    const [start, end] = fromIsoDateRange(this.value);

    return this.focusedField === this.inputElement ? start : end;
  }

  increment(delta: number) {
    const interval = getIntervalLetter(
      this.format,
      this.focusedField.selectionStart
    );
    const focusedDateValue = this.getCombinedFocusedDateValue();

    let newDate: Date;

    switch (interval) {
      case 'd':
        newDate = incrementDay(delta, focusedDateValue);
        break;
      case 'm':
        newDate = incrementMonth(delta, focusedDateValue);
        break;
      case 'y':
        newDate = incrementYear(delta, focusedDateValue);
        break;
    }

    if (isOutOfBoundsDate(newDate, this.minDateDate, this.maxDateDate)) {
      newDate = focusedDateValue;
    }

    this.lastYear = newDate.getFullYear();

    this.setIntervalRange({
      selectionStart: this.focusedField.selectionStart,
      selectionEnd: this.focusedField.selectionEnd
    });

    this.focusedField.value = getFormattedDate(newDate, this.format);
    this.setValue();
  }

  async componentWillLoad() {
    trackComponent(this.root, { variant: this.mode });
    this.i18n = await buildI18nForComponent(this.root, translationResources);

    this.watchMinDate(this.minDate);
    this.watchMaxDate(this.maxDate);
    this.watchFormat(this.format);

    if (!this.value) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (
        this.mode === CalendarModes.Range ||
        this.mode === CalendarModes.PresetRange
      ) {
        this.value = asIsoDateRange(now, now);
      } else {
        this.value = asIsoDate(now);
      }
      if (
        (this.mode === CalendarModes.Range ||
          this.mode === CalendarModes.PresetRange) &&
        this.numberOfMonths < 2
      ) {
        this.numberOfMonths = 2;
      }
    }

    this.updateDate();
  }

  componentDidLoad() {
    this.popperInstance = createPopper(
      this.datepickerElement,
      this.calendarElement,
      {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -3]
            }
          }
        ],
        placement: 'bottom-start'
      }
    );
  }

  componentDidUpdate() {
    this.popperInstance?.forceUpdate();
  }

  disconnectedCallback(): void {
    this.popperInstance?.destroy();
  }

  renderCalendarToggleButton(): JSX.Element {
    return (
      <button
        class="gux-calendar-toggle-button"
        type="button"
        onClick={() => this.toggleCalendar()}
        aria-expanded={this.active.toString()}
        aria-label={this.i18n('toggleCalendar')}
        disabled={this.disabled}
      >
        <gux-icon decorative icon-name="calendar"></gux-icon>
      </button>
    ) as JSX.Element;
  }

  renderCalendar(): JSX.Element {
    return (
      <gux-calendar
        tabIndex={-1}
        ref={(el: HTMLGuxCalendarElement) => (this.calendarElement = el)}
        value={this.value}
        mode={
          this.mode === CalendarModes.Single
            ? CalendarModes.Single
            : CalendarModes.PresetRange
        }
        onInput={(event: CustomEvent) => this.onCalendarSelect(event)}
        minDate={this.minDate}
        maxDate={this.maxDate}
        numberOfMonths={this.numberOfMonths}
      />
    ) as JSX.Element;
  }

  renderCombinedField(): JSX.Element {
    if (this.mode === CalendarModes.PresetRange)
      return (
        <input
          id={this.endInputId}
          type="text"
          ref={(el: HTMLInputElement) => (this.toInputElement = el)}
          onMouseUp={e => this.onInputMouseUp(e)}
          onFocusin={e => this.onInputFocusIn(e)}
          onFocusout={() => this.onInputFocusOut()}
          value={this.toFormattedValue}
          disabled={this.disabled}
        />
      ) as JSX.Element;
  }

  addSeperator(): JSX.Element {
    return (<label>-</label>) as JSX.Element;
  }

  renderStartDateField(): JSX.Element {
    return (
      <div class="gux-datepicker-field">
        <label
          htmlFor={this.startInputId}
          class={{
            'gux-datepicker-field-label': true,
            'gux-sr-only': this.mode === CalendarModes.Single && !this.label
          }}
        >
          {this.getCalendarLabels()[0]}
        </label>
        <div class="gux-datepicker-field-input">
          <div
            class={{
              'gux-datepicker-field-text-input': true,
              'combined-input': this.mode === CalendarModes.PresetRange
            }}
          >
            <input
              id={this.startInputId}
              type="text"
              onClick={e => this.onInputMouseUp(e)}
              onFocusin={e => this.onInputFocusIn(e)}
              onFocusout={() => this.onInputFocusOut()}
              ref={(el: HTMLInputElement) => (this.inputElement = el)}
              value={this.formattedValue}
              disabled={this.disabled}
            />
            {this.addSeperator()}
            {this.renderCombinedField()}
            {this.renderCalendarToggleButton()}
          </div>
          {this.renderCalendar()}
        </div>
      </div>
    ) as JSX.Element;
  }

  renderEndDateField(): JSX.Element {
    if (
      this.mode === CalendarModes.Single ||
      this.mode === CalendarModes.PresetRange
    ) {
      return null;
    }

    return (
      <div class="gux-datepicker-field">
        <label htmlFor={this.endInputId} class="gux-datepicker-field-label">
          {this.getCalendarLabels()[1]}
        </label>
        <div class="gux-datepicker-field-input">
          <div class="gux-datepicker-field-text-input">
            <input
              id={this.endInputId}
              type="text"
              ref={(el: HTMLInputElement) => (this.toInputElement = el)}
              onMouseUp={e => this.onInputMouseUp(e)}
              onFocusin={e => this.onInputFocusIn(e)}
              onFocusout={() => this.onInputFocusOut()}
              value={this.toFormattedValue}
              disabled={this.disabled}
            />
            {this.renderCalendarToggleButton()}
          </div>
        </div>
      </div>
    ) as JSX.Element;
  }

  render(): JSX.Element {
    return (
      <div
        class={{
          'gux-datepicker': true,
          'gux-active': this.active,
          'gux-disabled': this.disabled
        }}
        ref={(el: HTMLElement) => (this.datepickerElement = el)}
      >
        {this.renderStartDateField()}
        {this.renderEndDateField()}
      </div>
    ) as JSX.Element;
  }
}
