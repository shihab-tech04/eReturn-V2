import { test, expect } from '@playwright/test';

/**
 * WS05 synthetic browser interaction proof. These are in-memory draft UI
 * interactions, NOT authenticated NBR filing, SQL readback or legal parity.
 */
for (const width of [375, 768, 1280, 1920]) {
  for (const lang of ['en', 'bn'] as const) {
    test('WS05 ' + width + 'px/' + lang + ': rental draft reaches return preview without inferred relief', async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 375 ? 812 : 950 });
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('/#/user-panel/rent');
      if (lang === 'bn') {
        await page.getByRole('button', { name: 'বাংলা', exact: true }).click();
        await expect(page.getByRole('button', { name: 'English', exact: true })).toBeVisible();
      }
      await page.getByRole('button', {
        name: lang === 'bn' ? 'আরেকটি সম্পত্তি যুক্ত করুন' : 'Add Another Property',
      }).click();
      const record = 'WS05 controlled rental property';
      await page.getByPlaceholder('e.g. Flat 4A, Road 12, Sector 3, Uttara, Dhaka').fill(record);
      await page.getByRole('button', {
        name: lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm', exact: true,
      }).click();
      await expect(page.getByText(record)).toBeVisible();
      await expect(page.getByText(
        lang === 'bn' ? 'অনুমোদিত হিসাব বাকি' : 'Pending verified Rules Engine'
      ).first()).toBeVisible();
      // Hash navigation intentionally does not reload, so entered draft survives.
      await page.evaluate(() => { window.location.hash = '#/user-panel/return-view'; });
      await expect(page).toHaveURL(/\/#\/user-panel\/return-view$/);
      await expect(page.locator('main').first()).toBeVisible();
      await expect(page.getByText(
        lang === 'bn' ? 'করযোগ্য আয় যাচাই বাকি' : 'Pending verified taxable-income calculation'
      )).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
      expect(errors).toEqual([]);
      await page.screenshot({ path: 'test-results/ws05-interactions/' + width + '-' + lang + '-return-preview.png', fullPage: true });
    });
  }
}

test('WS05 tax-payment form does not convert source-tax entries into approved liability', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto('/#/user-panel/tax-payment');
  await expect(page.getByText('Statutory calculation is blocked')).toBeVisible();
  await expect(page.getByText(/Entered TDS \(not verified credit\)/)).toBeVisible();
  await expect(page.getByText('Pending verified Rules Engine').first()).toBeVisible();
  await page.evaluate(() => { window.location.hash = '#/user-panel/submission'; });
  await expect(page.getByRole('button', {name:/submit return/i})).toBeDisabled();
});


test('WS05 year selector and income-period dates remain synchronized on both routes', async ({page}) => {
  await page.goto('/#/user-panel/assessment');
  await expect(page.locator('#assessmentYearInput')).toHaveValue('2026-2027');
  await page.locator('header select').first().selectOption('2025-2026');
  await expect(page.locator('#assessmentYearInput')).toHaveValue('2025-2026');
  await expect(page.locator('#incomeYearFrom')).toHaveValue('');
  await expect(page.locator('#incomeYearTo')).toHaveValue('');
  await page.evaluate(() => { window.location.hash = '#/user-panel/return-view'; });
  await expect(page.getByText('2025-2026', {exact:true}).first()).toBeVisible();
  await page.evaluate(() => { window.location.hash = '#/user-panel/assessment'; });
  await expect(page.locator('#assessmentYearInput')).toHaveValue('2025-2026');
  await page.locator('header select').first().selectOption('2026-2027');
  await expect(page.locator('#assessmentYearInput')).toHaveValue('2026-2027');
});
