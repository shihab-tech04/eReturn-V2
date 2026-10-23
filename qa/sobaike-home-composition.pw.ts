import { test, expect } from '@playwright/test';

/**
 * Source-composition acceptance: Sobaike Public HomePage source 97d23297.
 * Only eReturn tax data and routes differ from the public reporting portal.
 */
for(const width of [375,768,1440,1920]){
  test('Sobaike source home composition and active controls '+width+'px',async ({page})=>{
    await page.setViewportSize({width,height:900});
    const errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/#/user-panel/home');
    const hero=page.getByRole('region',{name:'Tax service highlights hero banner'});
    await expect(hero).toBeVisible();
    await expect(page.locator('#er-home-service-carousel .hero-slider-track')).toBeVisible();
    await expect(page.locator('#er-home-feed-section')).toBeVisible();
    await expect(page.locator('.er-sobaike-home .er-home-filters button')).toHaveCount(3);
    await expect(page.locator('.er-guided-home-step-list>li')).toHaveCount(3);
    await expect(page.locator('.er-tax-feed-card')).toHaveCount(4);
    await expect(page.locator('.er-home-feed-actions [data-entry="ereturn-submission"]')).toBeVisible();
    await expect(page.getByRole('link',{name:'Start My Tax Return'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Your next steps'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Your draft at a glance'})).toBeVisible();
    const shape=await page.evaluate(()=>{
      const main=document.querySelector('#er-main')!.getBoundingClientRect();
      const hero=document.querySelector('#er-home-service-carousel')!.getBoundingClientRect();
      const card=document.querySelector('.er-tax-feed-card')!.getBoundingClientRect();
      const chip=document.querySelector('.er-home-filters button')!;
      const root=getComputedStyle(document.documentElement);
      return {main:main.width,hero:hero.width,card:card.width,chipRadius:getComputedStyle(chip).borderRadius,
        font:getComputedStyle(document.body).fontFamily,
        bodySize:getComputedStyle(document.body).fontSize,
        bg:root.getPropertyValue('--ui-page').trim(),
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    expect(shape.overflow).toBeLessThanOrEqual(2);
    expect(shape.main).toBeLessThanOrEqual(902);
    expect(shape.hero).toBeLessThanOrEqual(shape.main+2);
    expect(shape.card).toBeLessThanOrEqual(shape.main+2);
    expect(shape.chipRadius).toBe('9999px');
    expect(shape.font).toContain('Noto Sans');
    expect(shape.bodySize).toBe(width>=768?'16px':'14px');
    await page.screenshot({path:'test-results/sobaike-home-composition/home-'+width+'.png',fullPage:true,animations:'disabled'});
    expect(errors).toEqual([]);
  });
}
test('carousel arrows and filter chips work without mutating tax records',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/home');
  const hero=page.getByRole('region',{name:'Tax service highlights hero banner'});
  await hero.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('link',{name:'Review assessment'})).toBeVisible();
  await page.locator('#er-feed-records').click();
  await expect(page.locator('.er-guided-home-step-list>li')).toHaveCount(0);
  await expect(page.locator('.er-guided-home-records')).toBeVisible();
  await page.locator('#er-feed-all').click();
  await expect(page.locator('.er-guided-home-step-list>li')).toHaveCount(3);
  await expect(page.locator('#er-feed-all')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('link',{name:'Submission review'})).toBeVisible();
});
test('Bengali and dark theme preserve original Sobaike visual tokens',async({page})=>{
  await page.setViewportSize({width:1920,height:900});
  await page.goto('/#/user-panel/home');
  await page.getByRole('button',{name:'Language: English'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','bn');
  await expect(page.getByRole('heading',{name:'পরবর্তী করণীয়'})).toBeVisible();
  await expect(page.getByRole('link',{name:'আমার রিটার্ন শুরু করুন'})).toBeVisible();
  await page.getByRole('button',{name:'Appearance'}).click();
  await page.getByRole('button',{name:'Select theme'}).click();
  await page.getByRole('option',{name:'Dark'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  const ui=await page.evaluate(()=>({
    family:getComputedStyle(document.body).fontFamily,
    page:getComputedStyle(document.documentElement).getPropertyValue('--ui-page').trim(),
    heroRadius:getComputedStyle(document.querySelector('#er-home-service-carousel')!).borderRadius
  }));
  expect(ui.family).toContain('Noto Sans Bengali');
  expect(ui.page).toBe('#18191A');
  expect(ui.heroRadius).toBe('16px');
  await page.screenshot({path:'test-results/sobaike-home-composition/home-bn-dark.png',fullPage:true,animations:'disabled'});
});
