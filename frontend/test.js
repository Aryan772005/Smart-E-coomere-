const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Log all errors
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    page.on('console', msg => {
      if(msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    });

    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login');
    
    console.log('Typing credentials...');
    await page.type('#email', 'buyer@reloqa.demo');
    await page.type('#password', 'demo1234');
    
    console.log('Submitting...');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);

    console.log('Navigated to:', page.url());
    
    // Wait for the blank screen to potentially happen
    await new Promise(r => setTimeout(r, 2000));
    
    // Log the current body HTML length
    const bodyLength = await page.evaluate(() => document.body.innerHTML.length);
    console.log('Body HTML length:', bodyLength);
    
    await browser.close();
    console.log('Done');
  } catch(e) {
    console.error('SCRIPT ERROR:', e);
  }
})();
