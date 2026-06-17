const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  // go to results and pre-fill game state so the win card shows
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshot_splash.png", fullPage: false });

  // navigate to results directly
  await page.goto("http://localhost:5173/results");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshot_results.png", fullPage: false });

  await browser.close();
  console.log("done");
})();
