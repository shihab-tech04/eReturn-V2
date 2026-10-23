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
      if (width>=1440) await page.getByRole('button',{name:'Language: English'}).click();
      else {
        await page.getByRole('button',{name:'Open navigation menu'}).click();
        await page.getByRole('button',{name:'Account & preferences'}).click();
        await page.getByRole('button',{name:'Language: English'}).click();
        await page.getByRole('button',{name:'নেভিগেশন মেনু বন্ধ করুন'}).click();
      }
    }
    await expect(page.getByRole('heading',{name:longLabel(bn,'Taxpayer Dashboard','করদাতার ড্যাশবোর্ড')})).toBeVisible();
    await expect(page.getByText(longLabel(bn,'Find certificates, acknowledgements and payment records when verified records are available.','যাচাইকৃত রেকর্ড পাওয়া গেলে সনদ, প্রাপ্তিস্বীকার ও পরিশোধের তথ্য এখানে দেখুন।'),{exact:false})).toBeVisible();
    await expect(page.getByText(longLabel(bn,'No official filing occurs on this page.','এই পৃষ্ঠায় সরকারি দাখিল হয় না।'),{exact:false})).toBeVisible();
    if(width>=1440) {
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
    expect(rects.buttonRadius).toBe('12px');
    expect(rects.overflow).toBeLessThanOrEqual(2);
    expect(rects.font).toBe(width>=768?'16px':'14px');
    if(width>=1280){
      expect(rects.right.x).toBeGreaterThan(rects.left.x);
      expect(rects.left.width/(rects.left.width+rects.right.width)).toBeGreaterThan(0.68);
      expect(rects.left.width/(rects.left.width+rects.right.width)).toBeLessThan(0.72);
    }
    await page.screenshot({path:'test-results/taxpay-shell/'+width+'-'+lang+'.png',fullPage:true,animations:'disabled'});
    expect(errors).toEqual([]);
  });
}

test('Audited Accounts remains reachable inside My Tax Return, not the primary navigation',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/return-workspace');
  await expect(page.locator('.er-desktop-rail .er-shell-cta')).toHaveText('My Tax Return');
  await expect(page.locator('.er-rail-primary .er-nav-link')).toHaveCount(2);
  await expect(page.locator('#audited-accounts')).toBeVisible();
  await page.locator('#audited-accounts a').click();
  await expect(page).toHaveURL(/\/\#\/user-panel\/audited-accounts$/);
});

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

test('appearance uses exact Sobaike buttons and source-defined light/dark/system palettes',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/return-workspace');
  const rail=page.locator('.er-desktop-rail');
  await expect(rail).toBeVisible();
  await rail.getByRole('button',{name:'Appearance'}).click();
  const chooser=rail.getByRole('button',{name:'Select theme'});
  const colors:Record<string,string>={light:'rgb(240, 242, 245)',dark:'rgb(24, 25, 26)'};
  for(const theme of ['dark','light']) {
    await chooser.click();
    await rail.getByRole('option',{name:theme==='dark'?'Dark':'Light'}).click();
    await expect(page.locator('html')).toHaveAttribute('data-er-theme',theme);
    await expect.poll(()=>page.locator('.er-app-shell').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(colors[theme]);
  }
  await page.emulateMedia({colorScheme:'dark'});
  await chooser.click();
  await rail.getByRole('option',{name:'System'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-er-theme','dark');
  await page.emulateMedia({colorScheme:'light'});
  await expect(page.locator('html')).toHaveAttribute('data-er-theme','light');
  const textSize=rail.getByRole('group',{name:'Text size'});
  await textSize.getByRole('button',{name:'Larger'}).click();
  await expect.poll(()=>page.locator('.er-app-shell').evaluate(e=>getComputedStyle(e).fontSize)).toBe('18px');
  await textSize.getByRole('button',{name:'Standard'}).click();
  await expect.poll(()=>page.locator('.er-app-shell').evaluate(e=>getComputedStyle(e).fontSize)).toBe('16px');
  await expect.poll(()=>page.locator('.er-app-shell').evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Noto Sans');
  const tokens=await page.locator('.er-shell-cta').evaluate(e=>{
    const style=getComputedStyle(e);
    return {radius:style.borderRadius,background:style.backgroundColor};
  });
  expect(tokens.radius).toBe('12px');
  expect(tokens.background).toBe('rgb(27, 77, 107)');
});

test('deep links and protected return records remain accessible',async ({page})=>{
  const pages=['assessment','income','employment','financial-assets','rent','agriculture','business','capital-gain','income-from-other-sources','firm-etc','aop','foreign-income','spouse-income','tax-exempted-income','voluntary-disclosure-income','rebate','expenditure','assets-liabilities','tax-payment','return-view','audited-accounts','tax-records','return-history','revised-return'];
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

test('in-session draft facts survive workspace/detail/dashboard navigation',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/return-workspace');
  await expect(page.locator('.er-shell-cta')).toHaveText('My Tax Return');
  await page.locator('.er-assessment-summary .er-button').click();
  await expect(page).toHaveURL(/\/\#\/user-panel\/assessment$/);
  await page.locator('input[name="residentStatus"][value="Resident"]').check();
  await page.getByRole('link',{name:/Back to My Tax Return/}).click();
  await expect(page.locator('#assessment .er-value')).toContainText('Resident');
  await page.getByRole('link',{name:'Dashboard',exact:true}).click();
  await expect(page.locator('.er-shell-cta')).toHaveText('My Tax Return');
  await page.locator('.er-shell-cta').click();
  await expect(page.locator('#assessment .er-value')).toContainText('Resident');
});
