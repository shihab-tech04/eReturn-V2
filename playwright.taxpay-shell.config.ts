import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./qa', testMatch:['taxpay-shell.pw.ts','sobaike-canonical-forms.pw.ts','guided-submission.pw.ts','contextual-help.pw.ts'], timeout:45000,
 expect:{timeout:10000}, workers:2, retries:0, reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
 use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:3000',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:3000',timeout:120000,reuseExistingServer:false},
});
