import type { DiceRoll } from '@dice-roller/rpg-dice-roller';
import type { DiceRollerSlotProps } from '@dice-roller/vue';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

const require = createRequire(import.meta.url);
const diceLibraries: Record<
  string,
  typeof import('@dice-roller/rpg-dice-roller')
> = {
  ESM: await import('@dice-roller/rpg-dice-roller'),
  CommonJS: require('@dice-roller/rpg-dice-roller'),
};
const entrypoints: Record<string, typeof import('@dice-roller/vue')> = {
  ESM: await import('@dice-roller/vue'),
  CommonJS: require('@dice-roller/vue'),
};

for (const [format, library] of Object.entries(entrypoints)) {
  test(`${format}: package exports preserve the public component API`, () => {
    assert.deepEqual(Object.keys(library).sort(), [
      'DiceRoller',
      'DiceRollerBootstrap',
      'DiceRollerRenderless',
      'DiceRollerTailwind',
      'useDiceRoller',
    ]);
  });

  test(`${format}: composable works during SSR without browser globals`, async () => {
    const html = await renderToString(
      createSSRApp({
        setup() {
          const { output, roll } = library.useDiceRoller({ notation: '2d1' });
          roll();
          return () => h('output', String(output.value));
        },
      }),
    );
    assert.equal(html, '<output>2d1: [1, 1] = 2</output>');
  });

  test(`${format}: rolls share the consumer's number-generator configuration`, async () => {
    const { DiceRoll, NumberGenerator } = diceLibraries[format];
    const original = NumberGenerator.generator.engine;
    try {
      for (const [engine, total] of [
        [NumberGenerator.engines.min, 2],
        [NumberGenerator.engines.max, 12],
      ] as const) {
        NumberGenerator.generator.engine = engine;
        const captured: { result: DiceRoll | null } = { result: null };
        await renderToString(
          createSSRApp({
            setup() {
              const { roll, output } = library.useDiceRoller({
                notation: '2d6',
              });
              roll();
              captured.result = output.value;
              return () => h('div');
            },
          }),
        );
        assert.ok(captured.result instanceof DiceRoll);
        assert.equal(captured.result!.total, total);
      }
    } finally {
      NumberGenerator.generator.engine = original;
    }
  });

  test(`${format}: dice roller library handles maths, modifiers and random rolls`, async () => {
    for (const [notation, min, max] of [
      ['2d1+3*2', 8, 8],
      ['floor(5/2)', 2, 2],
      ['4d1kh3+2', 5, 5],
      ['4d6kh3+2', 5, 20],
    ] as const) {
      let roll!: () => void;
      const captured: { result: DiceRoll | null } = { result: null };
      await renderToString(
        createSSRApp({
          render: () =>
            h(
              library.DiceRollerRenderless,
              {
                notation,
                onRoll: (_: string, value: DiceRoll | null) =>
                  (captured.result = value),
              },
              {
                default: (state: DiceRollerSlotProps) => {
                  roll = state.roll;
                  return h('div');
                },
              },
            ),
        }),
      );
      await roll();
      assert.ok(captured.result instanceof diceLibraries[format].DiceRoll);
      assert.ok(captured.result, `Expected a result for ${notation}`);
      assert.ok(
        captured.result!.total >= min && captured.result!.total <= max,
        notation,
      );
    }
  });
}
