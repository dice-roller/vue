import library = require('@dice-roller/vue');
import dice = require('@dice-roller/rpg-dice-roller');

const roller = library.useDiceRoller({
  notation: '4d6',
  onRoll: (expression, result) => {
    expression satisfies string;
    result satisfies dice.DiceRoll | null;
  },
});
roller.output.value satisfies dice.DiceRoll | null;
roller.copy.isSupported satisfies boolean;
// @ts-expect-error Writable notation is a string in CommonJS too.
roller.currentNotation.value = false;
export const componentProps: InstanceType<
  typeof library.DiceRollerBootstrap
>['$props'] = { notation: '4d6' };
