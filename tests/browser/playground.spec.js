import { expect, test } from '@playwright/test';

test('npm frameworks coexist without styling each other or the plain example', async ({
  page,
  baseURL,
}) => {
  const expectedOrigin = new URL(baseURL).origin;
  const external = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(expectedOrigin)) external.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.bootstrap-preview .card')).toBeVisible();
  await expect(page.locator('.tailwind-preview .dice-roller')).toBeVisible();

  const padding = await page.evaluate(() => {
    return [
      '.bootstrap-preview',
      '.tailwind-preview',
      '.plain-preview',
      '.page-header',
    ].map((selector) => {
      const probe = document.createElement('div');
      probe.className = 'p-4';
      document.querySelector(selector).append(probe);
      const value = getComputedStyle(probe).paddingTop;
      probe.remove();
      return value;
    });
  });
  expect(padding).toEqual(['24px', '16px', '0px', '0px']);
  await expect(page.locator('.bootstrap-preview .btn')).toHaveCSS(
    'background-color',
    'rgb(13, 110, 253)',
  );
  await expect(page.locator('.tailwind-preview .dice-roller')).toHaveCSS(
    'background-color',
    'rgb(241, 245, 249)',
  );

  for (const selector of [
    '.bootstrap-preview',
    '.tailwind-preview',
    '.plain-preview',
  ]) {
    const example = page.locator(selector).first();
    await example.locator('input').fill('1d1');
    await example.getByRole('button', { name: 'Roll', exact: true }).click();
    await expect(example.locator('output')).toContainText('1d1: [1] = 1');
  }
  expect(external).toEqual([]);
});

test('examples fit a narrow screen and longer output', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  for (const selector of ['.bootstrap-preview', '.tailwind-preview']) {
    const example = page.locator(selector).first();
    await example.locator('input').fill('20d1');
    await example.getByRole('button', { name: 'Roll', exact: true }).click();
    await expect(example.locator('output')).toContainText('= 20');
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
});

test('Tailwind roll button keeps its label and padding at different widths', async ({
  page,
}) => {
  await page.goto('/');
  const example = page.locator('.tailwind-preview .dice-roller');
  const input = example.locator('input');
  const button = example.getByRole('button', { name: 'Roll', exact: true });
  await expect(button).toBeVisible();
  for (const width of [375, 640, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const label = await button.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const text = range.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        lines: range.getClientRects().length,
        textWidth: text.width,
        padding: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
        width: element.getBoundingClientRect().width,
      };
    });
    expect(label.lines).toBe(1);
    expect(label.width).toBeGreaterThanOrEqual(label.textWidth + label.padding);
    const inputBox = await input.boundingBox();
    const buttonBox = await button.boundingBox();
    if (width >= 640) {
      expect(Math.abs(inputBox.y - buttonBox.y)).toBeLessThan(1);
      expect(Math.abs(inputBox.x + inputBox.width - buttonBox.x)).toBeLessThan(
        1,
      );
    } else {
      expect(buttonBox.y).toBeGreaterThan(inputBox.y + inputBox.height);
      expect(Math.abs(buttonBox.width - inputBox.width)).toBeLessThan(1);
    }
  }
});

test('Bootstrap follows system theme changes for its card, controls and feedback', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const preview = page.locator('.bootstrap-preview');
  const card = preview.locator('.card');
  const input = preview.locator('input');
  const button = preview.getByRole('button', { name: 'Roll', exact: true });
  await expect(preview).toHaveAttribute('data-bs-theme', 'light');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(input).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await input.fill('1d1');
  await button.click();

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(preview).toHaveAttribute('data-bs-theme', 'dark');
  await expect(preview).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(card).toHaveCSS('background-color', 'rgb(33, 37, 41)');
  await expect(input).toHaveCSS('background-color', 'rgb(33, 37, 41)');
  await expect(preview.locator('output')).toHaveCSS(
    'color',
    'rgb(222, 226, 230)',
  );
  await expect(preview.locator('output')).toHaveCSS(
    'border-top-color',
    'rgb(73, 80, 87)',
  );
  await expect(page.locator('.tailwind-preview[data-bs-theme]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-bs-theme');

  await input.fill('invalid notation');
  await button.click();
  await expect(preview.getByRole('alert')).toHaveCSS(
    'color',
    'rgb(234, 134, 143)',
  );

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(preview).toHaveAttribute('data-bs-theme', 'light');
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(input).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

for (const { name, selector, badgeBackground } of [
  {
    name: 'Tailwind',
    selector: '.tailwind-preview .dice-roller',
    badgeBackground: 'rgb(17, 24, 39)',
  },
  {
    name: 'Bootstrap',
    selector: '.bootstrap-preview .dice-roller',
    badgeBackground: 'rgb(33, 37, 41)',
  },
]) {
  test(`${name} copy confirmation stays readable on one line left of the icon`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/');
    const example = page.locator(selector);
    await example.locator('input').fill('1d1');
    await example.getByRole('button', { name: 'Roll', exact: true }).click();
    const copy = example.getByRole('button', {
      name: 'Copy to clipboard',
      exact: true,
    });

    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      const icon = copy.locator('svg');
      await expect(icon).toHaveCSS('width', '24px');
      await expect(icon).toHaveCSS('height', '24px');
      if (name === 'Bootstrap') {
        await example.locator('input').focus();
        await page.mouse.move(0, 0);
        await expect(copy).toHaveCSS(
          'color',
          colorScheme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        );
        const target = await copy.boundingBox();
        expect(target.width).toBeGreaterThanOrEqual(40);
        expect(target.height).toBeGreaterThanOrEqual(40);
        await expect(copy).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await copy.hover();
        await expect(copy).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      await copy.click();
      const confirmation = copy.getByText('Copied!', { exact: true });
      await expect(confirmation).toBeVisible();
      await expect(confirmation).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(confirmation).toHaveCSS('background-color', badgeBackground);
      const text = await confirmation.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return {
          lines: range.getClientRects().length,
          height: range.getBoundingClientRect().height,
        };
      });
      expect(text.lines).toBe(1);
      const labelBox = await confirmation.boundingBox();
      const iconBox = await copy.locator('svg').boundingBox();
      if (name === 'Bootstrap') {
        const outputBox = await example.locator('output').boundingBox();
        const resultBox = await example
          .locator('output > span')
          .first()
          .boundingBox();
        expect(iconBox.x).toBeGreaterThan(resultBox.x + resultBox.width);
        expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(
          outputBox.x + outputBox.width,
        );
      }
      expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(iconBox.x - 4);
      expect(
        Math.abs(
          labelBox.y + labelBox.height / 2 - iconBox.y - iconBox.height / 2,
        ),
      ).toBeLessThan(1);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        '1d1: [1] = 1',
      );
    }
  });
}

for (const colorScheme of ['light', 'dark']) {
  test(`Tailwind theme defaults preserve the ${colorScheme} palette and interaction colours`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    const example = page.locator('.tailwind-preview .dice-roller');
    const input = example.locator('input');
    const button = example.getByRole('button', { name: 'Roll', exact: true });
    const dark = colorScheme === 'dark';
    await expect(example).toHaveCSS(
      'background-color',
      dark ? 'rgb(75, 85, 99)' : 'rgb(241, 245, 249)',
    );
    await expect(example).toHaveCSS(
      'color',
      dark ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
    );
    await expect(input).toHaveCSS(
      'background-color',
      dark ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
    );
    await expect(input).toHaveCSS(
      'color',
      dark ? 'rgb(226, 232, 240)' : 'rgb(17, 24, 39)',
    );
    await expect(input).toHaveCSS(
      'border-top-color',
      dark ? 'rgb(55, 65, 81)' : 'rgb(209, 213, 219)',
    );
    await expect(button).toHaveCSS('color', 'rgb(17, 24, 39)');
    await expect(button).toHaveCSS(
      'background-image',
      /rgb\(237, 161, 139\).*rgb\(212, 244, 198\)/,
    );
    const placeholderColour = () =>
      input.evaluate(
        (element) => getComputedStyle(element, '::placeholder').color,
      );
    expect(await placeholderColour()).toBe(
      dark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)',
    );
    await input.focus();
    expect(await placeholderColour()).toBe(
      dark ? 'rgb(148, 163, 184)' : 'rgb(156, 163, 175)',
    );
    await button.hover();
    await expect(button).toHaveCSS(
      'background-image',
      /rgb\(232, 140, 113\).*rgb\(187, 240, 163\)/,
    );
    await expect(button).toHaveCSS('color', 'rgb(31, 41, 55)');
    await input.fill('1d1');
    await expect(input).toHaveCSS('border-top-color', 'rgb(212, 244, 198)');
    await expect(input).toHaveCSS(
      'outline-color',
      dark ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
    );
    await button.click();
    const output = example.locator('output');
    await expect(output).toHaveCSS(
      'background-color',
      dark ? 'rgb(30, 41, 59)' : 'rgb(255, 255, 255)',
    );
    await expect(output).toHaveCSS(
      'color',
      dark ? 'rgb(226, 232, 240)' : 'rgb(0, 0, 0)',
    );
    await expect(output).toHaveCSS(
      'border-left-color',
      dark ? 'rgb(107, 143, 99)' : 'rgb(212, 244, 198)',
    );
    await input.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(
      example.getByRole('button', { name: 'Copy to clipboard', exact: true }),
    ).toHaveCSS(
      'outline-color',
      dark ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
    );
    await input.fill('invalid notation');
    await button.click();
    await expect(input).toHaveCSS('background-color', 'rgb(254, 242, 242)');
    await expect(input).toHaveCSS('color', 'rgb(185, 28, 28)');
    await expect(input).toHaveCSS('border-top-color', 'rgb(254, 202, 202)');
    await expect(example.getByRole('alert')).toHaveCSS(
      'color',
      dark ? 'rgb(254, 202, 202)' : 'rgb(185, 28, 28)',
    );
  });
}

test('Tailwind theme variables inherit globally and allow instance and dark overrides', async ({
  page,
}) => {
  await page.goto('/');
  await page.addStyleTag({
    content: `
    :root {
      --dice-roller-primary: #7c3aed;
      --dice-roller-primary-hover: #6d28d9;
      --dice-roller-on-primary: #fff;
      --dice-roller-surface: #e0e7ff;
      --dice-roller-surface-dark: #312e81;
    }
    .tailwind-preview { --dice-roller-output-text: #0369a1; }
  `,
  });
  const example = page.locator('.tailwind-preview .dice-roller').first();
  const input = example.locator('input');
  const button = example.getByRole('button', { name: 'Roll', exact: true });
  await expect(example).toHaveCSS('background-color', 'rgb(224, 231, 255)');
  await expect(button).toHaveCSS(
    'background-image',
    /rgb\(124, 58, 237\).*rgb\(124, 58, 237\)/,
  );
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await button.hover();
  await expect(button).toHaveCSS(
    'background-image',
    /rgb\(109, 40, 217\).*rgb\(109, 40, 217\)/,
  );
  await page.mouse.move(0, 0);
  await button.focus();
  await expect(button).toHaveCSS(
    'background-image',
    /rgb\(109, 40, 217\).*rgb\(109, 40, 217\)/,
  );
  await input.fill('1d1');
  await expect(input).toHaveCSS('border-top-color', 'rgb(124, 58, 237)');
  await button.click();
  await expect(example.locator('output')).toHaveCSS(
    'border-left-color',
    'rgb(124, 58, 237)',
  );
  await expect(example.locator('output')).toHaveCSS(
    'color',
    'rgb(3, 105, 161)',
  );
  // A second instance of the same markup proves overrides stay local.
  await example.evaluate((element) => {
    const other = element.cloneNode(true);
    other.id = 'other-themed-roller';
    other.style.setProperty('--dice-roller-primary', '#0f766e');
    element.after(other);
  });
  await expect(page.locator('#other-themed-roller output')).toHaveCSS(
    'border-left-color',
    'rgb(15, 118, 110)',
  );
  await expect(example.locator('output')).toHaveCSS(
    'border-left-color',
    'rgb(124, 58, 237)',
  );
  for (const colorScheme of ['dark', 'light']) {
    await page.emulateMedia({ colorScheme });
    await expect(example).toHaveCSS(
      'background-color',
      colorScheme === 'dark' ? 'rgb(49, 46, 129)' : 'rgb(224, 231, 255)',
    );
    await expect(example.locator('output')).toHaveCSS(
      'color',
      'rgb(3, 105, 161)',
    );
    await expect(example.locator('output')).toHaveCSS(
      'border-left-color',
      'rgb(124, 58, 237)',
    );
  }
  await example.evaluate((element) => {
    element.style.setProperty('--dice-roller-button-from', '#fda4af');
    element.style.setProperty('--dice-roller-button-to', '#a5f3fc');
  });
  await input.focus();
  await expect(button).toHaveCSS(
    'background-image',
    /rgb\(253, 164, 175\).*rgb\(165, 243, 252\)/,
  );
  await expect(page.locator('.bootstrap-preview .card')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
});
