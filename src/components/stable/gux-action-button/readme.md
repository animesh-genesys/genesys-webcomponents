# gux-action-button
An action button. In order to use this element toggle children must be slotted in.

Example usage
```html
  <gux-action-button text="Primary" accent="primary">
    <gux-list-item onclick="notify(event)">Test 1</gux-list-item>
    <gux-list-item onclick="notify(event)">Test 2</gux-list-item>
    <gux-list-item onclick="notify(event)">Test 3</gux-list-item>
    <gux-list-divider></gux-list-divider>
    <gux-list-item onclick="notify(event)">Test 4</gux-list-item>
  </gux-action-button>
```

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                         | Type                                                            | Default       |
| ---------- | ---------- | ----------------------------------- | --------------------------------------------------------------- | ------------- |
| `accent`   | `accent`   |                                     | `"danger" \| "ghost" \| "primary" \| "secondary" \| "tertiary"` | `'secondary'` |
| `disabled` | `disabled` | Disables the action button.         | `boolean`                                                       | `false`       |
| `isOpen`   | `is-open`  | It is used to open or not the list. | `boolean`                                                       | `false`       |
| `text`     | `text`     | The component text.                 | `string`                                                        | `undefined`   |
| `type`     | `type`     | The component button type           | `"button" \| "reset" \| "submit"`                               | `'button'`    |


## Events

| Event         | Description                                 | Type               |
| ------------- | ------------------------------------------- | ------------------ |
| `actionClick` | Triggered when the action button is clicked | `CustomEvent<any>` |
| `close`       | Triggered when the menu is close            | `CustomEvent<any>` |
| `open`        | Triggered when the menu is open             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [gux-popup](../gux-popup)
- [gux-button-slot-beta](../../beta/gux-button-slot)
- [gux-icon](../gux-icon)
- [gux-list](../gux-list)

### Graph
```mermaid
graph TD;
  gux-action-button --> gux-popup
  gux-action-button --> gux-button-slot-beta
  gux-action-button --> gux-icon
  gux-action-button --> gux-list
  style gux-action-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
