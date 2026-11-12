import type { Roll } from '@dice-roller/rpg-dice-roller';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import { build } from 'vite';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

// Bundle a consumer of the built package, resolving its public package export.
async function bundleConsumer(source: string) {
  const directory = await mkdtemp(`${root}.consumer-`);
  try {
    const entry = `${directory}/entry.js`;
    await writeFile(entry, source);
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry, formats: ['es'] },
        rolldownOptions: { external: ['vue', '@dice-roller/rpg-dice-roller'] },
      },
    });
    return [result]
      .flat()
      .flatMap((result) => {
        assert.ok('output' in result);
        return result.output;
      })
      .filter((file) => file.type === 'chunk')
      .map((file) => file.code)
      .join('\n');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('a composable-only ESM consumer excludes component markup and icons', async () => {
  const code = await bundleConsumer(
    "export { useDiceRoller } from '@dice-roller/vue';",
  );
  assert.match(code, /from ["']@dice-roller\/rpg-dice-roller["']/);
  assert.doesNotMatch(
    code,
    /--dice-roller-|form-control|svg|createElementVNode/,
  );
});

for (const [component, expected, excluded] of [
  ['DiceRollerTailwind', /--dice-roller-surface/, /form-control/],
  ['DiceRollerBootstrap', /form-control/, /--dice-roller-surface/],
] as const) {
  test(`${component}-only ESM consumer excludes the other styled component`, async () => {
    const code = await bundleConsumer(
      `export { ${component} } from '@dice-roller/vue';`,
    );
    assert.match(code, expected);
    assert.doesNotMatch(code, excluded);
  });
}

test('unused package imports can be removed entirely', async () => {
  const code = await bundleConsumer(
    "import { DiceRoller } from '@dice-roller/vue'; export const value = 1;",
  );
  assert.doesNotMatch(code, /from ["']vue["']|@dice-roller|clipboard|notation/);
});

test('UMD browser build uses the provided Vue and dice roller library globals', async () => {
  const dice = require('@dice-roller/rpg-dice-roller');
  const context: {
    Vue: typeof import('vue');
    rpgDiceRoller: typeof import('@dice-roller/rpg-dice-roller');
    DiceRollerVue?: typeof import('@dice-roller/vue');
  } = { Vue: require('vue'), rpgDiceRoller: dice };
  runInNewContext(await readFile(`${root}dist/vue.umd.cjs`, 'utf8'), context);
  const captured: { result: Roll | null } = { result: null };
  await renderToString(
    createSSRApp({
      setup() {
        const { roll, output } = context.DiceRollerVue!.useDiceRoller({
          notation: '2d1',
        });
        roll();
        captured.result = output.value;
        return () => h('output', String(captured.result));
      },
    }),
  );
  assert.ok(captured.result instanceof dice.Roll);
  assert.equal(captured.result!.total, 2);
  assert.equal(captured.result!.reroll().total, 2);
});
