import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  JSX,
  Listen,
  Method,
  Prop,
  State,
  writeTask
} from '@stencil/core';

import { buildI18nForComponent, GetI18nValue } from '../../../../i18n';
import { eventIsFrom } from '../../../../utils/dom/event-is-from';
import { randomHTMLId } from '../../../../utils/dom/random-html-id';

import tabsResources from '../i18n/en.json';

/**
 * @slot default - gux-icon (optional) and text node (required)
 * @slot dropdown-options - optional slot for tab options, must slot a gux-list element with gux-list-item children
 */

@Component({
  styleUrl: 'gux-tab-advanced.less',
  tag: 'gux-tab-advanced'
})
export class GuxTabAdvanced {
  private buttonElement: HTMLButtonElement;
  private tabOptionsButtonElement: HTMLButtonElement;
  private tooltipTitleElement: HTMLGuxTooltipTitleElement;
  private dropdownOptionsButtonId: string = randomHTMLId();
  private moveFocusDelay: number = 100;
  private tabTitle: string = '';
  private focusinFromClick: boolean = false;

  @Element()
  private root: HTMLElement;

  /**
   * unique id for the tab
   */
  @Prop()
  tabId: string;

  /**
   * indicates whether or not the tab is selected
   */
  @State()
  active: boolean = false;

  @Prop()
  guxDisabled: boolean = false;

  @State()
  private popoverHidden: boolean = true;

  @State()
  private hasAnimated: boolean = false;

  @Listen('focusin')
  onFocusin(event: FocusEvent) {
    if (
      !this.focusinFromClick &&
      (event.target as HTMLElement).classList.contains('gux-tab-button')
    ) {
      void this.tooltipTitleElement.setShowTooltip();
    }
  }

  @Listen('focusout')
  onFocusout(event: FocusEvent) {
    if (
      !this.root.querySelector('.gux-tab').contains(event.relatedTarget as Node)
    ) {
      this.popoverHidden = true;
    }
    if ((event.target as HTMLElement).classList.contains('gux-tab-button')) {
      void this.tooltipTitleElement.setHideTooltip();
    }
    this.focusinFromClick = false;
  }

  @Listen('keydown')
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
        if (eventIsFrom('.gux-tab-options-button', event)) {
          this.popoverHidden = false;
          this.focusFirstItemInPopupList();
        }
        break;
      case 'Escape':
        if (eventIsFrom('gux-list[slot="dropdown-options"]', event)) {
          event.stopPropagation();
          this.popoverHidden = true;
          setTimeout(() => {
            this.tabOptionsButtonElement?.focus();
          }, this.moveFocusDelay);
        }
        break;
    }
  }

  @Listen('keyup')
  onKeyup(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        if (eventIsFrom('.gux-tab-options-button', event)) {
          this.focusFirstItemInPopupList();
        }
    }
  }

  @Listen('click')
  onClick(event: MouseEvent) {
    if (eventIsFrom('.gux-tab-options-button', event)) {
      return;
    }
    if (!this.active && !this.guxDisabled) {
      this.internalactivatetabpanel.emit(this.tabId);
    }
  }

  @Listen('mousedown')
  onMouseDown() {
    this.focusinFromClick = true;
  }

  @Event()
  internalactivatetabpanel: EventEmitter<string>;

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxSetActive(active: boolean): Promise<void> {
    this.active = active;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxGetActive() {
    return this.active;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method()
  async guxFocus(): Promise<void> {
    this.buttonElement.focus();
  }

  private get hasDropdownOptions(): boolean {
    return Boolean(
      this.root.querySelector('gux-list[slot="dropdown-options"]')
    );
  }

  private focusFirstItemInPopupList(): void {
    const listElement: HTMLGuxListElement = this.root.querySelector(
      'gux-list[slot="dropdown-options"]'
    );
    setTimeout(() => {
      void listElement?.guxFocusFirstItem();
    }, this.moveFocusDelay);
  }

  private toggleOptions(): void {
    this.popoverHidden = !this.popoverHidden;
  }

  private onSelectDropdownOption(e: MouseEvent): void {
    this.popoverHidden = true;
    e.stopPropagation();
    setTimeout(() => {
      this.tabOptionsButtonElement.focus();
    }, this.moveFocusDelay);
  }

  private i18n: GetI18nValue;

  async componentWillLoad(): Promise<void> {
    this.i18n = await buildI18nForComponent(this.root, tabsResources);
  }

  componentDidLoad(): void {
    this.tabTitle = this.root
      .querySelector('gux-tooltip-title')
      .textContent.trim();
    if (!this.hasAnimated) {
      writeTask(() => {
        this.root.querySelector('.gux-tab').classList.add('gux-show');
        this.hasAnimated = true;
      });
    }
  }

  private popoverOnClick(e: MouseEvent): void {
    e.stopPropagation();
  }

  private getDropdownOptions(): JSX.Element {
    if (this.hasDropdownOptions) {
      return [
        <button
          id={this.dropdownOptionsButtonId}
          aria-expanded={(!this.popoverHidden).toString()}
          type="button"
          class="gux-tab-options-button"
          ref={el => (this.tabOptionsButtonElement = el)}
          onClick={() => this.toggleOptions()}
          tabIndex={this.active ? 0 : -1}
          disabled={this.guxDisabled}
        >
          <gux-icon
            icon-name="menu-kebab-vertical"
            screenreader-text={this.i18n('options', {
              tabTitle: this.tabTitle
            })}
          ></gux-icon>
        </button>,
        <gux-popover-list
          position="top-end"
          for={this.dropdownOptionsButtonId}
          displayDismissButton={false}
          hidden={this.popoverHidden}
          closeOnClickOutside={true}
          onGuxdismiss={() => (this.popoverHidden = true)}
          onClick={(e: MouseEvent) => this.popoverOnClick(e)}
        >
          <div
            class="gux-dropdown-option-container"
            onClick={(e: MouseEvent) => this.onSelectDropdownOption(e)}
          >
            <slot name="dropdown-options" />
          </div>
        </gux-popover-list>
      ] as JSX.Element;
    }

    return null;
  }

  render(): JSX.Element {
    return [
      <div
        class={{
          'gux-tab': true,
          'gux-selected': this.active,
          'gux-dropdown-options': this.hasDropdownOptions,
          'gux-disabled': this.guxDisabled
        }}
      >
        <button
          class="gux-tab-button"
          type="button"
          role="tab"
          aria-selected={this.active.toString()}
          aria-disabled={this.guxDisabled.toString()}
          aria-controls={`gux-${this.tabId}-panel`}
          ref={el => (this.buttonElement = el)}
          tabIndex={this.active ? 0 : -1}
          id={`gux-${this.tabId}-tab`}
        >
          <gux-tooltip-title ref={el => (this.tooltipTitleElement = el)}>
            <span>
              <slot />
            </span>
          </gux-tooltip-title>
        </button>

        {this.getDropdownOptions()}
      </div>
    ] as JSX.Element;
  }
}
