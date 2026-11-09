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

The existing `btn-label` prop and `button` slot customise the roll button. Copy controls are provided by the plain and Tailwind components. The renderless component exposes the resolved `labels` and any clipboard failure as `copy.error` through its default slot, so custom interfaces can display and announce these themselves.

### Tailwind

If you're using [Tailwind](https://tailwindcss.com/) v3, you can use the pre-styled Tailwind component:

```vue
<script>
import { DiceRollerTailwind } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerTailwind />
</template>
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
<script>
import { DiceRollerBootstrap } from '@dice-roller/vue';
</script>

<template>
  <DiceRollerBootstrap />
</template>
```

The Bootstrap component is wrapped in a [card](https://getbootstrap.com/docs/5.2/components/card/), and uses other bootstrap components. It can be easily styled.

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
<script>
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

### Renderless component

If you want to write your own HTML markup, you can use the renderless component instead. This provides the logic and functionality, without any markup, so you can build your own.

```vue
<script>
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

#### Tests

```sh
npm test
```

#### Code quality and CI

```sh
npm run lint
npm run format:check
```

`lint` and `format:check` do not modify files. Use `npm run lint:fix` and `npm run format` to apply fixes. CI runs linting, formatting, the build and regression tests on Node 22, 24 and 26. A separate job checks the minimum supported Vue 3.5.0.
