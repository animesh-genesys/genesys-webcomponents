import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  JSX,
  Listen,
  Method,
  Prop,
  State
} from '@stencil/core';

import {
  actOnActiveOption,
  clearActiveOptions,
  goToOption,
  hasPreviousOption,
  hasNextOption,
  onClickedOption,
  setFirstOptionActive,
  setInitialActiveOption,
  setLastOptionActive,
  setNextOptionActive,
  setPreviousOptionActive,
  matchOption
} from './gux-listbox.service';

import { buildI18nForComponent, GetI18nValue } from '../../../i18n';
import { whenEventIsFrom } from '../../../utils/dom/when-event-is-from';
import simulateNativeEvent from '../../../utils/dom/simulate-native-event';
import { trackComponent } from '../../../usage-tracking';

import translationResources from './i18n/en.json';

/**
 * @slot - collection of gux-option elements
 */
@Component({
  styleUrl: 'gux-listbox.less',
  tag: 'gux-listbox',
  shadow: true
})
export class GuxListbox {
  private i18n: GetI18nValue;

  @Element()
  root: HTMLGuxListboxElement;

  @Prop({ mutable: true })
  value: string;

  @Prop()
  filter: string = '';

  @Prop()
  loading: boolean = false;

  @State()
  selectedValues: string[] = [];

  @State()
  listboxOptions: HTMLGuxOptionElement[] = [];

  @State()
  allListboxOptionsFiltered: boolean;

  @Event()
  internallistboxoptionsupdated: EventEmitter;

  @Listen('focus')
  onFocus(): void {
    setInitialActiveOption(this.root);
  }

  @Listen('blur')
  onBlur(): void {
    clearActiveOptions(this.root);
  }

  @Listen('keydown')
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        actOnActiveOption(this.root, value => this.updateValue(value));
        return;

      case 'ArrowDown':
        event.preventDefault();
        if (hasNextOption(this.root)) {
          event.stopPropagation();
          setNextOptionActive(this.root);
        } else {
          setFirstOptionActive(this.root);
        }
        return;

      case 'ArrowUp': {
        event.preventDefault();
        if (hasPreviousOption(this.root)) {
          event.stopPropagation();
          setPreviousOptionActive(this.root);
        } else {
          setLastOptionActive(this.root);
        }
        return;
      }

      case 'Home': {
        event.preventDefault();
        setFirstOptionActive(this.root);
        return;
      }

      case 'End': {
        event.preventDefault();
        setLastOptionActive(this.root);
        return;
      }

      case ' ': {
        event.preventDefault();
        return;
      }
    }

    if (event.key.length === 1) {
      goToOption(this.root, event.key);
      return;
    }
  }

  @Listen('keyup')
  onKeyup(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        actOnActiveOption(this.root, value => this.updateValue(value));
        return;
    }
  }

  @Listen('mousemove', {})
  onMousemove(): void {
    clearActiveOptions(this.root);
  }

  @Listen('click')
  onClick(event: MouseEvent): void {
    whenEventIsFrom('gux-option', event, (option: HTMLGuxOptionElement) => {
      onClickedOption(option, value => this.updateValue(value));
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxSelectActive(): Promise<void> {
    actOnActiveOption(this.root, value => this.updateValue(value));
  }

  private setListboxOptions(): void {
    if (this.value) {
      this.selectedValues = this.value.split(',');
    }
    this.listboxOptions = Array.from(
      this.root.children
    ) as HTMLGuxOptionElement[];
    this.internallistboxoptionsupdated.emit();
  }

  private updateValue(newValue: string): void {
    if (this.value !== newValue) {
      this.value = newValue;
    }

    simulateNativeEvent(this.root, 'input');
    simulateNativeEvent(this.root, 'change');
  }

  async componentWillLoad(): Promise<void> {
    trackComponent(this.root);
    this.i18n = await buildI18nForComponent(this.root, translationResources);

    this.setListboxOptions();
  }

  componentWillRender(): void {
    this.listboxOptions.forEach(listboxOption => {
      listboxOption.selected = listboxOption.value === this.value;
      listboxOption.filtered = !matchOption(listboxOption, this.filter);
    });

    this.allListboxOptionsFiltered =
      this.listboxOptions.filter(listboxOption => !listboxOption.filtered)
        .length === 0;

    if (this.filter) {
      setFirstOptionActive(this.root);
    }
  }

  // The slot must always be rendered so onSlotchange can be called
  renderHiddenSlot(): JSX.Element {
    return (
      <div hidden>
        <slot onSlotchange={() => this.setListboxOptions()} />
      </div>
    ) as JSX.Element;
  }

  renderLoading(): JSX.Element {
    return [
      <div class="gux-message-container">
        <gux-radial-loading context="modal"></gux-radial-loading>
        <span>{this.i18n('loading')}</span>
      </div>,
      this.renderHiddenSlot()
    ] as JSX.Element;
  }

  renderAllListboxOptionsFiltered(): JSX.Element {
    return [
      <div class="gux-message-container">
        <div class="gux-no-matches">{this.i18n('noMatches')}</div>
      </div>,
      this.renderHiddenSlot()
    ] as JSX.Element;
  }

  render(): JSX.Element {
    if (this.loading) {
      return this.renderLoading();
    }

    if (this.allListboxOptionsFiltered) {
      return this.renderAllListboxOptionsFiltered();
    }

    return (
      <Host role="listbox" tabindex={0}>
        <slot onSlotchange={() => this.setListboxOptions()} />
      </Host>
    ) as JSX.Element;
  }
}
