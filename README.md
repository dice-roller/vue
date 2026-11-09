<p align="center">
    <img src="https://dice-roller.github.io/documentation/dice-roller-logo.png" alt="RPG Dice Roller" style="max-width: 100%;" width="200"/>
</p>

# RPG Dice Roller Vue Components

Vue.js component which allows rolling dice.

It is built upon this [RPG dice roller](https://github.com/dice-roller/rpg-dice-roller), and is used in the [documentation](https://dice-roller.github.io/documentation/).

## Get started

### Install

```sh
npm install @dice-roller/vue
```

### Package builds and dependency sharing

The package provides ESM and CommonJS builds through the same public imports. Import only the components or composable you need; ESM bundlers can remove unused components and icons:

```js
import { useDiceRoller } from '@dice-roller/vue';
// Or: import { DiceRollerTailwind } from '@dice-roller/vue';
```

For direct browser script usage, `dist/vue.umd.cjs` expects the globals `Vue` and `rpgDiceRoller`. Load Vue and the dice roller library's UMD build (including its own required dependencies) before this file. Its exported global remains `DiceRollerVue`.

### TypeScript

Type declarations are included for both ESM and CommonJS imports, covering component props, events, slots and the composable. JavaScript usage is unchanged; no separate types package is required.

```vue
<script setup lang="ts">
import { useDiceRoller } from '@dice-roller/vue';
import type { DiceRollerLabels } from '@dice-roller/vue';

const labels: Partial<DiceRollerLabels> = { copy: 'Copy result' };
const { currentNotation, output, roll } = useDiceRoller({
  notation: '4d6',
  labels,
});
// currentNotation is a writable string ref; output is DiceRoll | null.
</script>

<template>
  <input v-model="currentNotation" />
  <button type="button" @click="roll">Roll</button>
  <output>{{ output?.total }}</output>
</template>
```

The current v5 dice roller library has errors in its own declarations. TypeScript applications checking dependency declarations may need `skipLibCheck: true`; this project's source and consumer API examples are still checked in strict mode.

### Components

### Shared behaviour

All components accept reactive `notation` updates and support `v-model:notation`. The `notation:change` event is emitted for user edits. The `roll` event receives both the notation and the roll result (or `null` for an unsuccessful roll).

```vue
<script setup>
import { ref } from 'vue';
import { DiceRoller } from '@dice-roller/vue';

const notation = ref('4d6');
</script>

<template>
  <DiceRoller
    v-model:notation="notation"
    class="my-dice-roller"
    :input-attrs="{ 'aria-describedby': 'notation-help', autocomplete: 'off' }"
    :labels="{ notation: 'Dice expression', copy: 'Copy result' }"
  />
  <p id="notation-help">Enter a dice expression, such as 4d6.</p>
</template>
```

For the three HTML components, ordinary attributes such as `class`, `style`, and `data-*` are applied to the outer container. Use the `input-attrs` object for input attributes such as `aria-label`, `aria-describedby`, `autocomplete`, and `disabled`. The component manages the input's ID, value, type, name, and validation attributes; existing `aria-describedby` references are preserved alongside the error description.

Enter rolls the current notation without submitting a surrounding form. Repeated key presses and Enter during IME composition do not roll. Copy controls are also safe to use inside forms. Inputs are linked to validation messages, and roll results, errors, and copy status are announced to assistive technology. Custom styles and themes should retain visible keyboard focus and sufficient colour contrast.

The optional `labels` object is available on all four components. Each key can be overridden independently:

| Key               | Default                                          | Purpose                                  |
| ----------------- | ------------------------------------------------ | ---------------------------------------- |
| `notation`        | `Notation`                                       | Input label                              |
| `copy`            | `Copy to clipboard`                              | Copy button label and title              |
| `copied`          | `Copied!`                                        | Successful copy announcement             |
| `copyError`       | `Unable to copy to clipboard. Please try again.` | Failed copy message                      |
| `invalidNotation` | `Invalid notation`                               | Prefix before the parser's error message |
| `error`           | `An error has occurred`                          | Prefix before other roll error messages  |

The existing `btn-label` prop and `button` slot customise the roll button. Copy controls are provided by all three HTML components. The renderless component exposes the resolved `labels` and any clipboard failure as `copy.error` through its default slot, so custom interfaces can display and announce these themselves.

### Tailwind

If you're using [Tailwind](https://tailwindcss.com/) v3, you can use the pre-styled Tailwind component:

```vue
<script setup>
import { DiceRollerTailwind } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerTailwind />
</template>
```

#### Customising colours

The Tailwind component uses CSS custom properties for its colours. Its defaults include a pastel button gradient, light surfaces in light mode, and deep slate input and result surfaces in dark mode. No additional stylesheet or theme prop is needed.

Set variables in your global CSS to theme every instance:

```css
:root {
  --dice-roller-primary: #7c3aed;
  --dice-roller-primary-hover: #6d28d9;
  --dice-roller-on-primary: #fff;
}
```

`primary` colours the button, output accent and input/button focus border and ring. Setting it makes both button gradient stops the same colour, producing a solid button. `primary-hover` applies on hover and focus; if omitted, these use `primary` too. Keyboard focus outlines remain independently customisable.

Variables also inherit from a containing element, or can be set on one component using its `class` or `style`:

```vue
<DiceRollerTailwind
  style="--dice-roller-primary: #0369a1; --dice-roller-primary-hover: #075985; --dice-roller-on-primary: #fff"
/>
```

To keep a gradient, override the individual stops instead:

```css
.my-dice-theme {
  --dice-roller-button-from: #c4b5fd;
  --dice-roller-button-to: #bae6fd;
  --dice-roller-button-hover-from: #a78bfa;
  --dice-roller-button-hover-to: #7dd3fc;
}
```

```vue
<DiceRollerTailwind class="my-dice-theme" />
```

All names below have the prefix `--dice-roller-`. Colours accept normal CSS colour values, including your own `var(...)` references or Tailwind's `theme(...)` function in CSS processed by Tailwind.

| Variable                  | Default / fallback                              | Purpose                                               |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `primary`                 | Existing colours below                          | Shared button, output accent and focus colour         |
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

Where the table lists a distinct dark default, a corresponding `-dark` variable is available (for example, `--dice-roller-surface-dark`). In dark mode this takes precedence over the base variable, followed by the existing dark default. A base override therefore applies in both modes unless a `-dark` override is supplied.

Dark mode still follows your application's Tailwind v3 `darkMode` configuration. You can also override any base variables within your application's own dark theme selector. The component does not switch themes itself.

Make sure Tailwind scans the installed library so it generates the component's utility classes, including its variable-based colours:

```js
// tailwind.config.js (merge with your existing content paths)
export default {
  content: [
    './src/**/*.{vue,js,ts}',
    './node_modules/@dice-roller/vue/dist/*.js',
  ],
};
```

#### Component reference

##### Properties

| Property    | Type     | Default  | Description                             |
| ----------- | -------- | -------- | --------------------------------------- |
| `btn-label` | `String` | `"Roll"` | Text content to place in the button     |
| `id`        | `String` |          | The `id` attribute of the component     |
| `notation`  | `String` |          | Notation string to set on the component |

##### Slots

| Name     | Description                    |
| -------- | ------------------------------ |
| `button` | Content to place in the button |

##### Events

| Event             | Arguments                                                                        | Description                                                                           |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `notation:change` | `notation` - Current value of the notation input                                 | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll`            | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made                                                          |

### Bootstrap

If you're using [Bootstrap](https://getbootstrap.com/) v5, you can use the Bootstrap component:

```vue
<script setup>
import { DiceRollerBootstrap } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerBootstrap />
</template>
```

The Bootstrap component is wrapped in a [card](https://getbootstrap.com/docs/5.2/components/card/), and uses other bootstrap components. It can be easily styled.

With Bootstrap 5.3+, the component inherits the colour mode of its containing page or element. Set `data-bs-theme="dark"` or `data-bs-theme="light"` on an ancestor, or directly on the component:

```vue
<DiceRollerBootstrap data-bs-theme="dark" />
```

The playground's Bootstrap preview follows the system colour preference and updates when it changes. Applications can control their own Bootstrap theme independently.

#### Component reference

##### Properties

| Property                | Type     | Default     | Description                                                                                                                                                                                                                           |
| ----------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-variant`            | `String` |             | Applies one of the Bootstrap theme colour variants to the background                                                                                                                                                                  |
| `border-variant`        | `String` |             | Applies one of the Bootstrap theme colour variants to the border                                                                                                                                                                      |
| `btn-label`             | `String` | `"Roll"`    | Text content to place in the button                                                                                                                                                                                                   |
| `btn-variant`           | `String` | `"primary"` | Applies one of the Bootstrap theme colour variants to the button                                                                                                                                                                      |
| `id`                    | `String` |             | The `id` attribute of the component                                                                                                                                                                                                   |
| `notation`              | `String` |             | Notation string to set on the component                                                                                                                                                                                               |
| `output-bg-variant`     | `String` |             | Applies one of the Bootstrap theme colour variants to the background of the output container                                                                                                                                          |
| `output-border-variant` | `String` |             | Applies one of the Bootstrap theme colour variants to the border of the output container                                                                                                                                              |
| `output-text-variant`   | `String` |             | Applies one of the Bootstrap theme colour variants to the text of the output container                                                                                                                                                |
| `output-variant`        | `String` |             | Applies one of the Bootstrap theme colour variants to the output container. This defines the background colour and contrasting text. See Bootstrap [Color & background](https://getbootstrap.com/docs/5.2/helpers/color-background/). |
| `text-variant`          | `String` |             | Applies one of the Bootstrap theme colour variants to the text                                                                                                                                                                        |
| `variant`               | `String` |             | Applies one of the Bootstrap theme colour variants to the component. This defines the background colour and contrasting text. See Bootstrap [Color & background](https://getbootstrap.com/docs/5.2/helpers/color-background/).        |

##### Slots

| Name     | Description                    |
| -------- | ------------------------------ |
| `button` | Content to place in the button |

##### Events

| Event             | Arguments                                                                        | Description                                                                           |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `notation:change` | `notation` - Current value of the notation input                                 | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll`            | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made                                                          |

### Plain HTML

There's also a basic component, which provides HTML markup, without any styling. It applies a class to the elements, so you can style it with your own CSS.

```vue
<script setup>
import { DiceRoller } from '@dice-roller/vue';
</script>

<template>
  <DiceRoller />
</template>
```

#### Component reference

##### Properties

| Property     | Type     | Default         | Description                             |
| ------------ | -------- | --------------- | --------------------------------------- |
| `btn-label`  | `String` | `"Roll"`        | Text content to place in the button     |
| `class-name` | `String` | `"dice-roller"` | The class name of the component         |
| `id`         | `String` |                 | The `id` attribute of the component     |
| `notation`   | `String` |                 | Notation string to set on the component |

##### Slots

| Name     | Description                    |
| -------- | ------------------------------ |
| `button` | Content to place in the button |

##### Events

| Event             | Arguments                                                                        | Description                                                                           |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `notation:change` | `notation` - Current value of the notation input                                 | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll`            | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made                                                          |

### Composable

Use `useDiceRoller()` to build your own interface with the same rolling, validation, labels and clipboard behaviour as the components. Call it synchronously inside `setup()` or `<script setup>`. Each call creates independent state.

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
      type="text"
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

`bind` and `on` wire up input/change events and form-safe Enter handling, including IME composition and key-repeat guards. Alternatively, bind `v-model="currentNotation"` and `@keydown="on.keydown"` on your input.

#### Options

| Option                       | Description                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `notation`                   | Initial notation. Accepts a string, ref or getter; subsequent reactive source changes update the local notation silently. Defaults to an empty string. |
| `labels`                     | Partial overrides for the shared labels listed above. Accepts an object, ref or getter.                                                                |
| `onNotationChange(notation)` | Called once when the local notation changes through `currentNotation`, `setNotation()` or the input handlers. Reactive source updates do not call it.  |
| `onRoll(notation, result)`   | Called after every roll attempt. `result` is a dice roll object, or `null` for empty or unsuccessful rolls.                                            |

Pass a getter when using a reactive property, rather than passing its current value. A notation ref/getter is an input source: editing the local state does not automatically write back to it. Use `onNotationChange` for two-way synchronisation:

```js
import { ref } from 'vue';
import { useDiceRoller } from '@dice-roller/vue';

const notation = ref('4d6');
const roller = useDiceRoller({
  notation,
  onNotationChange: (value) => {
    notation.value = value;
  },
  onRoll: (expression, result) => {
    console.log(expression, result);
  },
});

// For component props: notation: () => props.notation
```

#### Return values

The return value is a plain object, so it can be destructured without losing reactivity. Refs use `.value` in JavaScript and unwrap automatically as top-level bindings in templates.

| Value                   | Type                  | Description                                                                                                                                                                 |
| ----------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currentNotation`       | Writable computed ref | Current editable notation; assigning to it calls `onNotationChange` when the value changes.                                                                                 |
| `setNotation(notation)` | Function              | Updates the local notation with the same behaviour as `currentNotation`.                                                                                                    |
| `output`                | Ref                   | Latest dice roll object, or `null` before a roll and after an empty or failed roll.                                                                                         |
| `error`                 | Ref                   | Localised roll error message, or `null`. Reset at the next roll attempt.                                                                                                    |
| `roll()`                | Function              | Rolls the current notation and updates `output`/`error`.                                                                                                                    |
| `labels`                | Computed ref          | Merged default and custom labels.                                                                                                                                           |
| `bind`                  | Computed ref          | Input attributes: `{ value: currentNotation }`, with the notation unwrapped.                                                                                                |
| `on`                    | Object                | `input`, `change` and `keydown` event handlers for `v-on`.                                                                                                                  |
| `copy`                  | Reactive object       | `copy()` writes the latest result to the clipboard; `copied`, `text`, `isSupported` and `error` describe the clipboard state. Successful feedback resets after 1.5 seconds. |

Keep clipboard state accessed as `copy.copied`, `copy.error`, etc. These properties are already unwrapped; destructuring their primitive values would lose reactivity. The clipboard feedback timer is cleaned up when the calling component unmounts.

The existing components retain their props, events and slots. The three visual components use the composable directly; `DiceRollerRenderless` remains available as a slot-based wrapper around the same logic.

### Renderless component

If you want to write your own HTML markup, you can use the renderless component instead. This provides the logic and functionality, without any markup, so you can build your own.

```vue
<script setup>
import { DiceRollerRenderless } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerRenderless
    v-slot="{ currentNotation, error, output, roll, on, bind }"
  >
    <div>
      <div v-if="error">{{ error }}</div>

      <input type="text" v-on="on" v-bind="bind" />

      <button type="button" @click="roll">Roll</button>

      <div>
        <strong>Notation:</strong> <em>{{ currentNotation }}</em>
      </div>

      <output v-if="output">{{ output }}</output>
    </div>
  </DiceRollerRenderless>
</template>
```

#### Component reference

##### Properties

| Property   | Type     | Default | Description                             |
| ---------- | -------- | ------- | --------------------------------------- |
| `notation` | `String` |         | Notation string to set on the component |

##### Slots

| Name      | Description              |
| --------- | ------------------------ |
| `default` | Content of the component |

##### Events

| Event             | Arguments                                                                        | Description                                                                           |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `notation:change` | `notation` - Current value of the notation input                                 | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll`            | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made                                                          |

## Development

### Customise configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

Use the Node version in `.nvmrc` (Node 24). Development tooling requires Node 22.22.2+, 24.15.0+, or 26+. Install the checkout's dependencies:

```sh
nvm use
npm ci
```

Vue is installed locally for development while remaining a peer dependency for consumers. Tailwind is updated within v3; migration to v4 is a separate change.

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

#### Type checking and tests

```sh
npm run typecheck
npm test
```

#### Code quality and CI

```sh
npm run lint
npm run format:check
```

`lint` and `format:check` do not modify files. Use `npm run lint:fix` and `npm run format` to apply fixes. CI runs linting, formatting, the build and regression tests on Node 22, 24 and 26. Development Vue is pinned to the minimum supported 3.5.0 so `vue-tsc` generates compatible declarations directly. A separate CI job checks those declarations and runtime behaviour with current compatible Vue. Tests are written in TypeScript; `npm test` checks the source, published ESM/CommonJS declarations and Vue consumer templates before running the behavioural tests. `npm run build` generates JavaScript bundles and declarations together.

### Component playground

`npm run dev` opens the playground. Bootstrap and Tailwind are installed through npm as development dependencies; the playground uses no framework CDN.

Each framework is scoped to its own preview component (`.bootstrap-preview` or `.tailwind-preview`) using PostCSS selector prefixes, including framework resets and document-level defaults. The examples render directly on the page, without iframes. The plain component has no framework styles.

The playground lives in `playground/`, separate from the published library in `src/`:

```sh
npm run build:playground
npm run preview
```

This builds into `playground-dist/`. `npm run build` continues to build only the library into `dist/`; preview styles and Bootstrap are not included in the published package.

Browser tests check style isolation, rolling and narrow layouts in both development and production:

```sh
npx playwright install chromium
npm run test:playground
```
