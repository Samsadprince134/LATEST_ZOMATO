// // const express = require("express");
// // const router = express.Router();
// // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // console.log("hello route")
// // // GET /api/data/location?city=kolkata&area=park-street&limit=5
// // router.get("/location", async (req, res) => {
// //   const { city, area, limit } = req.query;
// //   console.log("city", "limit", city, limit)

// //   if (!city) return res.status(400).json({ error: "city parameter is required" });

// //   try {
// //     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
// //     console.log("max", max)
// //     const data = await scrapeByLocation(city, area || "", max);
// //     res.json({ message: `${data.length} results for ${city}`, data });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Scraping failed", details: err.message });
// //   }
// // });




// // module.exports = router;
// const express = require("express");
// const router = express.Router();
// const { scrapeByLocation } = require("../scraper/zomatoScraper");
// const puppeteer = require("puppeteer-extra");
// const Stealth = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(Stealth());

// // Sleep helper to replace page.waitForTimeout
// const sleep = ms => new Promise(r => setTimeout(r, ms));

// router.get("/location", async (req, res) => {
//   const { city, area, limit } = req.query;
//   if (!city) return res.status(400).json({ error: "city parameter is required" });

//   try {
//     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
//     const links = await scrapeByLocation(city, area || "", max);

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//     const page = await browser.newPage();

//     const details = [];

//     for (const link of links) {
//       await page.goto(link, { waitUntil: "networkidle2" });
//       await sleep(1000);

//       if (details.length === 0) {
//     const html = await page.content();
//     console.log("===== DEBUG HTML START =====");
//     console.log(html);
//     console.log("===== DEBUG HTML END =====");
//   }

//       // 1. Name
//       const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

//       // 2. Address: Extract the line immediately after <h1>
//       // const address = await page.evaluate(() => {
//       //   const h1 = document.querySelector("h1");
//       //   if (!h1 || !h1.nextSibling) return "N/A";
//       //   const text = h1.nextSibling.textContent.trim();
//       //   return text || "N/A";
//       // });

//        const address = await page.$eval(
//         ".sc-clNaTc.ckqoPM",
//         el => el.innerText.trim()
//       ).catch(() => "N/A");

     

//           const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");
//       details.push({ link, name, address, phone });
//     }

//     await browser.close();
//     res.json({
//       message: `Fetched details for ${details.length} restaurants in ${city}`,
//       details,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch restaurant details", message: err.message });
//   }
// });

// module.exports = router;





























const express = require("express");
const router = express.Router();
const { scrapeByLocation } = require("../scraper/zomatoScraper");
const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");

puppeteer.use(Stealth());

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

router.get("/location", async (req, res) => {
  const { city, area, limit } = req.query;
  if (!city) return res.status(400).json({ error: "city parameter is required" });

  try {
    const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
    const links = await scrapeByLocation(city, area || "", max);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const details = [];

    for (const link of links) {
      await page.goto(link, { waitUntil: "networkidle2" });
      await sleep(1000);


         if (details.length === 0) {
    const html = await page.content();
    console.log("===== DEBUG HTML START =====");
    console.log(html);
    console.log("===== DEBUG HTML END =====");
  }

      // 1. Restaurant Name
      const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

      // 2. Address Fetch Logic
      let address = await page.evaluate(() => {
        // Direct selectors Zomato sometimes uses
        let el = document.querySelector("[data-testid='restaurant-address']");
        if (el) return el.innerText.trim();

        el = document.querySelector("address");
        if (el) return el.innerText.trim();

        el = document.querySelector(".sc-bLQqVy");
        if (el) return el.innerText.trim();

        return null; // Continue to Cheerio parsing
      });

      // If direct selectors failed, parse HTML with Cheerio
      if (!address) {
        const html = await page.content();
        const $ = cheerio.load(html);

        address =
          $("address").text().trim() ||
          $("[data-testid='restaurant-address']").text().trim() ||
          $(".sc-bLQqVy").first().text().trim();

        // Fallback: search for short text containing "Floor" or "Area"
        if (!address) {
          $("*").each((_, el) => {
            const text = $(el).text().trim();
            if (
              /address/i.test(text) ||
              /floor/i.test(text) ||
              /area/i.test(text)
            ) {
              if (text.length > 10 && text.length < 200) {
                address = text;
                return false; // stop loop
              }
            }
          });
        }
      }

      if (!address) address = "N/A";

      // 3. Phone Number
      const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");

      details.push({ link, name, address, phone });
    }

    await browser.close();

    res.json({
      message: `Fetched details for ${details.length} restaurants in ${city}`,
      details,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch restaurant details", message: err.message });
  }
});

module.exports = router;

