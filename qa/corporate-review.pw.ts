import { test, expect } from '@playwright/test';

/** Synthetic, unsigned PDF fixture; never real taxpayer/auditor data. */
function syntheticReportPdf(): Buffer {
  const stream = [
    'BT /F1 12 Tf 40 735 Td',
    '(Statement of Financial Position) Tj',
    '0 -24 Td (Total assets 1000.00 900.00) Tj',
    '0 -24 Td (Total equity and liabilities 1000.00 900.00) Tj',
    'ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + Buffer.byteLength(stream) + ' >>\nstream\n' + stream + '\nendstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }
  const xref = Buffer.byteLength(pdf);
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  return Buffer.from(pdf, 'utf8');
}

for (const width of [375, 768, 1280, 1920]) {
  for (const language of ['en', 'bn'] as const) {
    test(`corporate PDF review remains scoped, bilingual and responsive ${width}px ${language}`, async ({page}) => {
      test.setTimeout(90000);
      await page.setViewportSize({width, height: 900});
      await page.goto('/#/user-panel/audited-accounts');
      if (language === 'bn') {
        const visibleLang = () => page.locator('button:visible').filter({hasText: 'Language: English'}).first();
        if (!(await visibleLang().isVisible())) {
          await page.getByRole('button', {name:'Open navigation menu'}).click();
          await page.getByRole('button', {name:'Account & preferences'}).click();
        }
        await visibleLang().click();
        const close = page.getByRole('button', {name:'Close navigation menu'});
        if (await close.isVisible()) await close.click();
      }

      const title = language === 'bn' ? 'নিরীক্ষিত কোম্পানির প্রতিবেদন আমদানি' : 'Import audited corporate report';
      const chooser = language === 'bn' ? 'আর্থিক প্রতিবেদন বেছে নিন (PDF)' : 'Choose financial report (PDF)';
      await expect(page.getByRole('heading', {name:title})).toBeVisible();
      await page.getByLabel(chooser).setInputFiles({
        name:'synthetic-audit.pdf', mimeType:'application/pdf', buffer:syntheticReportPdf(),
      });
      await expect(page.getByText('synthetic-audit.pdf', {exact:false})).toBeVisible();
      await expect(page.getByText('PDFJS_TEXT_V1')).toHaveCount(0);
      await expect(page.getByText(language === 'bn'
        ? /কোম্পানির কর গণনা বন্ধ/
        : /Corporate tax calculation blocked/)).toBeVisible();

      // Malformed replacement must be refused without losing the review.
      await page.getByLabel(chooser).setInputFiles({
        name:'invalid.pdf',mimeType:'application/pdf',buffer:Buffer.from('NOT_A_PDF'),
      });
      await expect(page.getByRole('alert').filter({hasText:'INVALID_PDF_SIGNATURE'})).toBeVisible();
      await expect(page.getByText('synthetic-audit.pdf', {exact:false})).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(width);
    });
  }
}
