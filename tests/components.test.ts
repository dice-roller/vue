import type { Component } from 'vue';
import type { DiceRoll } from '@dice-roller/rpg-dice-roller';
import type {
  UseDiceRollerOptions,
  UseDiceRollerReturn,
  DiceRollerSlotProps,
} from '@dice-roller/vue';
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
  Object.defineProperty(globalThis, key, {
    value: dom.window[key as keyof typeof dom.window],
    configurable: true,
  });
}
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
let writeText: (value: string) => Promise<void> = async () => {};
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: (value: string) => writeText(value) },
});
document.execCommand = () => false;
const { createApp, createSSRApp, h, nextTick, reactive, ref } =
  await import('vue');
const { renderToString } = await import('vue/server-renderer');
const library = await import('@dice-roller/vue');
const components = [
  'DiceRoller',
  'DiceRollerTailwind',
  'DiceRollerBootstrap',
] as const;
function inputEvent(value: string): Event {
  const input = document.createElement('input');
  input.value = value;
  const event = new window.Event('input');
  Object.defineProperty(event, 'target', { value: input });
  return event;
}
function query<K extends keyof HTMLElementTagNameMap>(
  root: ParentNode,
  selector: K,
): HTMLElementTagNameMap[K];
function query(root: ParentNode, selector: 'output button'): HTMLButtonElement;
function query(root: ParentNode, selector: string): HTMLElement;
function query(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  assert.ok(element, `Missing ${selector}`);
  return element;
}

const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

function mount(
  component: Component,
  initialProps: Record<string, unknown> = {},
) {
  const props = reactive<Record<string, unknown>>({
    notation: '1d1',
    ...initialProps,
  });
  const events = {
    rolls: [] as [string, DiceRoll | null][],
    changes: [] as string[],
    updates: [] as string[],
    warnings: [] as string[],
  };
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
        onRoll: (...args: [string, DiceRoll | null]) => events.rolls.push(args),
        'onNotation:change': (value: string) => events.changes.push(value),
        'onUpdate:notation': (value: string) => events.updates.push(value),
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
      const root = query(f.host, '.dice-roller');
      assert.ok(root.classList.contains('consumer-class'));
      assert.equal(root.style.marginTop, '3px');
      assert.equal(root.dataset.consumer, 'yes');
      const input = query(f.host, 'input');
      const announcement = query(root, '[role="status"]');
      assert.equal(announcement.textContent, '');
      assert.equal(input.getAttribute('aria-label'), 'Custom notation');
      f.props.notation = '2d1';
      await settle();
      assert.equal(input.value, '2d1');
      assert.deepEqual(f.events.changes, []);
      query(f.host, 'button').click();
      await settle();
      assert.equal(f.events.rolls[0][0], '2d1');
      assert.equal(f.events.rolls[0][1]!.total, 2);
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
      const input = query(f.host, 'input');
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
      const input = query(f.host, 'input');
      const label = query(f.host, 'label');
      assert.equal(label.textContent.trim(), 'Dice expression');
      assert.equal(label.htmlFor, input.id);
      query(f.host, 'button').click();
      await settle();
      const error = query(f.host, '[role="alert"]');
      assert.match(error.textContent, /Please check your dice/);
      assert.equal(input.getAttribute('aria-invalid'), 'true');
      assert.equal(
        input.getAttribute('aria-describedby'),
        `consumer-help ${error.id}`,
      );
      assert.equal(f.events.rolls[0][1], null);
      f.props.notation = '1d1';
      await settle();
      query(f.host, 'button').click();
      await settle();
      assert.equal(input.getAttribute('aria-invalid'), null);
      assert.equal(input.getAttribute('aria-describedby'), 'consumer-help');
      assert.equal(query(f.host, 'output').getAttribute('aria-live'), 'off');
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
    const warnings: string[] = [];
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

for (const name of components) {
  test(`${name}: copy never submits, announces success and handles clipboard rejection`, async () => {
    const copied: string[] = [];
    writeText = async (value) => {
      copied.push(value);
    };
    const f = mount(library[name], {
      labels: {
        copy: 'Copy result',
        copied: 'Result copied',
        copyError: 'Copy failed',
      },
    });
    try {
      query(f.host, 'button').click();
      await settle();
      const button = query(f.host, 'output button');
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
          'onUpdate:notation': (value: string) => {
            updates++;
            notation.value = value;
          },
        },
        {
          default: ({ bind, on }: DiceRollerSlotProps) =>
            h('input', { ...bind, onInput: on.input, onChange: on.change }),
        },
      ),
  });
  try {
    app.mount(host);
    const input = query(host, 'input');
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

function mountRollers(...options: UseDiceRollerOptions[]) {
  const host = document.createElement('div');
  document.body.append(host);
  let rollers!: UseDiceRollerReturn[];
  const app = createApp({
    setup() {
      rollers = options.map((option) => library.useDiceRoller(option));
      return () => h('div');
    },
  });
  app.mount(host);
  return {
    rollers,
    close() {
      app.unmount();
      host.remove();
    },
  };
}

test('composable accepts refs/getters and local v-model edits without source feedback loops', async () => {
  const notation = ref<string | undefined>('1d1');
  const props = reactive({
    notation: '2d1',
    labels: { invalidNotation: 'Check dice' },
  });
  const changes: string[] = [];
  const f = mountRollers(
    {
      notation,
      onNotationChange: (value) => {
        changes.push(value);
        notation.value = value;
      },
    },
    { notation: () => props.notation, labels: () => props.labels },
  );
  try {
    const [first, second] = f.rollers;
    first.currentNotation.value = '3d1';
    first.on.change(inputEvent('3d1'));
    await settle();
    assert.deepEqual(changes, ['3d1']);
    assert.equal(notation.value, '3d1');
    assert.deepEqual(first.bind.value, { value: '3d1' });
    notation.value = '4d1';
    props.notation = 'invalid notation';
    props.labels = { invalidNotation: 'Updated label' };
    await settle();
    assert.equal(first.currentNotation.value, '4d1');
    assert.deepEqual(changes, ['3d1']);
    second.roll();
    assert.match(second.error.value!, /^Updated label:/);
    assert.equal(second.labels.value.copy, 'Copy to clipboard');
    assert.equal(first.error.value, null);
    notation.value = undefined;
    await settle();
    assert.equal(first.currentNotation.value, '');
  } finally {
    f.close();
  }
});

test('composable keeps rolls, validation and clipboard state independent per call', async () => {
  const rolls: [string, DiceRoll | null][] = [];
  const f = mountRollers(
    {
      notation: '2d1',
      onRoll: (...args: [string, DiceRoll | null]) => rolls.push(args),
    },
    {},
  );
  const copied: string[] = [];
  writeText = async (value) => {
    copied.push(value);
  };
  try {
    const [first, second] = f.rollers;
    assert.equal(second.currentNotation.value, '');
    assert.equal(first.copy.isSupported, true);
    first.roll();
    assert.equal(first.output.value!.total, 2);
    assert.equal(rolls[0][0], '2d1');
    assert.equal(rolls[0][1], first.output.value);
    assert.equal(second.output.value, null);
    await first.copy.copy();
    assert.deepEqual(copied, ['2d1: [1, 1] = 2']);
    assert.equal(first.copy.copied, true);
    assert.equal(first.copy.text, copied[0]);
    assert.equal(second.copy.copied, false);
    writeText = async () => {
      throw new Error('Denied');
    };
    await first.copy.copy();
    assert.equal(first.copy.copied, false);
    assert.equal(first.copy.error, first.labels.value.copyError);
    assert.equal(second.copy.error, null);
    first.setNotation('invalid notation');
    first.roll();
    assert.equal(first.output.value, null);
    assert.match(first.error.value!, /^Invalid notation:/);
    assert.equal(first.copy.error, null);
    assert.equal(rolls[1][1], null);
    first.setNotation('');
    first.roll();
    assert.equal(first.error.value, null);
    assert.deepEqual(rolls[2], ['', null]);
    await second.copy.copy();
    assert.equal(second.copy.error, null);
  } finally {
    f.close();
    writeText = async () => {};
  }
});

test('renderless adapter preserves its slot contract and ordered events', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const events: (
    ['update' | 'change', string] | ['roll', string, DiceRoll | null]
  )[] = [];
  let state!: DiceRollerSlotProps;
  const app = createApp({
    render: () =>
      h(
        library.DiceRollerRenderless,
        {
          notation: '1d1',
          'onUpdate:notation': (value: string) =>
            events.push(['update', value]),
          'onNotation:change': (value: string) =>
            events.push(['change', value]),
          onRoll: (...args: [string, DiceRoll | null]) =>
            events.push(['roll', ...args]),
        },
        {
          default: (slot: DiceRollerSlotProps) => {
            state = slot;
            return h('div');
          },
        },
      ),
  });
  try {
    app.mount(host);
    assert.deepEqual(Object.keys(state).sort(), [
      'bind',
      'copy',
      'currentNotation',
      'error',
      'labels',
      'on',
      'output',
      'roll',
    ]);
    assert.deepEqual(Object.keys(state.copy).sort(), [
      'copied',
      'copy',
      'error',
      'isSupported',
      'text',
    ]);
    assert.equal(state.currentNotation, '1d1');
    state.on.input(inputEvent('2d1'));
    state.on.change(inputEvent('2d1'));
    await settle();
    assert.equal(state.bind.value, '2d1');
    assert.deepEqual(events, [
      ['update', '2d1'],
      ['change', '2d1'],
    ]);
    state.roll();
    await settle();
    assert.equal(events[2][0], 'roll');
    assert.equal(events[2][1], '2d1');
    assert.equal((events[2] as ['roll', string, DiceRoll])[2].total, 2);
    assert.equal(state.output!.total, 2);
  } finally {
    app.unmount();
    host.remove();
  }
});
