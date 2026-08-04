const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/Users/linrui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const projectDir = path.resolve(__dirname, '..');
const outputDir = path.join(projectDir, 'output');

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Launching headless Chrome...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    timeout: 15000,
  });
  console.log('Chrome launched.');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());

  for (const concept of ['a', 'b', 'c']) {
    console.log(`Loading concept ${concept.toUpperCase()}...`);
    await page.goto(`http://localhost:3100/concept-${concept}`, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images).map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      }));
    });

    const metrics = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      brokenImages: Array.from(document.images)
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.alt),
    }));

    if (metrics.width !== 1440 || metrics.scrollWidth !== 1440 || metrics.scrollHeight !== 2400 || metrics.brokenImages.length) {
      throw new Error(`Concept ${concept.toUpperCase()} failed capture checks: ${JSON.stringify(metrics)}`);
    }

    const file = path.join(outputDir, `homepage-${concept}-1440x2400.png`);
    await page.screenshot({ path: file, type: 'png', fullPage: true });
    console.log(JSON.stringify({ concept, file, metrics }));
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
