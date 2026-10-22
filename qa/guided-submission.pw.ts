import { test, expect } from '@playwright/test';

for (const width of [375,768,1440]) for (const lang of ['en','bn'] as const) {
  test('guided full screen / '+width+' / '+lang, async ({page}) => {
    const errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:900});
    await page.goto('/#/user-panel/return-workspace');
    await expect(page.getByRole('link',{name:/Review & Submit|পর্যালোচনা ও দাখিল/})).toBeVisible();
    await page.getByRole('link',{name:/Review & Submit|পর্যালোচনা ও দাখিল/}).click();
    await expect(page).toHaveURL(/\/user-panel\/submission$/);
    await expect(page.locator('.er-desktop-rail,.er-mobile-bottom,.er-compact-header,.er-shell-footer')).toHaveCount(0);
    await expect(page.locator('nav')).toHaveCount(0);
    if (lang==='bn') await page.getByRole('button',{name:'বাংলায় দেখুন'}).click();
    await expect(page.locator('.er-guided-steps li')).toHaveCount(3);
    await expect(page.locator('.er-guided-review-row')).toHaveCount(5);
    await expect(page.getByRole('heading',{name:lang==='bn'?'আয়কর রিটার্ন দাখিল':'Submit Your Tax Return'})).toBeVisible();
    await expect(page.getByRole('button',{name:lang==='bn'?'খসড়া ডাউনলোড ও প্রস্থান':'Download Draft & Exit'})).toBeVisible();
    await page.getByRole('button',{name:lang==='bn'?'পরবর্তী':'Next'}).click();
    await expect(page.locator('.er-guided-step-label')).toHaveText('2 / 3');
    await expect(page.getByText(lang==='bn'?'হিসাব হয়নি':'Not calculated')).toBeVisible();
    await page.getByRole('button',{name:lang==='bn'?'পরবর্তী':'Next'}).click();
    await expect(page.locator('.er-guided-step-label')).toHaveText('3 / 3');
    await expect(page.getByRole('button',{name:lang==='bn'?'রিটার্ন দাখিল':'Submit Return'})).toBeDisabled();
    await expect(page.locator('nav')).toHaveCount(0);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
  });
}
test('editing assessment preserves entered facts and returns to review without navigation',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/#/user-panel/submission');
  await page.locator('[data-section="personal"]').getByRole('button',{name:/^Assessment —/}).click();
  await expect(page).toHaveURL(/\/user-panel\/submission\/edit\/assessment\?step=1$/);
  await expect(page.locator('.er-desktop-rail,.er-mobile-bottom,.er-compact-header,nav')).toHaveCount(0);
  await expect(page.locator('input[name="residentStatus"][value="Resident"]')).toBeVisible();
  await page.locator('input[name="residentStatus"][value="Resident"]').check();
  await page.getByRole('button',{name:'Save & Return to Review'}).first().click();
  await expect(page.locator('.er-guided-step-label')).toHaveText('1 / 3');
  await page.locator('[data-section="personal"]').getByRole('button',{name:/^Assessment —/}).click();
  await expect(page.locator('input[name="residentStatus"][value="Resident"]')).toBeChecked();
  await page.getByRole('button',{name:'Back to Review'}).click();
  await expect(page.locator('.er-guided-review-row')).toHaveCount(5);
});
test('all 13 income editors reachable inside distraction-free guided mode',async ({page})=>{
  await page.goto('/#/user-panel/submission');
  await page.locator('[data-section="income"]').getByRole('button',{name:/Edit/}).click();
  await expect(page).toHaveURL(/\/user-panel\/submission\/edit\/income\?step=1$/);
  const links=page.locator('.er-guided-income-grid a');
  await expect(links).toHaveCount(13);
  await links.first().click();
  await expect(page).toHaveURL(/\/user-panel\/submission\/edit\/employment\?step=1$/);
  await expect(page.locator('nav,.er-desktop-rail,.er-compact-header,.er-mobile-bottom')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Save & Return to Review'}).first()).toBeVisible();
  await page.getByRole('button',{name:'Save & Return to Review'}).first().click();
  await expect(page.locator('.er-guided-step-label')).toHaveText('1 / 3');
});
test('payment editor returns to Step 2; final review never fabricates a filing',async ({page})=>{
  await page.goto('/#/user-panel/submission?step=2');
  await page.getByRole('button',{name:'Edit Tax & Payment'}).click();
  await expect(page).toHaveURL(/\/user-panel\/submission\/edit\/tax-payment\?step=2$/);
  await expect(page.locator('.er-desktop-rail,.er-mobile-bottom,.er-compact-header,nav')).toHaveCount(0);
  await page.getByRole('button',{name:'Save & Return to Review'}).first().click();
  await expect(page.locator('.er-guided-step-label')).toHaveText('2 / 3');
  await page.getByRole('button',{name:'Next'}).click();
  await page.getByRole('button',{name:'View Full Draft Return'}).click();
  await expect(page.locator('.er-guided-preview')).toBeVisible();
  await expect(page.getByRole('button',{name:'Submit Return'})).toBeDisabled();
  await expect(page.locator('.er-guided-blocked')).toContainText('No filing number or acknowledgement will be created');
});
