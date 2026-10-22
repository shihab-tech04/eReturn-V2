import { test, expect } from '@playwright/test';

// Declared taxpayer routes. Render smoke is not official NBR 1:1 certification.
const routes = [
  'home','assessment','income','employment','financial-assets','rent',
  'agriculture','business','capital-gain','income-from-other-sources',
  'firm-etc','aop','foreign-income','spouse-income','tax-exempted-income',
  'voluntary-disclosure-income','rebate','expenditure','assets-liabilities',
  'tax-payment','return-view','submission','tin-certificate','acknowledgement',
  'challan-history','certificate-request','certificate-status','return-history',
  'return-records','revised-return','audited-accounts','profile','change-password',
] as const;

for (const width of [375, 768, 1280, 1920]) {
  for (const route of routes) {
    test('route '+route+' renders at '+width+'px without global overflow or runtime crash', async ({page}) => {
      await page.setViewportSize({width,height:900});
      const errors: string[]=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('/#/user-panel/'+route, {waitUntil:'networkidle'});
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main')).not.toBeEmpty();
      await expect(page).toHaveURL(new RegExp('/#/user-panel/'+route+'(?:$|\\?)'));
      expect(errors, 'uncaught React/runtime exceptions').toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),'global horizontal overflow').toBeLessThanOrEqual(2);
      if (width===375 || width===1280) {
        await page.screenshot({path:'test-results/ereturn-'+route+'-'+width+'.png',fullPage:true,animations:'disabled'});
      }
    });
  }
}
test('statutory tax and final filing remain gated pending certified Rules Engine',async({page})=>{
  await page.goto('/#/user-panel/tax-payment');
  await expect(page.getByText(/Statutory calculation is blocked|আইনসম্মত করের হিসাব এখনো অনুমোদিত নয়/)).toBeVisible();
  await page.goto('/#/user-panel/submission');
  await expect(page.getByText(/Filing is not available|রিটার্ন জমা দেওয়া বন্ধ/)).toBeVisible();
});
