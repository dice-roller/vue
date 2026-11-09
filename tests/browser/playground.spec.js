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

test('Tailwind copy confirmation stays readable on one line left of the icon', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  const example = page.locator('.tailwind-preview .dice-roller');
  await example.locator('input').fill('1d1');
  await example.getByRole('button', { name: 'Roll', exact: true }).click();
  const copy = example.getByRole('button', {
    name: 'Copy to clipboard',
    exact: true,
  });

  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme });
    await copy.click();
    const confirmation = copy.getByText('Copied!', { exact: true });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(confirmation).toHaveCSS('background-color', 'rgb(17, 24, 39)');
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
