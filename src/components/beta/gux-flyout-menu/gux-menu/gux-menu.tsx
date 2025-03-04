import { Component, h, Host, JSX } from '@stencil/core';

/**
 * @slot - collection of menu-option, submenu elements
 */

@Component({
  styleUrl: 'gux-menu.less',
  tag: 'gux-menu'
})
export class GuxMenu {
  render(): JSX.Element {
    return (
      <Host role="menu">
        <slot />
        <div class="gux-arrow" data-popper-arrow />
      </Host>
    ) as JSX.Element;
  }
}
