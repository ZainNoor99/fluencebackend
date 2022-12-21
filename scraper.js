const puppeteer = require("puppeteer");

export default async function scraper(brand) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto(
    `https://www.tiktok.com/search?q=paid%20partnership%2C%20${encodeURIComponent(
      brand
    )}`
  );

  await page.waitForSelector('button[data-e2e="search-load-more"]', {
    visible: true,
  });

  console.log("done waiting");
  // await page.click('button[data-e2e="search-load-more"]');

  // await page.waitForSelector('button[data-e2e="search-load-more"]', {
  //   visible: true,
  // });

  // await page.waitForSelector('button[data-e2e="search-load-more"]', {
  //   visible: true,
  // });

  const users = [];

  // await page.waitForNavigation({
  //   waitUntil: "domcontentloaded",
  // });

  const videoLinks = [];
  const hrefs = await page.$$eval("a", (as) => as.map((a) => a.href));
  hrefs.forEach((link) => {
    if (link.includes("/video/")) {
      videoLinks.push(link);
    }
  });

  console.log(videoLinks);

  for (let i = 0; i < videoLinks.length; i++) {
    await page.goto(videoLinks[i]);
    await page.waitForSelector('div[data-e2e="browse-video-desc"]', {
      visible: true,
    });
    const descDiv = await page.$$eval(
      'div[data-e2e="browse-video-desc"]',
      (divs) => divs.map((div) => div.innerText)
    );
    const userDiv = await page.$$eval(
      'span[data-e2e="browse-username"]',
      (userDivs) => userDivs.map((div) => div.innerText)
    );
    const desc = descDiv[0].toLowerCase();
    const user = userDiv[0];
    if (
      (desc.includes("paidpartnership") ||
        desc.includes("ad") ||
        desc.includes("advertisement") ||
        desc.includes("paid partnership")) &&
      !users.includes(user)
      // tiktok-th3edt-PPaidPartnership
    ) {
      users.push(user);
    }
  }

  await browser.close();

  return users;
}

export const helper = function () {
  console.log("hello");
};
