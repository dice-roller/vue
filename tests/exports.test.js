import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

const require = createRequire(import.meta.url);
const entrypoints = {
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

  test(`${format}: bundled engine handles maths, modifiers and random rolls`, async () => {
    for (const [notation, min, max] of [
      ['2d1+3*2', 8, 8],
      ['floor(5/2)', 2, 2],
      ['4d1kh3+2', 5, 5],
      ['4d6kh3+2', 5, 20],
    ]) {
      let roll;
      let result;
      await renderToString(
        createSSRApp({
          render: () =>
            h(
              library.DiceRollerRenderless,
              { notation, onRoll: (_, value) => (result = value) },
              {
                default: (state) => {
                  roll = state.roll;
                  return h('div');
                },
              },
            ),
        }),
      );
      await roll();
      assert.ok(result, `Expected a result for ${notation}`);
      assert.ok(result.total >= min && result.total <= max, notation);
    }
  });
}
