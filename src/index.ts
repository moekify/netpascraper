import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import html from "./test.js";
import * as ics from "ics";
import { writeFileSync } from "fs";

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

const url = "https://netpa.novasbe.pt/netpa/page?stage=difhomestage";

const email: string = process.env.UNIEMAIL;
const password: string = process.env.UNIPASSWORD;
const events = [];
let content;

async function scrapeCalendar() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation({
    waitUntil: ["networkidle2"],
  });

  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto(url);
  await page.click(".toplogout");

  await page.waitForSelector('[name="loginfmt"]');
  await page.type('[name="loginfmt"]', email);
  await page.click('[type="submit"]');

  await navigationPromise;
  // we need to use waitForResponse because we are dealing with AJAX - no page navigation
  await page.waitForResponse((response) => response.status() === 200);
  await page.waitForSelector('input[type="password"]', { visible: true });
  await page.type('input[type="password"]', password);
  await page.click('input[type="submit"]');
  await page.keyboard.press("Enter");

  await navigationPromise;

  await page.waitForSelector('[type="submit"]', { visible: true });
  await page.click('[type="submit"]');

  await navigationPromise;

  //Completed Login

  await page.waitForSelector(".perfilAreaBoxPhoto");
  await page.click('a[title="Schedules"][tabindex="8"]');
  await page.waitForSelector("#info");

  content = await page.content();

  await page.screenshot({ path: "./screenshots/test.png" });
  await browser.close();
}
(async () => {
  //  await scrapeCalendar();

  const $ = cheerio.load(html, {
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true,
  });
  const days = [];
  $("thead .days")
    .children('[scope="col"]')
    .each((i, el) => {
      let date = $(el).text().slice(4);
      let dateYear;
      if (date.includes("-11") || date.includes("-12")) {
        dateYear = "-2021";
      } else {
        dateYear = "-2022";
      }

      days.push(date + dateYear);
    });
  $('div[name="detailDiv"]').each((i, el) => {
    let indexDay = $(el).parent().parent().index() - 1;
    let [day, month, year] = days[indexDay].split("-");
    let [hours, minutes] = $(el)
      .parent()
      .parent()
      .siblings(".time")
      .text()
      .split("h");
    let durationMinutes =
      parseInt($(el).parent().parent().attr("rowspan")) * 30;
    let [title, location] = $(el)
      .html()
      .replace(/\n/g, "")
      .replace("</br>", "")
      .split("<br>");
    title = encode_utf8(title);
    location = encode_utf8(location);

    let event = {
      title: title,
      location: location,
      startInputType: "utc",
      endInputType: "utc",
      start: [
        parseInt(year),
        parseInt(month),
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
      ],
      duration: { minutes: durationMinutes },
    };
    events.push(event);
  });

  const { error, value } = ics.createEvents(events);

  if (error) {
    console.log(error);
    return;
  }

  writeFileSync("./output/schedule.ics", value);
})();
