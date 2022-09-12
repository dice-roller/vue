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

### Tailwind

If you're using [Tailwind](https://tailwindcss.com/) v3, you can use the pre-styled Tailwind component:

```vue
<script>
import { DiceRollerTailwind } from '@dice-roller/vue'
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

| Event | Arguments | Description |
| - | - | - |
| `notation:change` | `notation` - Current value of the notation input | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll` | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made |

### Bootstrap

If you're using [Bootstrap](https://getbootstrap.com/) v5, you can use the Bootstrap component:

```vue
<script>
import { DiceRollerBootstrap } from '@dice-roller/vue'
</script>

<template>
    <DiceRollerBootstrap />
</template>
```

The Bootstrap component is wrapped in a [card](https://getbootstrap.com/docs/5.2/components/card/), and uses other bootstrap components. It can be easily styled.

#### Component reference

##### Properties

| Property                | Type     | Default     | Description                                                  |
| ----------------------- | -------- | ----------- | ------------------------------------------------------------ |
| `bg-variant`            | `String` |             | Applies one of the Bootstrap theme colour variants to the background |
| `border-variant`        | `String` |             | Applies one of the Bootstrap theme colour variants to the border |
| `btn-label`             | `String` | `"Roll"`    | Text content to place in the button                          |
| `btn-variant`           | `String` | `"primary"` | Applies one of the Bootstrap theme colour variants to the button |
| `id`                    | `String` |             | The `id` attribute of the component                          |
| `notation`              | `String` |             | Notation string to set on the component                      |
| `output-bg-variant`     | `String` |             | Applies one of the Bootstrap theme colour variants to the background of the output container |
| `output-border-variant` | `String` |             | Applies one of the Bootstrap theme colour variants to the border of the output container |
| `output-text-variant`   | `String` |             | Applies one of the Bootstrap theme colour variants to the text of the output container |
| `output-variant`        | `String` |             | Applies one of the Bootstrap theme colour variants to the output container. This defines the background colour and contrasting text. See Bootstrap [Color & background](https://getbootstrap.com/docs/5.2/helpers/color-background/). |
| `text-variant`          | `String` |             | Applies one of the Bootstrap theme colour variants to the text |
| `variant`               | `String` |             | Applies one of the Bootstrap theme colour variants to the component. This defines the background colour and contrasting text. See Bootstrap [Color & background](https://getbootstrap.com/docs/5.2/helpers/color-background/). |

##### Slots

| Name     | Description                    |
| -------- | ------------------------------ |
| `button` | Content to place in the button |

##### Events

| Event | Arguments | Description |
| - | - | - |
| `notation:change` | `notation` - Current value of the notation input | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll` | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made |

### Plain HTML

There's also a basic component, which provides HTML markup, without any styling. It applies a class to the elements, so you can style it with your own CSS.

```vue
<script>
import { DiceRoller } from '@dice-roller/vue'
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

| Event | Arguments | Description |
| - | - | - |
| `notation:change` | `notation` - Current value of the notation input | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll` | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made |

### Renderless component

If you want to write your own HTML markup, you can use the renderless component instead. This provides the logic and functionality, without any markup, so you can build your own.

```vue
<script>
import { DiceRollerRenderless } from '@dice-roller/vue';
</script>

<template>
    <DiceRollerRenderless v-slot="{ currentNotation, error, output, roll, on, bind }">
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

| Event | Arguments | Description |
| - | - | - |
| `notation:change` | `notation` - Current value of the notation input | Change event triggered by the user interaction. Emitted after the notation is changed |
| `roll` | `notation` - Value of the rolled notation.<br>`value` - The response of the roll | Emitted after a roll is made |

## Development

### Customise configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

```sh
npm install @dice-roller/vue
```

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
