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
async function bundleConsumer(source) {
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
      .flatMap((result) => result.output)
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
]) {
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
  const context = { Vue: require('vue'), rpgDiceRoller: dice };
  runInNewContext(await readFile(`${root}dist/vue.umd.cjs`, 'utf8'), context);
  let result;
  await renderToString(
    createSSRApp({
      setup() {
        const { roll, output } = context.DiceRollerVue.useDiceRoller({
          notation: '2d1',
        });
        roll();
        result = output.value;
        return () => h('output', String(result));
      },
    }),
  );
  assert.ok(result instanceof dice.DiceRoll);
  assert.equal(result.total, 2);
});
