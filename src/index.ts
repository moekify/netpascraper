import puppeteer from "puppeteer";

const url =
  "https://netpa.novasbe.pt/netpa/page?stage=difhomestage";

async function scrapeCalendar() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto(url);
  await page.click('.toplogout')

  await page.waitForSelector('[name="loginfmt"]')
  await page.type('[name="loginfmt"]', process.env.MSLIVE_USER)
  await page.click('[type="submit"]')


  await page.screenshot({path: './screenshots/test.png'})
  await browser.close();
}

scrapeCalendar();
