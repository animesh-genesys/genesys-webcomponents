import { Component, h, JSX, Prop, Element } from '@stencil/core';
import { trackComponent } from '../../../usage-tracking';

import { GuxCardAccent } from './gux-card.types';

/**
 * @slot - Content of card.
 */

@Component({
  styleUrl: 'gux-card.less',
  tag: 'gux-card-beta',
  shadow: true
})
export class GuxCard {
  /*
   * Reference to the host element.
   */
  @Element()
  root: HTMLElement;

  /**
   * Card Accent.
   */
  @Prop()
  accent: GuxCardAccent = 'outline';

  componentWillLoad(): void {
    trackComponent(this.root);
  }

  render(): JSX.Element {
    return (<slot />) as JSX.Element;
  }
}
