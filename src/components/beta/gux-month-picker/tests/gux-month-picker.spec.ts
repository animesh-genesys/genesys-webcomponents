import { newSpecPage } from '@stencil/core/testing';
import { GuxMonthPicker } from '../gux-month-picker';
import { GuxMonthCalendar } from '../gux-month-calendar/gux-month-calendar';
import { GuxMonthList } from '../gux-month-calendar/gux-month-list/gux-month-list';
import { GuxMonthListItem } from '../gux-month-calendar/gux-month-list/gux-month-list-item/gux-month-list-item';

const components = [
  GuxMonthPicker,
  GuxMonthCalendar,
  GuxMonthList,
  GuxMonthListItem
];
const language = 'en';

describe('gux-month-picker-beta', () => {
  it('should build', async () => {
    const html =
      '<gux-month-picker-beta value=2022-01></gux-month-picker-beta>';
    const page = await newSpecPage({ components, language, html });
    const component = page.rootInstance;

    expect(component).toBeInstanceOf(GuxMonthPicker);
  });

  describe('#render', () => {
    it(`should render the component as expected`, async () => {
      const html =
        '<gux-month-picker-beta value=2022-01></gux-month-picker-beta>';
      const page = await newSpecPage({ components, language, html });

      expect(page.root).toMatchSnapshot();
    });
  });
});
