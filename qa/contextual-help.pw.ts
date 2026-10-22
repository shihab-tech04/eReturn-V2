import { test, expect } from '@playwright/test';

const detailRoutes = [
  'home','return-workspace','tax-records','assessment','income',
  'employment','financial-assets','rent','agriculture','business','capital-gain',
  'income-from-other-sources','firm-etc','aop','foreign-income','spouse-income',
  'tax-exempted-income','voluntary-disclosure-income','rebate','expenditure',
  'assets-liabilities','tax-payment','return-view','submission',
  'tin-certificate','acknowledgement','challan-history','certificate-request',
  'certificate-status','return-history','revised-return','audited-accounts',
  'profile','change-password',
];
for (const width of [375,768,1280,1920]) {
  for (const lang of ['en','bn'] as const) {
    test(`contextual help all registered sections ${width} ${lang}`,async ({page})=>{
      test.setTimeout(180000);
      const errors:string[]=[];
      page.on('pageerror',error=>errors.push(error.message));
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
      const launch=page.locator('[data-er-help-launcher]');
      for(const route of detailRoutes){
        await page.evaluate(nextRoute=>{window.location.hash='#/user-panel/'+nextRoute;},route);
        await expect(launch,`missing help on ${route}`).toBeVisible();
        await launch.click();
        const dialog=page.getByRole('dialog',{name:lang==='bn'?'ই-রিটার্ন সহায়তা':'eReturn guided help'});
        await expect(dialog,`drawer ${route}`).toBeVisible();
        await expect(dialog.getByText(lang==='bn'?'লাইভ এআই সংযুক্ত নয়':'Live AI is not connected',{exact:false})).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
      }
      expect(errors).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}
test('chat-style help responds safely and never presents an uncertified tax amount',async ({page})=>{
  await page.goto('/#/user-panel/rebate');
  const launcher=page.locator('[data-er-help-launcher]');
  await launcher.click();
  await page.getByLabel('Your question').fill('What is my rebate entitlement?');
  await page.getByRole('button',{name:'Ask',exact:true}).click();
  await expect(page.getByText('That rate, exemption or credit is not certified here.',{exact:false})).toBeVisible();
  await expect(page.getByText('Questions stay in this browser session',{exact:false})).toBeVisible();
});
test('guided submission review includes inline contextual help without enabling filing',async ({page})=>{
  await page.goto('/#/user-panel/guided-submission');
  await expect(page.getByRole('button',{name:/Get help: Personal & Assessment Information/})).toBeVisible();
  await page.getByRole('button',{name:/Get help: Personal & Assessment Information/}).click();
  await expect(page.getByRole('dialog',{name:'eReturn guided help'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:/Submit Return/})).toHaveCount(0);
  await page.goto('/#/user-panel/guided-submission?step=3');
  await expect(page.getByRole('button',{name:'Submit Return'})).toBeDisabled();
});
