import library = require('@dice-roller/vue');
import dice = require('@dice-roller/rpg-dice-roller');

const roller = library.useDiceRoller({
  notation: '4d6',
  onRoll: (expression, result) => {
    expression satisfies string;
    result satisfies dice.Roll | null;
  },
});
roller.output.value satisfies dice.Roll | null;
roller.copy.isSupported satisfies boolean;
// @ts-expect-error Writable notation is a string in CommonJS too.
roller.currentNotation.value = false;
export const componentProps: InstanceType<
  typeof library.DiceRollerBootstrap
>['$props'] = { notation: '4d6' };

export const badCjsProps: InstanceType<typeof library.DiceRoller>['$props'] = {
  // @ts-expect-error Component props must also be checked in CommonJS.
  notation: 42,
};
