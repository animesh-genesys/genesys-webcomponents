import { Component, Element, h, JSX, Prop } from '@stencil/core';
import { trackComponent } from '../../../usage-tracking';

/**
 * @slot - Anchor element
 */
@Component({
  styleUrl: 'gux-anchor.less',
  tag: 'gux-anchor-beta',
  shadow: true
})
export class GuxAnchor {
  @Element()
  private root: HTMLElement;

  /**
   * True when anchor component is used within a table cell
   */
  @Prop()
  table: boolean = false;

  componentWillLoad() {
    trackComponent(this.root);
  }

  renderExternalLinkIcon() {
    if (this.root.querySelector('a').host !== window.location.host) {
      return (
        <gux-icon icon-name="external-link" decorative></gux-icon>
      ) as JSX.Element;
    }
  }

  render(): JSX.Element {
    return (
      <span
        class={{
          'gux-anchor': true,
          'gux-in-table': this.table
        }}
      >
        {this.renderExternalLinkIcon()}
        <slot />
      </span>
    ) as JSX.Element;
  }
}
