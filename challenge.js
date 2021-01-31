const playwright = require('playwright');

async function getDailyChallenge(currentMonth, currentYear, currentDay) {
    let result = {};

    const browser = await playwright['firefox'].launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://leetcode.com/accounts/login/');
    await page.fill("#id_login", process.env.LEETCODE_USER);
    await page.fill("#id_password", process.env.LEETCODE_PW);
    await page.click("#signin_btn");
    await page.waitForSelector("#contribute-promo");

    await page.goto(`https://leetcode.com/explore/featured/card/${currentMonth}-leetcoding-challenge-${currentYear}`);
    await page.waitForSelector(".chapter-list-base");
    if(0 <= currentDay && currentDay <= 6) {
        await page.click("div.list-group-item:nth-child(2) > div:nth-child(2)");
    }
    else if(7 <= currentDay && currentDay <= 13) {
        await page.click("div.list-group-item:nth-child(3) > div:nth-child(2)");
    }
    else if(14 <= currentDay && currentDay <= 20) {
        await page.click("div.list-group-item:nth-child(4) > div:nth-child(2)");
    }
    else if(21 <= currentDay && currentDay <= 27) {
        await page.click("div.list-group-item:nth-child(5) > div:nth-child(2)");
    }
    else {
        await page.click("div.list-group-item:nth-child(6) > div:nth-child(2)");
    }
    await page.waitForSelector(".item-detail");
    const challenges = await page.$$(".item-detail");
    await page.click(`//html/body/div[3]/div/div/div/div[2]/div/div/div[2]/div/div[3]/div/div[${challenges.length}]`);
    await page.waitForSelector(".question-title");
    result.questionTitle = (await page.innerText(".question-title")).trim();
    result.questionText = (await page.innerText(".question-area"));
    result.questionUrl = await page.url();
    console.log(result);
    await browser.close()
    return result;
}

module.exports.getDailyChallenge = getDailyChallenge;
