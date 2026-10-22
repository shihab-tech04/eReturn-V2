import { test, expect } from '@playwright/test';

const sizes = [375, 430, 768, 1024, 1280, 1440, 1920];
const langs = ['en', 'bn'] as const;
const longLabel = (bn: boolean, en: string, bengali: string) => bn ? bengali : en;

for (const width of sizes) for (const lang of langs) {
  test('shell / '+width+' / '+lang, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({width,height:920});
    await page.goto('/#/user-panel/home');
    const bn=lang==='bn';
    if (bn) {
      if (width>=1280) await page.getByRole('button',{name:'Language: English'}).click();
      else {
        await page.getByRole('button',{name:'Open navigation menu'}).click();
        await page.getByRole('button',{name:'Account & preferences'}).click();
        await page.getByRole('button',{name:'Language: English'}).click();
        await page.getByRole('button',{name:'নেভিগেশন মেনু বন্ধ করুন'}).click();
      }
    }
    await expect(page.getByRole('heading',{name:longLabel(bn,'Taxpayer Dashboard','করদাতার ড্যাশবোর্ড')})).toBeVisible();
    await expect(page.getByText(longLabel(bn,'No independently verified filed returns are available.','স্বাধীনভাবে যাচাইকৃত দাখিলকৃত রিটার্ন পাওয়া যায়নি।'),{exact:false})).toBeVisible();
    if(width>=1280) {
      await expect(page.locator('.er-desktop-rail')).toBeVisible();
      await expect(page.locator('.er-compact-header')).toBeHidden();
    } else {
      await expect(page.locator('.er-desktop-rail')).toBeHidden();
      await expect(page.locator('.er-compact-header')).toBeVisible();
    }
    if(width<=767) await expect(page.locator('.er-mobile-bottom')).toBeVisible();
    await page.goto('/#/user-panel/return-workspace');
    await expect(page.locator('#workspace-title')).toBeVisible();
    await expect(page.locator('.er-income-row')).toHaveCount(13);
    await expect(page.locator('.er-calculation-panel')).toBeVisible();
    const rects=await page.evaluate(() => {
      const left=document.querySelector('.er-income')!.getBoundingClientRect();
      const right=document.querySelector('.er-metrics')!.getBoundingClientRect();
      const shell=getComputedStyle(document.querySelector('.er-app-shell')!);
      const button=getComputedStyle(document.querySelector('.er-compact-actions button')||document.querySelector('.er-drawer-head button')||document.querySelector('.er-shell-cta')!);
      return {left:{x:left.x,width:left.width},right:{x:right.x,width:right.width},font:shell.fontSize,
        buttonRadius:button.borderRadius,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    expect(rects.buttonRadius).toBe('0px');
    expect(rects.overflow).toBeLessThanOrEqual(2);
    if(width>=1280){
      expect(rects.font).toBe('18px');
      expect(rects.right.x).toBeGreaterThan(rects.left.x);
      expect(rects.left.width/(rects.left.width+rects.right.width)).toBeGreaterThan(0.68);
      expect(rects.left.width/(rects.left.width+rects.right.width)).toBeLessThan(0.72);
    }
    await page.screenshot({path:'test-results/taxpay-shell/'+width+'-'+lang+'.png',fullPage:true,animations:'disabled'});
    expect(errors).toEqual([]);
  });
}

test('mobile drawer closes via Escape and restores focus',async ({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/#/user-panel/home');
  const trigger=page.getByRole('button',{name:'Open navigation menu'});
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:'Navigation and account'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Close navigation menu'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Navigation and account'})).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('appearance includes six palettes, four fonts and desktop size exactness',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/return-workspace');
  const selects=page.locator('.er-preferences select');
  await expect(selects).toHaveCount(3);
  const themes=['indigo-blue','gov-blue','slate-purple','plum-executive','fresh-teal','dark-mode'];
  for(const name of themes){
    await selects.nth(0).selectOption(name);
    await expect(page.locator('html')).toHaveAttribute('data-er-theme',name);
  }
  for(const name of ['inter','poppins','noto-sans','google-sans']) await selects.nth(1).selectOption(name);
  for(const [name,px] of [['compact','16.2px'],['standard','18px'],['large','19.8px']]){
    await selects.nth(2).selectOption(name);
    await expect.poll(()=>page.locator('.er-app-shell').evaluate(e=>getComputedStyle(e).fontSize)).toBe(px);
  }
});

test('deep links and protected return records remain accessible',async ({page})=>{
  const pages=['assessment','employment','capital-gain','tax-payment','return-view','audited-accounts','tax-records','return-history','revised-return'];
  for(const route of pages){
    await page.goto('/#/user-panel/'+route);
    await expect(page.locator('main')).toBeVisible();
    expect((await page.locator('main').innerText()).trim().length).toBeGreaterThan(20);
  }
  await page.goto('/#/user-panel/overview');
  await expect(page).toHaveURL(/\/#\/user-panel\/home$/);
  await page.goto('/#/user-panel/submission');
  await expect(page.getByRole('button',{name:/submit return/i})).toBeDisabled();
});
