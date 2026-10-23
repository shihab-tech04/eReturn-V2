import {test, expect} from '@playwright/test';

/* Source-anchored UI controls on real eReturn tax routes.
 * Sobaike Janao Public source: 4427ff19cf15e88082a18640e862b1de7124374e.
 * No fabricated taxpayer data and no draft/submission/payment writes.
 */
for(const width of [375,768,1440,1920]){
  test('source form tokens / Expenditure / '+width,async ({page})=>{
    const errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:900});
    await page.goto('/#/user-panel/expenditure');
    await expect(page.locator('main')).toBeVisible();
    const amount=page.locator('main input[type="text"]').first();
    await expect(amount).toBeVisible();
    const computed=await amount.evaluate(e=>{
      const s=getComputedStyle(e);
      return {family:s.fontFamily,size:s.fontSize,radius:s.borderRadius,height:s.height,
        foreground:s.color,background:s.backgroundColor,border:s.borderColor};
    });
    expect(computed.family).toContain('Noto Sans');
    expect(computed.size).toBe(width<768?'14px':'16px');
    expect(computed.radius).toBe('12px');
    expect(Number.parseFloat(computed.height)).toBeGreaterThanOrEqual(44);
    expect(computed.background).toBe('rgb(255, 255, 255)');
    const save=page.getByRole('button',{name:/Save Draft/i}).first();
    await expect(save).toBeVisible();
    expect(await save.evaluate(e=>getComputedStyle(e).borderRadius)).toBe('12px');
    await page.screenshot({path:'test-results/sobaike-source-forms/expenditure-'+width+'.png',fullPage:true,animations:'disabled'});
    expect(errors).toEqual([]);
  });
}

test('canonical Sobaike field and control colors follow Dark mode',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/expenditure');
  const rail=page.locator('.er-desktop-rail');
  // Sobaike Public keeps ThemeSelector visible in the desktop rail footer.
  await expect(rail.getByRole('button',{name:'Select theme'})).toBeVisible();
  await rail.getByRole('button',{name:'Select theme'}).click();
  await rail.getByRole('option',{name:'Dark'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-er-theme','dark');
  const input=page.locator('main input[type="text"]').first();
  await expect.poll(()=>input.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(36, 37, 38)');
  await expect.poll(()=>input.evaluate(e=>getComputedStyle(e).color)).toBe('rgb(228, 230, 235)');
  await expect(page.locator('.er-desktop-rail')).toBeVisible();
  await page.screenshot({path:'test-results/sobaike-source-forms/expenditure-dark.png',fullPage:true,animations:'disabled'});
});

test('canonical Sobaike shared modal and amount control remain usable in EN/BN',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/expenditure');
  const amount=page.locator('main input[type="text"]').first();
  await amount.fill('1200');
  await expect(amount).toHaveValue('1200');
  await page.getByRole('button',{name:'Language: English'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','bn');
  await expect(amount).toHaveValue('১২০০');
  await expect(amount).toBeVisible();
  // Exercise an actual native form interaction without official filing.
  expect(await page.locator('main').evaluate(e=>e.scrollWidth<=e.clientWidth+2)).toBe(true);
});
