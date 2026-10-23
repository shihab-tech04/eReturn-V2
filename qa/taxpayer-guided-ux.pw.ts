import { test, expect } from '@playwright/test';

for (const width of [375, 768, 1280, 1920]) {
  for(const lang of ['en','bn'] as const){
    test(`guided taxpayer dashboard and grouped records ${width}px ${lang}`,async ({page})=>{
      test.setTimeout(90000);
      await page.setViewportSize({width,height:900});
      await page.goto('/#/user-panel/home');
      if(lang==='bn'){
        if(width>=1440){
          await page.getByRole('button',{name:'Language: English'}).click();
        }else{
          await page.getByRole('button',{name:'Open navigation menu'}).click();
          await page.getByRole('button',{name:'Account & preferences'}).click();
          await page.getByRole('button',{name:'Language: English'}).click();
          await page.getByRole('button',{name:'নেভিগেশন মেনু বন্ধ করুন'}).click();
        }
      }
      await expect(page.getByRole('heading',{name:lang==='bn'?'করদাতার ড্যাশবোর্ড':'Taxpayer Dashboard'})).toBeVisible();
      await expect(page.getByRole('heading',{name:lang==='bn'?'পরবর্তী করণীয়':'Your next steps'})).toBeVisible();
      const mainCta=page.getByRole('link',{name:lang==='bn'?'আমার রিটার্ন শুরু করুন':'Start My Tax Return'});
      await expect(mainCta).toBeVisible();
      await expect(page.locator('.er-guided-home-step-list > li')).toHaveCount(3);
      await expect(page.locator('[data-entry="ereturn-submission"]')).toBeVisible();
      await expect(page.getByText(lang==='bn'?'এখনো পাওয়া যাচ্ছে না':'Not available yet')).toBeVisible();
      const dashWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(dashWidth).toBeLessThanOrEqual(width);

      await page.goto('/#/user-panel/tax-records');
      const headings=lang==='bn'
        ? ['সনদ','রিটার্নের নথিপত্র','পরিশোধের নথিপত্র']
        : ['Certificates','Return documents','Payment documents'];
      for(const heading of headings)await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
      await expect(page.locator('.er-guided-records-link')).toHaveCount(7);
      await expect(page.getByRole('link',{name:lang==='bn'?/সংশোধিত রিটার্নের তথ্য দেখুন/:/Review revised-return information/})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}
test('step-based contextual guidance refers to the actual form',async ({page})=>{
  await page.goto('/#/user-panel/assessment');
  await page.locator('[data-er-help-launcher]').click();
  await expect(page.getByRole('dialog',{name:'eReturn guided help'})).toBeVisible();
  await expect(page.getByText('Confirm the assessment year and income period shown before changing return selections.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'eReturn guided help'})).toHaveCount(0);
});
