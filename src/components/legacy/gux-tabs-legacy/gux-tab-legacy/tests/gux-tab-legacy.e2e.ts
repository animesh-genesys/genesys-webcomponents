import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing';

describe('gux-tab-legacy', () => {
  let page: E2EPage;
  let element: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it('renders', async () => {
    await page.setContent(`
    <gux-tab-legacy></gux-tab-legacy>
    `);
    element = await page.find('gux-tab-legacy');
    expect(element).toHaveAttribute('hydrated');
  });
});
