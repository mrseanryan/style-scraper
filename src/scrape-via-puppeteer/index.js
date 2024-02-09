import puppeteer from 'puppeteer';

(async () => {
    const args = process.argv.slice(2);
    if (args.length != 1) {
        console.error("USAGE: <URL to the webpage>");
        process.exit(42);
    }
    const url = args[0];

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: false,
        timeout: 5000
    });

    try {
        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(url);

        // Set screen size
        await page.setViewport({ width: 1280, height: 1024 });
        await page.goto(url, { waitUntil: ['load', 'domcontentloaded', 'networkidle2'] });

        await scrollToLoadFullPage(page);

        const pathToScreenshot = './temp/screenshot.jpg'
        console.log(`Saving screenshot to: ${pathToScreenshot}`)
        await page.screenshot({ type: 'jpeg', path: pathToScreenshot, fullPage: true });

        // Locate the full title with a unique string
        // const textSelector = await page.waitForSelector(
        //     'text/Customize and automate'
        // );
        // const fullTitle = await textSelector?.evaluate(el => el.textContent);
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close();
    }
})();

async function scrollToLoadFullPage(page) {
    return await page.evaluate(async () => {
        return await new Promise((resolve, reject) => {
            var i = setInterval(() => {
                window.scrollBy(0, window.innerHeight);
                if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
                    window.scrollTo(0, 0);
                    clearInterval(i);
                    resolve();
                }
            }, 100);
        });
    });
}
