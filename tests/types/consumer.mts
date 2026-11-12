import { ref } from 'vue';
import type { DiceRoll } from '@dice-roller/rpg-dice-roller';
import {
  DiceRoller,
  DiceRollerBootstrap,
  DiceRollerTailwind,
  DiceRollerRenderless,
  useDiceRoller,
} from '@dice-roller/vue';
import type {
  DiceRollerSlotProps,
  UseDiceRollerReturn,
} from '@dice-roller/vue';

const notation = ref('4d6');
const roller: UseDiceRollerReturn = useDiceRoller({
  notation,
  labels: () => ({ copied: 'Done' }),
  onNotationChange: (value) => {
    notation.value = value;
  },
  onRoll: (expression, result) => {
    expression satisfies string;
    result satisfies DiceRoll | null;
  },
});
roller.currentNotation.value = '2d6';
roller.output.value satisfies DiceRoll | null;
roller.copy.copied satisfies boolean;
roller.copy.copy() satisfies Promise<void>;
roller.on.input(new Event('input'));
// @ts-expect-error Notation is a string, not a number.
roller.currentNotation.value = 42;
// @ts-expect-error Label overrides have string values.
useDiceRoller({ labels: { copy: false } });
// @ts-expect-error Notation sources must contain strings.
useDiceRoller({ notation: ref(42) });

export const plainProps: InstanceType<typeof DiceRoller>['$props'] = {
  notation: '4d6',
  inputAttrs: { disabled: true, 'data-test': 'yes' },
};
export const tailwindProps: InstanceType<typeof DiceRollerTailwind>['$props'] =
  { labels: { copied: 'Done' } };
export const bootstrapProps: InstanceType<
  typeof DiceRollerBootstrap
>['$props'] = { btnVariant: 'primary' };
export const badProps: InstanceType<typeof DiceRoller>['$props'] = {
  // @ts-expect-error Component notation must be a string.
  notation: 42,
};
export const badEvent: InstanceType<typeof DiceRoller>['$props'] = {
  // @ts-expect-error Roll handlers receive DiceRoll or null, not a number.
  onRoll: (_: string, result: number) => result,
};
export type RenderlessSlot = Parameters<
  NonNullable<InstanceType<typeof DiceRollerRenderless>['$slots']['default']>
>[0];
export const slotContract = (slot: RenderlessSlot): DiceRollerSlotProps => slot;

export function checkSlot(slot: RenderlessSlot) {
  // @ts-expect-error The renderless slot exposes only its documented values.
  void slot.unknownSlotProperty;
  return slot.output?.total;
}
