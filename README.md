<p align="center">
  <img src="https://dice-roller.github.io/documentation/dice-roller-logo.png" alt="RPG Dice Roller" width="200"/>
</p>

# RPG Dice Roller Vue Components

Vue components and a composable for rolling dice with [RPG Dice Roller](https://github.com/dice-roller/rpg-dice-roller). Use the Tailwind or Bootstrap component, style the plain HTML component yourself, or build your own interface with the composable or renderless component.

See the [dice roller documentation](https://dice-roller.github.io/documentation/) for supported notation.

## Installation

Requires Vue 3.5.45 or newer within Vue 3.

```sh
npm install @dice-roller/vue
```

Vue and `@dice-roller/rpg-dice-roller` are required peer dependencies. npm installs required peers automatically; with other package managers, ensure compatible versions are installed in your application.

## Quick start

This example uses the plain HTML component, which has no framework styles:

```vue
<script setup>
import { ref } from 'vue';
import { DiceRoller } from '@dice-roller/vue';

const notation = ref('4d6');

function onRoll(expression, result) {
  if (result) console.log(expression, result.total);
}
</script>

<template>
  <DiceRoller v-model:notation="notation" @roll="onRoll" />
</template>
```

Changing `notation` updates the input; it does not roll automatically. The user can roll with the button or Enter. The HTML components display results, validation errors and a copy button when clipboard support is available.

| Export                 | Use                                                    |
| ---------------------- | ------------------------------------------------------ |
| `DiceRoller`           | Plain HTML with CSS classes for your own styles        |
| `DiceRollerTailwind`   | Pre-styled with Tailwind CSS 3                         |
| `DiceRollerBootstrap`  | Styled with Bootstrap 5                                |
| `useDiceRoller`        | Rolling and clipboard logic for your own Vue interface |
| `DiceRollerRenderless` | The same logic exposed through a scoped slot           |

## Tailwind

Configure [Tailwind CSS 3](https://v3.tailwindcss.com/docs/installation) in your application, and include this package in its content paths:

```js
// tailwind.config.js — add to your existing content paths
export default {
  content: [
    './src/**/*.{vue,js,ts}',
    './node_modules/@dice-roller/vue/dist/*.js',
  ],
};
```

Your Tailwind stylesheet should include the usual directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```vue
<script setup>
import { DiceRollerTailwind } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerTailwind notation="4d6" />
</template>
```

The component's dark styles follow your Tailwind `darkMode` configuration.

### Customising colours

Set CSS variables globally, on an ancestor, or directly on an instance:

```css
.my-dice-theme {
  --dice-roller-primary: #7c3aed;
  --dice-roller-primary-hover: #6d28d9;
  --dice-roller-on-primary: #fff;
}
```

```vue
<DiceRollerTailwind class="my-dice-theme" notation="4d6" />
```

`primary` sets both button gradient stops, producing a solid button, and colours the result accent and input/button focus border and ring. `primary-hover` applies on hover and focus; it falls back to `primary`. Set `button-from`, `button-to`, `button-hover-from` and `button-hover-to` to customise the gradient instead.

All variable names below start with `--dice-roller-`. Where a dark default is listed, a corresponding `-dark` variable is available, such as `--dice-roller-input-surface-dark`. In dark mode, the dark variable takes precedence, followed by the base variable, then the dark default. Without overrides, the component uses the colours below.

| Variable                  | Default / fallback                              | Purpose                                               |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `primary`                 | Unset; uses the colours below                   | Shared button, output accent and focus colour         |
| `primary-hover`           | `primary`, then existing hover colours          | Button hover/focus colour                             |
| `on-primary`              | `#111827`; `#1f2937` on hover/focus             | Button text                                           |
| `surface`                 | `#f1f5f9` / dark `#4b5563`                      | Outer background                                      |
| `text`                    | `#1f2937` / dark `#e5e7eb`                      | Outer text                                            |
| `border`                  | `#d1d5db` / dark `#374151`                      | Input and button borders                              |
| `output-surface`          | `#fff` / dark `#1e293b`                         | Result background                                     |
| `output-text`             | `#000` / dark `#e2e8f0`                         | Result and copy icon text                             |
| `output-accent`           | `primary`, then `#d4f4c6` / dark `#6b8f63`      | Result's left border                                  |
| `input-surface`           | `#fff` / dark `#0f172a`                         | Input background                                      |
| `input-text`              | `#111827` / dark `#e2e8f0`                      | Input text                                            |
| `input-placeholder`       | `#6b7280` / dark `#94a3b8`                      | Input placeholder                                     |
| `input-placeholder-focus` | `#9ca3af` / dark `#94a3b8`                      | Focused input placeholder                             |
| `focus`                   | `primary`, then `#d4f4c6`                       | Input/button focus border and ring                    |
| `focus-outline`           | `#1f2937` / dark `#fff`                         | Keyboard focus outline for the input and both buttons |
| `error`                   | `#b91c1c` / dark `#fecaca`                      | Validation and copy error messages                    |
| `input-error-text`        | `error`, then `#b91c1c`                         | Invalid input text                                    |
| `input-error-border`      | `#fecaca`                                       | Invalid input border                                  |
| `input-error-surface`     | `#fef2f2`                                       | Invalid input background                              |
| `button-from`             | `primary`, then `#eda18b`                       | First button gradient stop                            |
| `button-to`               | `primary`, then `#d4f4c6`                       | Second button gradient stop                           |
| `button-hover-from`       | `primary-hover`, then `primary`, then `#e88c71` | First hover/focus gradient stop                       |
| `button-hover-to`         | `primary-hover`, then `primary`, then `#bbf0a3` | Second hover/focus gradient stop                      |
| `copy-surface`            | `#111827`                                       | Copied confirmation background                        |
| `copy-text`               | `#fff`                                          | Copied confirmation text                              |

## Bootstrap

Include Bootstrap's CSS in your application. If it is not already installed:

```sh
npm install bootstrap
```

```vue
<script setup>
import 'bootstrap/dist/css/bootstrap.min.css';
import { DiceRollerBootstrap } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerBootstrap notation="4d6" btn-variant="primary" />
</template>
```

The component uses Bootstrap's card, form and button styles. Bootstrap JavaScript is not required. It inherits Bootstrap's theme colours; where Bootstrap colour modes are available, set `data-bs-theme` on the component or an ancestor:

```vue
<DiceRollerBootstrap data-bs-theme="dark" notation="4d6" />
```

### Bootstrap props

These are additional to the shared component props below. Only `btn-variant` has a default (`primary`); other variants are unset by default.

| Prop                                      | Purpose                                                         | Accepted values                                                   |
| ----------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `variant`, `output-variant`               | Combined background and contrasting text for the card or result | Theme variants                                                    |
| `bg-variant`, `output-bg-variant`         | Card or result background                                       | Theme variants, `body`, `white`, `transparent`                    |
| `text-variant`, `output-text-variant`     | Card or result text                                             | Theme variants, `body`, `muted`, `white`, `black-50`, `white-50`  |
| `border-variant`, `output-border-variant` | Card or result border                                           | Theme variants, `white`                                           |
| `btn-variant`                             | Roll button style                                               | Theme variants, `outline-` followed by a theme variant, or `link` |

Theme variants are `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light` and `dark`.

## Plain HTML styling

`DiceRoller` uses `dice-roller` as its root class and as the prefix for its element classes. Set `class-name` to change both:

```vue
<DiceRoller class-name="my-roller" notation="4d6" />
```

For the default prefix, the element classes are:

- `dice-roller-input-group`, `dice-roller-label`, `dice-roller-input`, `dice-roller-input-invalid`
- `dice-roller-button`, `dice-roller-output`, `dice-roller-error`
- `dice-roller-copy-button`, `dice-roller-copy-icon`, `dice-roller-copy-label`, `dice-roller-copy-label-success`, `dice-roller-copy-status`

Provide your own CSS, including copy-icon sizing and visible keyboard focus. Use global styles or Vue's `:deep()` selectors when styling the component's children from a parent with scoped styles.

## Component API

### Props

These props apply to the three HTML components. The renderless component accepts only `notation` and `labels`.

| Prop          | Type                        | Default              | Description                                                           |
| ------------- | --------------------------- | -------------------- | --------------------------------------------------------------------- |
| `notation`    | `string`                    | Empty input          | Reactive notation source. Use `v-model:notation` for two-way binding. |
| `labels`      | `Partial<DiceRollerLabels>` | Default labels below | Overrides individual interface and error messages.                    |
| `btn-label`   | `string`                    | `Roll`               | Roll button text.                                                     |
| `id`          | `string`                    | Unset                | Container ID. The input receives its own generated ID.                |
| `input-attrs` | `DiceRollerInputAttrs`      | `{}`                 | Attributes passed to the notation input.                              |
| `class-name`  | `string`                    | `dice-roller`        | Root class and element-class prefix; `DiceRoller` only.               |

Ordinary attributes such as `class`, `style` and `data-*` are applied to the outer container. Pass input attributes separately:

```vue
<DiceRoller
  class="my-roller"
  :input-attrs="{ autocomplete: 'off', 'aria-describedby': 'notation-help' }"
/>
<p id="notation-help">Enter a dice expression, such as 4d6.</p>
```

The component manages the input's `id`, `value`, `type`, `name` and validation attributes. Existing `aria-describedby` references are preserved alongside validation messages. Setting `input-attrs.disabled` disables the input and roll button.

### Events

All four components emit these events:

| Event             | Arguments                                      | Description                                                             |
| ----------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `update:notation` | `notation: string`                             | Local notation changed; used by `v-model:notation`.                     |
| `notation:change` | `notation: string`                             | Local notation changed through user input.                              |
| `roll`            | `notation: string`, `result: DiceRoll \| null` | A roll was attempted. The result is `null` for an empty or failed roll. |

Parent-driven notation changes do not emit notation-change events. Results are dice roll objects; use `result.total` for the total or `String(result)` for the formatted result.

### Button slot

The HTML components provide a `button` slot to replace the roll button's content:

```vue
<DiceRoller notation="4d6">
  <template #button>Roll dice</template>
</DiceRoller>
```

### Labels

Pass any of these keys in `labels`; unspecified keys retain their defaults:

| Key               | Default                                          |
| ----------------- | ------------------------------------------------ |
| `notation`        | `Notation`                                       |
| `copy`            | `Copy to clipboard`                              |
| `copied`          | `Copied!`                                        |
| `copyError`       | `Unable to copy to clipboard. Please try again.` |
| `invalidNotation` | `Invalid notation`                               |
| `error`           | `An error has occurred`                          |

`invalidNotation` and `error` prefix the underlying error message.

## Composable

Call `useDiceRoller()` synchronously inside `setup()` or `<script setup>`. Each call creates independent state.

```vue
<script setup>
import { useId } from 'vue';
import { useDiceRoller } from '@dice-roller/vue';

const inputId = useId();
const { bind, on, roll, output, error, labels, copy } = useDiceRoller({
  notation: '4d6',
});
</script>

<template>
  <div>
    <label :for="inputId">{{ labels.notation }}</label>
    <input
      :id="inputId"
      v-bind="bind"
      v-on="on"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${inputId}-error` : undefined"
    />
    <button type="button" :disabled="!bind.value" @click="roll">Roll</button>
    <p v-if="error" :id="`${inputId}-error`" role="alert">{{ error }}</p>
    <output :for="inputId" aria-live="polite">{{ output }}</output>
    <button
      v-if="copy.isSupported && output"
      type="button"
      @click="copy.copy()"
    >
      {{ labels.copy }}
    </button>
    <span role="status">{{
      copy.error || (copy.copied ? labels.copied : '')
    }}</span>
  </div>
</template>
```

### Options

| Option                       | Description                                                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `notation`                   | String, ref or getter supplying the notation; `null` or `undefined` clears it. Defaults to an empty string. Reactive source changes update the local notation. |
| `labels`                     | Object, ref or getter supplying partial label overrides.                                                                                                       |
| `onNotationChange(notation)` | Called once per local edit through the input handlers, `setNotation()` or `currentNotation`. Source updates do not call it.                                    |
| `onRoll(notation, result)`   | Called after each roll attempt, with a dice roll object or `null` for an empty or failed roll.                                                                 |

A notation ref/getter is an input source, not an automatically updated model. Use the callback for two-way synchronisation:

```js
import { ref } from 'vue';
import { useDiceRoller } from '@dice-roller/vue';

const notation = ref('4d6');
const roller = useDiceRoller({
  notation,
  onNotationChange: (value) => {
    notation.value = value;
  },
});
```

For component props, pass getters such as `notation: () => props.notation` and `labels: () => props.labels` to retain reactivity.

### Return values

Destructure the return object in setup. Refs use `.value` in JavaScript and unwrap as top-level bindings in templates.

| Value                   | Type                  | Description                                                                   |
| ----------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `currentNotation`       | Writable computed ref | Editable notation. Assigning a different value calls `onNotationChange`.      |
| `setNotation(notation)` | Function              | Updates the local notation.                                                   |
| `output`                | Ref                   | Latest `DiceRoll`, or `null` before a roll and after an empty or failed roll. |
| `error`                 | Ref                   | Roll error message or `null`; cleared at the next roll attempt.               |
| `roll()`                | Function              | Rolls the current notation and updates the result/error state.                |
| `labels`                | Computed ref          | Resolved interface and error labels.                                          |
| `bind`                  | Computed ref          | `{ value: string }` input binding.                                            |
| `on`                    | Object                | `input`, `change` and `keydown` handlers for `v-on`.                          |
| `copy`                  | Reactive object       | Clipboard methods and state, described below.                                 |

Use `v-bind="bind"` and `v-on="on"` together. Alternatively, use `v-model="currentNotation"` with `@keydown="on.keydown"`. Enter rolls without submitting a surrounding form; held-key repeats and Enter during IME composition are ignored.

### Clipboard

The composable and renderless component expose the same `copy` object:

| Member        | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `copy()`      | Asynchronously copies the latest formatted result; does nothing without a result. |
| `isSupported` | Whether the browser provides the Clipboard API.                                   |
| `copied`      | `true` after a successful copy, resetting after 1.5 seconds.                      |
| `text`        | Last successfully copied text.                                                    |
| `error`       | Copy error message or `null`.                                                     |

Access state as `copy.copied`, `copy.error`, etc.; these values are already unwrapped. Destructuring those primitive properties loses reactivity. Clipboard access normally requires HTTPS or localhost and browser permission.

## Renderless component

`DiceRollerRenderless` renders only its default slot. It accepts `notation` and `labels`, supports `v-model:notation`, and emits the shared component events.

```vue
<script setup>
import { DiceRollerRenderless } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerRenderless
    notation="4d6"
    v-slot="{ bind, on, roll, output, error }"
  >
    <div>
      <label for="custom-notation">Notation</label>
      <input
        id="custom-notation"
        v-bind="bind"
        v-on="on"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'custom-error' : undefined"
      />
      <button type="button" :disabled="!bind.value" @click="roll">Roll</button>
      <p v-if="error" id="custom-error" role="alert">{{ error }}</p>
      <output for="custom-notation" aria-live="polite">{{ output }}</output>
    </div>
  </DiceRollerRenderless>
</template>
```

Use unique input and error IDs when rendering multiple instances.

### Default slot values

| Value             | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `currentNotation` | Current notation string.                                                     |
| `bind`            | `{ value: string }` binding for the notation input.                          |
| `on`              | `input`, `change` and `keydown` event handlers.                              |
| `roll`            | Function that rolls the current notation.                                    |
| `output`          | Latest `DiceRoll` object or `null`.                                          |
| `error`           | Roll error message or `null`.                                                |
| `labels`          | Resolved interface and error labels.                                         |
| `copy`            | Clipboard object with `copy()`, `isSupported`, `copied`, `text` and `error`. |

Slot values are already unwrapped; use them directly in the template.

## TypeScript

Declarations for the components, composable, events and slots are included. No separate types package is needed. Public types can be imported from the same entry point:

```ts
import type { DiceRollerLabels, UseDiceRollerOptions } from '@dice-roller/vue';

const labels: Partial<DiceRollerLabels> = { copy: 'Copy result' };
const options: UseDiceRollerOptions = { notation: '4d6', labels };
```

## Other import formats

CommonJS is also supported:

```js
const { DiceRoller, useDiceRoller } = require('@dice-roller/vue');
```

For direct browser scripts, load Vue and the dice roller library's UMD build and its required dependencies before `dist/vue.umd.cjs`. The Vue component package is available as `DiceRollerVue`; its dependencies must provide the globals `Vue` and `rpgDiceRoller`.
