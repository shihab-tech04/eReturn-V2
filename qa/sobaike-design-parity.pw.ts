import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Source of truth: Sobaike-janao-public main b647e864655a29abe6f0910e620185d3ebe43329.
// git blob SHA (not display names) ensures every shared component is byte-identical.
const components: Record<string, string> = {
  'Accordion.tsx':'5c9b4dea8938d9d2cbf9c1bcac82d9fde154ba78',
  'Button.tsx':'e110c62366933019752a91f8520d8b4c52fac258',
  'Checkbox.tsx':'ec58c044abc8815cbe762f7a0f1c3e6c84927454',
  'Drawer.tsx':'b1d8269f4421a5c301057c75ea87866aa1f54e2d',
  'FilterChip.tsx':'53d85b925517553bb05d3edbbaa8dbe99fb4cc5c',
  'LoadingSkeleton.tsx':'2a9d7212cfe45c20f6ef95146d8e8302cf1acb87',
  'EmptyState.tsx':'95f328345c5122fece3ffe81bf61e62a4b3c42e0',
  'IconButton.tsx':'c17778a9c4d5e1ea94c033c12a06d682e5a7218a',
  'Modal.tsx':'32b3ff32b75883d0b322cf8db2a37d109a6eb18b',
  'SearchInput.tsx':'c5b31dded9b93f82343c62d2c2317db3705ae74b',
  'SearchableSelect.tsx':'ef52f3dac643b26e103fad92d53c6ddd0e89d4cf',
  'Select.tsx':'a5cc1066b0401c60516d9e59e19653cfa70d6a7f',
  'TextSizeSelector.tsx':'6583bc86633e5e9b4f46e01c69e1ce39d7135805',
  'ThemeSelector.tsx':'0f39154f97c6d622c29de8689d3721c0c00ebe44',
  'Toggle.tsx':'c24b9eb5193c7af267e998433cf8a3a7ccd1cde0',
};
test('all 15 relevant Sobaike UI components have original source blob identity', () => {
  for(const [filename,expectedSha] of Object.entries(components)){
    const contents=readFileSync(join(process.cwd(),'src/components/sobaike-ui',filename));
    const prefix=Buffer.concat([Buffer.from('blob '+contents.length,'utf8'),Buffer.from([0])]);
    const sha=createHash('sha1').update(prefix).update(contents).digest('hex');
    expect(sha, filename).toBe(expectedSha);
  }
});
test('canonical Sobaike text tokens and single Tailwind import remain present',()=>{
  const index=readFileSync(join(process.cwd(),'src/index.css'),'utf8');
  const canonical=readFileSync(join(process.cwd(),'src/styles/sobaike-canonical.css'),'utf8');
  expect(index).toContain('@import "tailwindcss";');
  expect(canonical).not.toContain('@import "tailwindcss";');
  for(const token of ['--font-ui:','--type-body-size:','--type-h1-size-desktop:','--type-h2-size-tablet:','--type-label-size:','--radius-control:','--ui-primary-action-bg:']){
    expect(canonical,token).toContain(token);
  }
  expect(index).not.toContain('font-family: "Noto Sans", "Noto Sans Bengali"');
});
for(const width of [375,768,1280,1920]){
  test(`canonical typography and responsive content ${width}px`,async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#/user-panel/home');
    const observations=await page.evaluate(()=>{
      const root=getComputedStyle(document.documentElement);
      const read=(key:string)=>root.getPropertyValue(key).trim();
      const h1=document.querySelector('main h1')!;
      const small=document.querySelector('main small');
      const main=document.querySelector('main#er-main')!;
      return {
        language:document.documentElement.lang,
        bodyFamily:getComputedStyle(document.body).fontFamily,
        heading:getComputedStyle(h1).fontSize,
        bodySize:getComputedStyle(document.body).fontSize,
        smallSize:small?getComputedStyle(small).fontSize:'',
        h1Mobile:read('--type-h1-size-mobile'),
        h1Tablet:read('--type-h1-size-tablet'),
        h1Desktop:read('--type-h1-size-desktop'),
        bodyToken:read('--type-body-size'),
        metaToken:read('--type-meta-size'),
        scale:parseFloat(read('--reader-scale'))||1,
        mainWidth:main.getBoundingClientRect().width,
        documentWidth:document.documentElement.scrollWidth
      };
    });
    expect(observations.bodyFamily).toContain('Noto Sans');
    const headingToken=width>=1440?observations.h1Desktop:width>=768?observations.h1Tablet:observations.h1Mobile;
    expect(parseFloat(observations.heading)).toBeCloseTo(parseFloat(headingToken)*observations.scale,0);
    expect(parseFloat(observations.bodySize)).toBeCloseTo(parseFloat(observations.bodyToken)*observations.scale,0);
    expect(parseFloat(observations.smallSize)).toBeCloseTo(parseFloat(observations.metaToken)*observations.scale,0);
    // Sobaike source PublicPageContainer keeps its centered 900px content width;
    // the tax return editor has its own deliberately wide 70:30 workspace route.
    if(width===1920) {
      expect(observations.mainWidth).toBeGreaterThanOrEqual(895);
      expect(observations.mainWidth).toBeLessThanOrEqual(901);
      await page.goto('/#/user-panel/profile');
      const formWidth=await page.locator('#er-main').evaluate(e=>e.getBoundingClientRect().width);
      expect(formWidth).toBeLessThanOrEqual(901);
    }
    expect(observations.documentWidth).toBeLessThanOrEqual(width);
  });
}
test('Bengali typography inherits source Noto Sans Bengali preference',async ({page})=>{
  await page.setViewportSize({width:1920,height:900});
  await page.goto('/#/user-panel/home');
  await page.getByRole('button',{name:'Language: English'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','bn');
  const fonts=await page.evaluate(()=>({
    token:getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim(),
    body:getComputedStyle(document.body).fontFamily
  }));
  expect(fonts.token).toContain('Noto Sans Bengali');
  expect(fonts.body).toContain('Noto Sans Bengali');
});

for(const width of [375,768,1440,1920]){
  test(`Sobaike source shell and feed geometry ${width}px`,async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#/user-panel/home');
    const v=await page.evaluate(()=>{
      const main=document.querySelector('#er-main')!.getBoundingClientRect();
      const feed=document.querySelector('#er-home-feed-section')!;
      const cards=Array.from(document.querySelectorAll<HTMLElement>('.er-tax-feed-card')).map(el=>el.getBoundingClientRect());
      const rail=document.querySelector('.er-desktop-rail')!.getBoundingClientRect();
      const header=document.querySelector('.er-compact-header')!;
      const mobileMenu=document.querySelector('.er-mobile-header-menu')!.getBoundingClientRect();
      const brand=document.querySelector('.er-compact-brand')!.getBoundingClientRect();
      return {
        main:{x:main.x,width:main.width},
        feedDisplay:getComputedStyle(feed).display,
        cards:cards.length,
        rowY:cards.map(r=>r.top),
        rail:{width:rail.width,shown:getComputedStyle(document.querySelector('.er-desktop-rail')!).display!=='none'},
        headerShown:getComputedStyle(header).display!=='none',
        mobileMenu:{x:mobileMenu.x,width:mobileMenu.width},
        brandX:brand.x,
        docWidth:document.documentElement.scrollWidth
      };
    });
    expect(v.feedDisplay).toBe('block');
    expect(v.cards).toBe(4);
    expect(v.rowY[1]).toBeGreaterThan(v.rowY[0]);
    expect(v.rowY[2]).toBeGreaterThan(v.rowY[1]);
    expect(v.rowY[3]).toBeGreaterThan(v.rowY[2]);
    if(width>=1440) {
      expect(v.main.width).toBeGreaterThanOrEqual(895);
      expect(v.main.width).toBeLessThanOrEqual(901);
    }else{
      expect(v.main.width).toBeLessThanOrEqual(width);
    }
    expect(v.docWidth).toBeLessThanOrEqual(width);
    if(width>=1440){
      expect(v.rail.shown).toBe(true);
      expect(v.rail.width).toBe(width>=1920?260:240);
      expect(v.headerShown).toBe(false);
      expect(v.main.width).toBeGreaterThanOrEqual(895);
    }else{
      expect(v.rail.shown).toBe(false);
      expect(v.headerShown).toBe(true);
    }
    if(width<768){
      expect(v.mobileMenu.width).toBeGreaterThanOrEqual(44);
      expect(v.mobileMenu.x).toBeLessThan(v.brandX);
    }
    await page.screenshot({path:`test-results/sobaike-geometry/home-${width}.png`,fullPage:true,animations:'disabled'});
  });
}

test('Sobaike source-style bilingual rail logo and always-visible appearance controls',async ({page})=>{
  await page.setViewportSize({width:1920,height:900});
  await page.goto('/#/user-panel/home');
  const rail=page.locator('.er-desktop-rail');
  const logo=rail.locator('.er-tax-brand-logo');
  await expect(logo).toBeVisible();
  await expect(logo.locator('[lang="bn"]')).toHaveText('ই-রিটার্ন');
  await expect(logo.locator('[lang="en"]')).toHaveText('eReturn V2');
  const mark=await logo.locator('.er-tax-brand-mark').boundingBox();
  expect(mark?.width).toBe(36);
  expect(mark?.height).toBe(36);
  const fonts=await logo.evaluate(e=>{
    const bn=e.querySelector<HTMLElement>('[lang=bn]')!;
    const en=e.querySelector<HTMLElement>('[lang=en]')!;
    return {bnFamily:getComputedStyle(bn).fontFamily,enFamily:getComputedStyle(en).fontFamily,
      bnSize:getComputedStyle(bn).fontSize,enSize:getComputedStyle(en).fontSize};
  });
  expect(fonts.bnFamily).toContain('Noto Sans Bengali');
  expect(fonts.enFamily).toContain('Noto Sans');
  expect(fonts.bnSize).toBe('18px');
  expect(fonts.enSize).toBe('14px');
  await expect(rail.getByRole('button',{name:'Select theme'})).toBeVisible();
  await expect(rail.getByRole('group',{name:'Text size'})).toBeVisible();
  await expect(rail.getByRole('button',{name:'Language: English'})).toBeVisible();
  await page.screenshot({path:'test-results/sobaike-geometry/rail-source-mark.png',fullPage:true,animations:'disabled'});
});
test('Sobaike mobile header compresses on scroll and bottom nav clears for text entry',async ({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/#/user-panel/home');
  const header=page.locator('.er-compact-header');
  await expect(header).toHaveAttribute('data-compact','false');
  const menu=page.locator('.er-mobile-header-menu');
  const logo=page.locator('.er-compact-header .er-tax-brand-logo');
  await expect(menu).toBeVisible();
  await expect(logo).toBeVisible();
  const menuRect=await menu.boundingBox(), logoRect=await logo.boundingBox();
  expect(menuRect!.x).toBeLessThan(logoRect!.x);
  await page.evaluate(()=>window.scrollTo(0,180));
  await expect(header).toHaveAttribute('data-compact','true');
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect(header).toHaveAttribute('data-compact','false');
  await page.goto('/#/user-panel/expenditure');
  const field=page.locator('main input[type="text"]').first();
  await field.focus();
  await expect(page.locator('.er-mobile-bottom')).toHaveAttribute('data-keyboard-active','true');
  await expect(page.locator('.er-mobile-bottom')).toBeHidden();
  await field.evaluate(el=>(el as HTMLInputElement).blur());
  await expect(page.locator('.er-mobile-bottom')).toHaveAttribute('data-keyboard-active','false');
  await expect(page.locator('.er-mobile-bottom')).toBeVisible();
});
