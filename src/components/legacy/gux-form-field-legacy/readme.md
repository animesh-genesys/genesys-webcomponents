# gux-input



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type                                    | Default     |
| ---------------- | ------------------ | ----------- | --------------------------------------- | ----------- |
| `clearable`      | `clearable`        |             | `boolean`                               | `undefined` |
| `displayUnits`   | `display-units`    |             | `string`                                | `undefined` |
| `labelPosition`  | `label-position`   |             | `"above" \| "beside" \| "screenreader"` | `undefined` |
| `resize`         | `resize`           |             | `"auto" \| "manual" \| "none"`          | `undefined` |
| `valueInTooltip` | `value-in-tooltip` |             | `boolean`                               | `undefined` |


## Slots

| Slot      | Description                 |
| --------- | --------------------------- |
| `"input"` | Required slot for input tag |
| `"label"` | Required slot for label tag |


## Dependencies

### Depends on

- [gux-input-checkbox](./components/gux-input-checkbox)
- [gux-input-radio](./components/gux-input-radio)
- [gux-input-color](./components/gux-input-color)
- [gux-input-range](./components/gux-input-range)
- [gux-input-number](./components/gux-input-number)
- [gux-input-select](./components/gux-input-select)
- [gux-input-text-like](./components/gux-input-text-like)
- [gux-input-search](./components/gux-input-search)
- [gux-input-textarea](./components/gux-input-textarea)
- [gux-error-message-beta](../../beta/gux-error-message-beta)

### Graph
```mermaid
graph TD;
  gux-form-field-legacy --> gux-input-checkbox
  gux-form-field-legacy --> gux-input-radio
  gux-form-field-legacy --> gux-input-color
  gux-form-field-legacy --> gux-input-range
  gux-form-field-legacy --> gux-input-number
  gux-form-field-legacy --> gux-input-select
  gux-form-field-legacy --> gux-input-text-like
  gux-form-field-legacy --> gux-input-search
  gux-form-field-legacy --> gux-input-textarea
  gux-form-field-legacy --> gux-error-message-beta
  gux-input-color --> gux-icon
  gux-input-color --> gux-color-select
  gux-color-select --> gux-input-color-option
  gux-input-number --> gux-icon
  gux-input-select --> gux-icon
  gux-input-text-like --> gux-icon
  gux-input-search --> gux-icon
  gux-error-message-beta --> gux-icon
  style gux-form-field-legacy fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
