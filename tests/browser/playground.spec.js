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
