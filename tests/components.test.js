import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});
for (const key of [
  'window',
  'document',
  'Element',
  'HTMLElement',
  'SVGElement',
  'Node',
]) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
let writeText = async () => {};
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: (value) => writeText(value) },
});
document.execCommand = () => false;
const { createApp, createSSRApp, h, nextTick, reactive } = await import('vue');
const { renderToString } = await import('vue/server-renderer');
const library = await import('../dist/vue.js');
const components = ['DiceRoller', 'DiceRollerTailwind', 'DiceRollerBootstrap'];
const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

function mount(component, initialProps = {}) {
  const props = reactive({ notation: '1d1', ...initialProps });
  const events = { rolls: [], changes: [], updates: [], warnings: [] };
  const host = document.createElement('form');
  document.body.append(host);
  let submits = 0;
  host.addEventListener('submit', (event) => {
    event.preventDefault();
    submits++;
  });
  const app = createApp({
    render: () =>
      h(component, {
        ...props,
        onRoll: (...args) => events.rolls.push(args),
        'onNotation:change': (value) => events.changes.push(value),
        'onUpdate:notation': (value) => events.updates.push(value),
      }),
  });
  app.config.warnHandler = (message) => events.warnings.push(message);
  app.mount(host);
  return {
    props,
    events,
    host,
    submits: () => submits,
    close: () => {
      app.unmount();
      host.remove();
    },
  };
}

for (const name of components) {
  test(`${name}: forwards results, reactive notation, attributes and single input updates`, async () => {
    const f = mount(library[name], {
      class: 'consumer-class',
      style: { marginTop: '3px' },
      'data-consumer': 'yes',
      inputAttrs: { 'aria-label': 'Custom notation', autocomplete: 'off' },
    });
    try {
      const root = f.host.querySelector('.dice-roller');
      assert.ok(root.classList.contains('consumer-class'));
      assert.equal(root.style.marginTop, '3px');
      assert.equal(root.dataset.consumer, 'yes');
      const input = f.host.querySelector('input');
      const announcement = root.querySelector('[role="status"]');
      assert.equal(announcement.textContent, '');
      assert.equal(input.getAttribute('aria-label'), 'Custom notation');
      f.props.notation = '2d1';
      await settle();
      assert.equal(input.value, '2d1');
      assert.deepEqual(f.events.changes, []);
      f.host.querySelector('button').click();
      await settle();
      assert.equal(f.events.rolls[0][0], '2d1');
      assert.equal(f.events.rolls[0][1].total, 2);
      assert.ok(announcement.isConnected);
      assert.equal(announcement.textContent, '2d1: [1, 1] = 2');
      input.value = '3d1';
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
      await settle();
      assert.deepEqual(f.events.changes, ['3d1']);
      assert.deepEqual(f.events.updates, ['3d1']);
      assert.deepEqual(f.events.warnings, []);
    } finally {
      f.close();
    }
  });

  test(`${name}: Enter is form-safe, ignores composition and key repeats`, async () => {
    const f = mount(library[name]);
    try {
      const input = f.host.querySelector('input');
      for (const options of [{ isComposing: true }, { repeat: true }]) {
        input.dispatchEvent(
          new window.KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true,
            ...options,
          }),
        );
      }
      assert.equal(f.events.rolls.length, 0);
      const enter = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(enter);
      await settle();
      assert.ok(enter.defaultPrevented);
      assert.equal(f.events.rolls.length, 1);
      input.dispatchEvent(
        new window.KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
      );
      assert.equal(f.events.rolls.length, 1);
      assert.equal(f.submits(), 0);
    } finally {
      f.close();
    }
  });

  test(`${name}: labels, validation and error descriptions are accessible`, async () => {
    const f = mount(library[name], {
      notation: 'invalid notation',
      labels: {
        notation: 'Dice expression',
        invalidNotation: 'Please check your dice',
      },
      inputAttrs: { 'aria-describedby': 'consumer-help' },
    });
    try {
      const input = f.host.querySelector('input');
      const label = f.host.querySelector('label');
      assert.equal(label.textContent.trim(), 'Dice expression');
      assert.equal(label.htmlFor, input.id);
      f.host.querySelector('button').click();
      await settle();
      const error = f.host.querySelector('[role="alert"]');
      assert.match(error.textContent, /Please check your dice/);
      assert.equal(input.getAttribute('aria-invalid'), 'true');
      assert.equal(
        input.getAttribute('aria-describedby'),
        `consumer-help ${error.id}`,
      );
      assert.equal(f.events.rolls[0][1], null);
      f.props.notation = '1d1';
      await settle();
      f.host.querySelector('button').click();
      await settle();
      assert.equal(input.getAttribute('aria-invalid'), null);
      assert.equal(input.getAttribute('aria-describedby'), 'consumer-help');
      assert.equal(
        f.host.querySelector('output').getAttribute('aria-live'),
        'off',
      );
    } finally {
      f.close();
    }
  });

  test(`${name}: IDs are unique per app and stable through SSR hydration`, async () => {
    const Root = {
      render: () => h('div', [h(library[name]), h(library[name])]),
    };
    const html = await renderToString(createSSRApp(Root));
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = html;
    const before = [...host.querySelectorAll('input')].map((input) => input.id);
    assert.equal(new Set(before).size, 2);
    const app = createSSRApp(Root);
    const warnings = [];
    app.config.warnHandler = (message) => warnings.push(message);
    try {
      app.mount(host);
      await settle();
      assert.deepEqual(
        [...host.querySelectorAll('input')].map((input) => input.id),
        before,
      );
      assert.deepEqual(
        [...host.querySelectorAll('label')].map((label) => label.htmlFor),
        before,
      );
      assert.deepEqual(warnings, []);
    } finally {
      app.unmount();
      host.remove();
    }
  });
}

for (const name of [
  'DiceRoller',
  'DiceRollerTailwind',
  'DiceRollerBootstrap',
]) {
  test(`${name}: copy never submits, announces success and handles clipboard rejection`, async () => {
    const copied = [];
    writeText = async (value) => copied.push(value);
    const f = mount(library[name], {
      labels: {
        copy: 'Copy result',
        copied: 'Result copied',
        copyError: 'Copy failed',
      },
    });
    try {
      f.host.querySelector('button').click();
      await settle();
      const button = f.host.querySelector('output button');
      assert.equal(button.type, 'button');
      assert.equal(button.getAttribute('aria-label'), 'Copy result');
      button.click();
      await settle();
      assert.deepEqual(copied, ['1d1: [1] = 1']);
      assert.ok(
        [...f.host.querySelectorAll('[role="status"]')].some(
          (node) => node.textContent === 'Result copied',
        ),
      );
      assert.equal(f.submits(), 0);
      writeText = async () => {
        throw new Error('Permission denied');
      };
      button.click();
      await settle();
      assert.ok(
        [...f.host.querySelectorAll('[role="status"]')].some(
          (node) => node.textContent === 'Copy failed',
        ),
      );
      assert.equal(f.submits(), 0);
    } finally {
      f.close();
      writeText = async () => {};
    }
  });
}

test('renderless component supports v-model:notation without feedback loops', async () => {
  const notation = reactive({ value: '1d1' });
  const host = document.createElement('div');
  document.body.append(host);
  let updates = 0;
  const app = createApp({
    render: () =>
      h(
        library.DiceRollerRenderless,
        {
          notation: notation.value,
          'onUpdate:notation': (value) => {
            updates++;
            notation.value = value;
          },
        },
        {
          default: ({ bind, on }) =>
            h('input', { ...bind, onInput: on.input, onChange: on.change }),
        },
      ),
  });
  try {
    app.mount(host);
    const input = host.querySelector('input');
    input.value = '2d1';
    input.dispatchEvent(new window.Event('input'));
    await settle();
    assert.equal(notation.value, '2d1');
    assert.equal(updates, 1);
    notation.value = '3d1';
    await settle();
    assert.equal(input.value, '3d1');
    assert.equal(updates, 1);
  } finally {
    app.unmount();
    host.remove();
  }
});
