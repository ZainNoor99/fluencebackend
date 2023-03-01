const fs = require("fs");
const puppeteer = require("puppeteer");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function scraper(inputBrand = "Nike") {
  const userListWriteStream = fs.createWriteStream(
    `${inputBrand}-userList.csv`,
    {
      flags: "a",
    }
  );

  const videoListWriteStream = fs.createWriteStream(
    `${inputBrand}-videoList.csv`,
    {
      flags: "a",
    }
  );

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto(
    `https://www.tiktok.com/search?q=partner%2C%20${encodeURIComponent(
      inputBrand
    )}&t=${Date.now()}`
  );

  let i = 0;
  while (i < 1) {
    await page.waitForSelector('button[data-e2e="search-load-more"]', {
      visible: true,
    });

    await page.click('button[data-e2e="search-load-more"]');
    i++;
  }

  const users = [];
  const userObjs = [];

  const videoLinks = [];
  const hrefs = await page.$$eval("a", (as) => as.map((a) => a.href));
  hrefs.forEach((link) => {
    if (link.includes("/video/")) {
      videoListWriteStream.write(link + ",");
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
      //add the keywords:
      // collab
      (desc.includes("paidpartnership") ||
        desc.includes("ad") ||
        //dont really use this keyword
        desc.includes("advertisement") ||
        desc.includes("partnered") ||
        desc.includes("collab") ||
        desc.includes("collabed") ||
        desc.includes("collaboration") ||
        desc.includes("partnership") ||
        desc.includes("paid partnership")) &&
      !users.includes(user)
      // tiktok-th3edt-PPaidPartnership
    ) {
      userListWriteStream.write(user + ",");
      // fs.writeFile("userList.csv", user + ",", "utf8", function (err) {
      //   if (err) {
      //     console.log(
      //       "Some error occured - file either not saved or corrupted file saved."
      //     );
      //   } else {
      //     console.log(`User "${user}" saved!`);
      //   }
      // });
      users.push(user);
    }
  }

  console.log("all users: ", users);

  for (let i = 0; i < users.length; i++) {
    console.log("this is the user", users[i]);
    await page.goto(`https://www.tiktok.com/@${encodeURIComponent(users[i])}`);

    await page.waitForSelector('strong[data-e2e="followers-count"]', {
      visible: true,
    });

    const followersCountElement = await page.$$eval(
      'strong[data-e2e="followers-count"]',
      (elements) => elements.map((element) => element.innerText)
    );

    let followerCount = followersCountElement[0];
    let userBio =
      (await page.$$eval('h2[data-e2e="user-bio"]', (elements) =>
        elements.map((element) => element.innerText)
      )) || "";
    let userLink =
      (await page.$$eval('a[data-e2e="user-link"]', (elements) =>
        elements.map((element) => element.innerText)
      )) || "";

    console.log("userlink:", userLink);

    let userObj = {
      username: users[i],
      followers: followerCount,
      bio: userBio === "" ? "" : userBio[0],
      link: userLink === "" ? "" : userLink[0],
      profileLink: `https://www.tiktok.com/@${encodeURIComponent(users[i])}`,
    };

    userObjs.push(userObj);
  }
  // 'sbb_uk' -> 50000
  /*
  add tiktok bio for location and professional email
  */

  //bringing together influencers under the same niche
  //niche has become huge since our last meeting

  //focus on niche!!!!

  //filters thru and saves time yes but also incorporates niche filter

  //still displaying influencers
  //instead of just brand, its also a niche

  //manually go into tiktok with collab brand and niche to see if resutls are as expected

  //use more vauge language to include brands as secondary users i.e "my stats" -> "stats" or "influencer stats"

  //incorporate pink in results to bring the overall design together

  //make chat bubbles feel more like a conversation rn it's centered

  console.log("user objs", userObjs);
  await browser.close();

  // fs.writeFile("formList.csv", users.join(","), "utf8", function (err) {
  //   if (err) {
  //     console.log(
  //       "Some error occured - file either not saved or corrupted file saved."
  //     );
  //   } else {
  //     console.log("It's saved!");
  //   }
  // });

  return userObjs;
}

module.exports = {
  scraper: scraper,
};
