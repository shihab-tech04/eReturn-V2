import { test, expect } from '@playwright/test';

/**
 * Exhaustive registered-route smoke matrix. The route list is pinned to src/App.tsx
 * and must be updated when a new taxpayer route is added. It is not by itself a
 * statutory/functional/UI parity certification.
 */
export const ERETURN_REGISTERED_CHILD_ROUTES = [
  "home",
  "assessment",
  "income",
  "employment",
  "financial-assets",
  "rent",
  "agriculture",
  "business",
  "capital-gain",
  "income-from-other-sources",
  "firm-etc",
  "aop",
  "foreign-income",
  "spouse-income",
  "tax-exempted-income",
  "voluntary-disclosure-income",
  "rebate",
  "expenditure",
  "assets-liabilities",
  "tax-payment",
  "return-view",
  "submission",
  "tin-certificate",
  "acknowledgement",
  "challan-history",
  "certificate-request",
  "certificate-status",
  "return-history",
  "return-records",
  "revised-return",
  "audited-accounts",
  "profile",
  "change-password"
] as const;
const widths = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
  { width: 1920, height: 1080 },
];
const langs = ['en', 'bn'] as const;

for (const viewport of widths) {
  for (const lang of langs) {
    for (const route of ERETURN_REGISTERED_CHILD_ROUTES) {
      test(`${viewport.width}px / ${lang} / ${route}: renders, navigates, no console exception or page overflow`, async ({page}) => {
        await page.setViewportSize(viewport);
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto(`/#/user-panel/${route}`);
        await expect(page.locator('main').first()).toBeVisible();
        if (lang === 'bn') {
          const switcher = page.getByRole('button', {name: 'বাংলা', exact: true});
          await expect(switcher).toBeVisible();
          await switcher.click();
          await expect(page.getByRole('button', {name: 'English', exact: true})).toBeVisible();
        }
        await expect(page).toHaveURL(new RegExp('/#/user-panel/' + route + '$'));
        const substantive = (await page.locator('main').first().innerText()).trim();
        expect(substantive.length, 'route should have actual main content').toBeGreaterThan(20);
        const overflow = await page.evaluate(() => ({
          document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          body: document.body.scrollWidth - document.documentElement.clientWidth,
        }));
        expect(overflow.document, 'horizontal page overflow').toBeLessThanOrEqual(2);
        expect(overflow.body, 'horizontal body overflow').toBeLessThanOrEqual(2);
        expect(errors, 'browser execution must not throw').toEqual([]);
        await page.screenshot({path: 'test-results/visual-audit/' + viewport.width + '/' + lang + '/' + route + '.png', fullPage: true, animations:'disabled'});
      });
    }
  }
}

test('no fabricated filing or approved tax amounts before certified engine', async ({page}) => {
  await page.goto('/#/user-panel/submission');
  await expect(page.getByRole('alert').filter({hasText: 'Filing is not available'})).toBeVisible();
  await expect(page.getByRole('button', {name: /submit return/i})).toBeDisabled();
  await page.goto('/#/user-panel/tax-payment');
  await expect(page.getByText('Statutory calculation is blocked')).toBeVisible();
  await expect(page.getByText('Pending verified Rules Engine').first()).toBeVisible();
  await page.goto('/#/user-panel/rebate');
  await expect(page.getByText('Pending verified Rules Engine').first()).toBeVisible();
});

test('mobile primary navigation remains operable from taxpayer pages', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto('/#/user-panel/assessment');
  await expect(page.locator('main').first()).toBeVisible();
  await page.getByRole('button',{name:'Open navigation'}).click();
  const link = page.getByRole('link',{name:/Tax.*Payment|Tax & Payment/i}).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.getByRole('button',{name:'Open navigation'})).toBeVisible();
  await expect(page).toHaveURL(/\/#\/user-panel\/tax-payment$/);
  await expect(page.getByText('Statutory calculation is blocked')).toBeVisible();
});
