import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 for(const width of [1440,1024,768,760,390,320]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/');
  await page.waitForFunction(()=>document.querySelector('#state').textContent==='OK' && document.querySelector('[data-view=research]').hidden);
  assert.equal(await page.locator('#endpoint').inputValue(),'');
  assert.equal(await page.locator('#native-options').getAttribute('open'),null);
  assert.equal(await page.locator('#cqn').textContent(),'Tôi yêu tiếng Việt');
  assert.equal(await page.locator('#cvss').textContent(),'Toiy iwy tizb Vidf');
  await page.locator('#lang-en').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('a[href="#about"] [data-en]').first().textContent(),'About');
  await page.locator('#lang-vi').click();assert.equal(await page.locator('html').getAttribute('lang'),'vi');
  await page.locator('#clear').click();assert.equal(await page.locator('#source').inputValue(),'');await page.locator('#sample').click();assert.equal(await page.locator('#cqn').textContent(),'Tôi yêu tiếng Việt');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.locator('#theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('#theme').click();await page.locator('#source').fill('Tôi yêu tiếng Việt');await page.locator('#source').press('Control+Enter');assert.equal(await page.locator('#state').textContent(),'OK');await page.evaluate(()=>location.hash='status');await page.locator('#audit').click();assert.equal(JSON.parse(await page.locator('#diagnostics').textContent()).tests.ok,true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow '+width);
  await page.evaluate(()=>location.hash='research');await page.locator('#lab-tone').selectOption('má');assert.ok(await page.locator('#lab-f0').isVisible());await page.locator('#theme').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'light theme overflow '+width);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#state').textContent==='OK');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.evaluate(()=>location.hash='atlas');await page.locator('#atlas-phone').selectOption('i');await page.locator('#atlas-view').selectOption('larynx');assert.ok(await page.locator('#atlas-svg').isVisible());await page.evaluate(()=>location.hash='spectrogram');await page.locator('#spec-fft').selectOption('512');assert.equal(JSON.parse(await page.locator('#spec-meta').textContent()).fft_size,512);assert.ok(await page.locator('#spec-image').isVisible());assert.deepEqual(errors,[]);
  await page.close();console.log('PASS viewport',width);
 }
}finally{await browser.close()}
