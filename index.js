const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.fondsound.com');

  let pagesToTraverse = [];
  let downloadPageUrls = [];

  const mostRecentAlbumPostUrl = await page.evaluate(() => document.querySelector('.entry-title a').getAttribute('href'));
  pagesToTraverse.push(mostRecentAlbumPostUrl);

  const startTime = new Date();

  // visit each album page; build up list of links from 'DOWNLOAD' a tag;
  while (pagesToTraverse.length > 0) {
    await page.goto(pagesToTraverse.shift());

    const newUrls = await page.evaluate((pagesToTraverse, downloadPageUrls) => {
      const linksOnPage = Array.from(document.querySelectorAll('a'));
      
      let newDownloadPageUrl;
      let newPageToTraverse;

      linksOnPage.forEach((link) => {
        if (link.innerText === "DOWNLOAD") {
          newDownloadPageUrl = link['href'];
        }

        if (link['rel'] && link['rel'] === 'prev') {
          newPageToTraverse = link['href'];
        }
      });
      
      return {
        newPageToTraverse,
        newDownloadPageUrl
      }
      // await page.screenshot({path: `${}.png`});
    }, pagesToTraverse, downloadPageUrls);

    const {
      newPageToTraverse,
      newDownloadPageUrl
    } = newUrls;

    // console.log('newDownloadPageUrl: ', newDownloadPageUrl);

    if (newPageToTraverse) {
      pagesToTraverse.push(newPageToTraverse);
    }

    if (newDownloadPageUrl) {
      downloadPageUrls.push(newDownloadPageUrl);
    }
  }

  const finishTime = new Date();
  const minutesTaken = (finishTime - startTime) / (60 * 1000);

  console.log('Minutes taken to scrape FOND SOND: ', minutesTaken);

  // save list to disk
  fs.writeFile(
    path.join(__dirname, 'pageUrls.txt'),
    downloadPageUrls,
    err => {
      console.log('there was an error: ', err);
    }
  );

  await browser.close();
})();
