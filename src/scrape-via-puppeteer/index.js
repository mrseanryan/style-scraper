import puppeteer from 'puppeteer';

const createBrowserCode = (x, y) => `
{
    const x = ${x};
    const y = ${y};

    const elements = document.elementsFromPoint(x, y)

    class Styles {
        // Returns a dummy iframe with no styles or content
        // This allows us to get default styles from the browser for an element
        static getStylesIframe() {
            if (typeof window.blankIframe != 'undefined') {
                return window.blankIframe;
            }

            window.blankIframe = document.createElement('iframe');
            document.body.appendChild(window.blankIframe);

            return window.blankIframe;
        }

        // Turns a CSSStyleDeclaration into a regular object, as all values become "" after a node is removed
        static getStylesObject(node, parentWindow) {
            const styles = parentWindow.getComputedStyle(node);
            let stylesObject = {};

            for (let i = 0; i < styles.length; i++) {
                const property = styles[i];
                stylesObject[property] = styles[property];
            }

            return stylesObject;
        }

        // Returns a styles object with the browser's default styles for the provided node
        static getDefaultStyles(node) {
            const iframe = Styles.getStylesIframe();
            const iframeDocument = iframe.contentDocument;
            const targetElement = iframeDocument.createElement(node.tagName);

            iframeDocument.body.appendChild(targetElement);
            const defaultStyles = Styles.getStylesObject(targetElement, iframe.contentWindow);

            targetElement.remove();

            return defaultStyles;
        }

        // Returns a styles object with only the styles applied by the user's CSS that differ from the browser's default styles
        static getUserStyles(node) {
            const defaultStyles = Styles.getDefaultStyles(node);
            const styles = Styles.getStylesObject(node, window);
            let userStyles = {};

            for (let property in defaultStyles) {
                if (styles[property] != defaultStyles[property]) {
                    userStyles[property] = styles[property];
                }
            }

            return userStyles;
        }
    };

    const filteredStyles = {};

    elements.forEach(element => {
        // filters out 'default' styles that are noise
        const userStyles = Styles.getUserStyles(element)

        const interestingStyles = {
            "font-family": "fontFamilies",
            "font-size": "fontSizes",
            "background-color": "backgroundColors",
            "color": "colors",
            // "border*color": "borderColors"
        }

        for (const userStyle in userStyles) {
            if (!userStyles.hasOwnProperty(userStyle))
                return;

            const isBorderColor = (userStyle.includes('border') && userStyle.includes('color'))
            const isInteresting = interestingStyles[userStyle] || isBorderColor

            if (isInteresting) {
                const target = isBorderColor ? 'borderColors' : interestingStyles[userStyle]
                if (!filteredStyles[target]) {
                    filteredStyles[target] = []
                }
                const value = userStyles[userStyle]
                if (!filteredStyles[target].includes(value)) {
                    filteredStyles[target].push(value)
                }
            }
        }
    });

    return filteredStyles
}`;

(async () => {
    const args = process.argv.slice(2);
    if (args.length != 3) {
        console.error("USAGE: <URL to the webpage> <x> <y>");
        process.exit(42);
    }
    const url = args[0];
    const x = args[1];
    const y = args[2];

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: true,
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

        console.log(`Get element by co-ordinates (${x}, ${y})`)
        console.log(await page.evaluate(() => {
            return document.elementFromPoint(960, 360).tagName
        }));

        console.log(await page.evaluate(() => {
            return document.elementsFromPoint(960, 360)
                .map(({ tagName }) => tagName).reverse().join(' > ');
        }));

        // Passing functions and args to page.evaluate() is tricky - here we serialize the code as a string
        const browserResult = await page.evaluate(`(async() => {
            ${createBrowserCode(x, y)};

            return 666; // eval is evil
         })()`);
        console.log(browserResult);
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
