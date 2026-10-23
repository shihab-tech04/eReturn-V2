import { test, expect } from '@playwright/test';

for (const width of [375, 768, 1280, 1920]) {
  test('Sobaike native help drawer adapts and preserves keyboard focus at '+width+'px', async ({page}) => {
    await page.setViewportSize({width, height:900});
    await page.goto('/#/user-panel/assessment');
    const trigger=page.locator('[data-er-help-launcher]');
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await trigger.press('Enter');
    const drawer=page.getByRole('dialog',{name:'eReturn guided help'});
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('h3').first()).toContainText('Assessment details');
    const panel=drawer.locator('> div').last();
    await expect(panel).toBeVisible();
    const metrics=await drawer.evaluate(element=>{
      const container=element.lastElementChild as HTMLElement;
      return {
        position:getComputedStyle(container).position,
        top:container.getBoundingClientRect().top,
        viewport:window.innerHeight,
        actualBodyFont:parseFloat(getComputedStyle(element.querySelector('.er-help-topic p')!).fontSize),
        className:container.className,
        rootWidth:document.documentElement.scrollWidth
      };
    });
    expect(metrics.position).toBe('fixed');
    expect(metrics.rootWidth).toBeLessThanOrEqual(width);
    expect(metrics.actualBodyFont).toBeGreaterThanOrEqual(14);
    if(width<768) {
      expect(metrics.className).toContain('rounded-t-2xl');
      expect(metrics.top).toBeGreaterThan(0);
    }else{
      expect(metrics.className).toContain('max-w-md');
    }
    await expect(page.getByRole('button',{name:'Close panel'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test('help uses contextual label rather than taxpayer input value', async ({page})=>{
  await page.goto('/#/user-panel/profile');
  const inputs=page.locator('main input:not([type=password]):not([type=hidden])');
  await expect(inputs.first()).toBeVisible();
  await inputs.first().focus();
  await page.locator('[data-er-help-launcher]').click();
  const drawer=page.getByRole('dialog',{name:'eReturn guided help'});
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText('Your question')).toBeVisible();
  await expect(drawer.getByText('Questions stay in this browser session',{exact:false})).toBeVisible();
  await expect(drawer.getByText('Live AI is not connected',{exact:false})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});
