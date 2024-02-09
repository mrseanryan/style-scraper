# style-scraper
Scrape styles from a website [fonts and colors]

## Example output

```
Saving screenshot to: ./temp/screenshot.jpg
Get element by co-ordinates (960, 360)
SPAN
HTML > BODY > MAIN > SENSES-GLOBAL-SITES > SENSES-GLOBAL-SITES-PAGE-RENDERER > DIV > PAGE-HOME > FEATURE-ENTITIES-RENDERER > SECTION > FEATURE-PERSONAL-WEBCONTAINER > DIV > DIV > FEATURE-PANORAMA-BANNER > DIV > DIV > DIV > A > DIV > DIV > IMG > SFC-CARD > SFC-CARD-CONTENT > SFC-BUTTON > BUTTON > SPAN
{
  borderColors: [
    'rgb(255, 255, 255)',
    'rgba(0, 0, 0, 0)',
    'rgb(32, 33, 34)',
    'rgb(0, 0, 238)'
  ],
  colors: [ 'rgb(255, 255, 255)', 'rgb(32, 33, 34)', 'rgb(0, 0, 238)' ],
  fontFamilies: [ 'Myriad, "Segoe UI", "Helvetica Neue", arial, sans-serif' ],
  fontSizes: [ '19px' ],
  backgroundColors: [ 'rgb(250, 100, 0)', 'rgb(25, 25, 124)' ]
}
```

## Setup

### Pre-requisites

- OS: Ubuntu

- nodejs
  - node version 18

```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
source ~/.bashrc
source ~/.profile

nvm install 18
nvm use 18
```

### Install

```
./install.sh
```

```
npm test
```

## Usage

```
./go.sh <URL to website>
```

## References

- https://pptr.dev/
- https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
