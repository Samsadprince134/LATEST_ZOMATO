// // // const express = require("express");
// // // const router = express.Router();
// // // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // // console.log("hello route")
// // // // GET /api/data/location?city=kolkata&area=park-street&limit=5
// // // router.get("/location", async (req, res) => {
// // //   const { city, area, limit } = req.query;
// // //   console.log("city", "limit", city, limit)

// // //   if (!city) return res.status(400).json({ error: "city parameter is required" });

// // //   try {
// // //     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
// // //     console.log("max", max)
// // //     const data = await scrapeByLocation(city, area || "", max);
// // //     res.json({ message: `${data.length} results for ${city}`, data });
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Scraping failed", details: err.message });
// // //   }
// // // });




// // // module.exports = router;
// // const express = require("express");
// // const router = express.Router();
// // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // const puppeteer = require("puppeteer-extra");
// // const Stealth = require("puppeteer-extra-plugin-stealth");
// // puppeteer.use(Stealth());

// // // Sleep helper to replace page.waitForTimeout
// // const sleep = ms => new Promise(r => setTimeout(r, ms));

// // router.get("/location", async (req, res) => {
// //   const { city, area, limit } = req.query;
// //   if (!city) return res.status(400).json({ error: "city parameter is required" });

// //   try {
// //     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
// //     const links = await scrapeByLocation(city, area || "", max);

// //     const browser = await puppeteer.launch({
// //       headless: true,
// //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
// //     });
// //     const page = await browser.newPage();

// //     const details = [];

// //     for (const link of links) {
// //       await page.goto(link, { waitUntil: "networkidle2" });
// //       await sleep(1000);

// //       if (details.length === 0) {
// //     const html = await page.content();
// //     console.log("===== DEBUG HTML START =====");
// //     console.log(html);
// //     console.log("===== DEBUG HTML END =====");
// //   }

// //       // 1. Name
// //       const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

// //       // 2. Address: Extract the line immediately after <h1>
// //       // const address = await page.evaluate(() => {
// //       //   const h1 = document.querySelector("h1");
// //       //   if (!h1 || !h1.nextSibling) return "N/A";
// //       //   const text = h1.nextSibling.textContent.trim();
// //       //   return text || "N/A";
// //       // });

// //        const address = await page.$eval(
// //         ".sc-clNaTc.ckqoPM",
// //         el => el.innerText.trim()
// //       ).catch(() => "N/A");

     

// //           const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");
// //       details.push({ link, name, address, phone });
// //     }

// //     await browser.close();
// //     res.json({
// //       message: `Fetched details for ${details.length} restaurants in ${city}`,
// //       details,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Failed to fetch restaurant details", message: err.message });
// //   }
// // });

// // module.exports = router;





























// const express = require("express");
// const router = express.Router();
// const { scrapeByLocation } = require("../scraper/zomatoScraper");
// const puppeteer = require("puppeteer-extra");
// const Stealth = require("puppeteer-extra-plugin-stealth");
// const cheerio = require("cheerio");

// puppeteer.use(Stealth());

// // Sleep helper
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


//          if (details.length === 0) {
//     const html = await page.content();
//     console.log("===== DEBUG HTML START =====");
//     console.log(html);
//     console.log("===== DEBUG HTML END =====");
//   }

//       // 1. Restaurant Name
//       const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

//       // 2. Address Fetch Logic
//       let address = await page.evaluate(() => {
//         // Direct selectors Zomato sometimes uses
//         let el = document.querySelector("[data-testid='restaurant-address']");
//         if (el) return el.innerText.trim();

//         el = document.querySelector("address");
//         if (el) return el.innerText.trim();

//         el = document.querySelector(".sc-bLQqVy");
//         if (el) return el.innerText.trim();

//         return null; // Continue to Cheerio parsing
//       });

//       // If direct selectors failed, parse HTML with Cheerio
//       if (!address) {
//         const html = await page.content();
//         const $ = cheerio.load(html);

//         address =
//           $("address").text().trim() ||
//           $("[data-testid='restaurant-address']").text().trim() ||
//           $(".sc-bLQqVy").first().text().trim();

//         // Fallback: search for short text containing "Floor" or "Area"
//         if (!address) {
//           $("*").each((_, el) => {
//             const text = $(el).text().trim();
//             if (
//               /address/i.test(text) ||
//               /floor/i.test(text) ||
//               /area/i.test(text)
//             ) {
//               if (text.length > 10 && text.length < 200) {
//                 address = text;
//                 return false; // stop loop
//               }
//             }
//           });
//         }
//       }

//       if (!address) address = "N/A";

//       // 3. Phone Number
//       const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");

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
    // Use a desktop UA to get the desktop layout consistently
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114 Safari/537.36"
    );

    const details = [];

    for (const link of links) {
      await page.goto(link, { waitUntil: "networkidle0" });
      // wait for the header to be present; this is where the name + address area renders
      await page.waitForSelector("h1", { timeout: 8000 }).catch(() => {});

      // Small delay so React can finish rendering header area
      await sleep(600);

      // Robust DOM-based address extraction:
      let address = await page.evaluate(() => {
        const SCOREOUT = text => /report an error|reviews are better|view menus in app|continue in app|continue in browser|booking|book a table|order online|reviews|menu/i.test(text);

        // Address-like heuristic: comma + any of these keywords OR contains digit + street-like words
        const isAddressLike = text => {
          if (!text) return false;
          const t = text.trim();
          if (t.length < 8 || t.length > 300) return false;
          if (!/,/.test(t) && !/\d/.test(t)) {
            // also accept if it contains strong keywords without comma
            return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t);
          }
          return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t) || /\d+/.test(t);
        };

        const h1 = document.querySelector("h1");
        if (h1) {
          // Walk siblings right after h1 to find the address block
          let node = h1.nextElementSibling;
          let attempt = 0;
          while (node && attempt < 10) { // limit how many siblings we scan
            const txt = (node.innerText || "").trim();
            const lower = txt.toLowerCase();

            // Skip obviously non-address blocks (ratings, buttons, price, call, share etc.)
            if (!txt || SCOREOUT(txt)) {
              node = node.nextElementSibling;
              attempt++;
              continue;
            }
            if (/^\₹|^₹|^call\b|^share\b|^direction\b|^view gallery\b|^reviews\b/i.test(txt)) {
              node = node.nextElementSibling;
              attempt++;
              continue;
            }

            // If this sibling looks address-like, return it
            if (isAddressLike(txt)) {
              // remove inner child hints like "copy" or "direction" if present
              // join lines but remove short tokens like "copy"
              const cleaned = txt.split("\n")
                .map(s => s.trim())
                .filter(s => s && !/^(copy|direction|call|share)$/i.test(s))
                .join(", ");
              return cleaned;
            }

            // As another heuristic: sometimes the address is inside a child element inside this sibling
            // Look for child elements that individually look address-like
            const children = Array.from(node.querySelectorAll("p, span, div, a"));
            for (const c of children) {
              const ctxt = (c.innerText || "").trim();
              if (ctxt && isAddressLike(ctxt) && !SCOREOUT(ctxt)) {
                return ctxt;
              }
            }

            node = node.nextElementSibling;
            attempt++;
          }
        }

        // If we didn't find via h1 siblings, try finding a top-level "Direction" or "info-line" grouping
        const possibleLabels = Array.from(document.querySelectorAll("div, p, span"));
        for (let i = 0; i < Math.min(possibleLabels.length, 200); i++) {
          const el = possibleLabels[i];
          const t = (el.innerText || "").trim();
          if (!t) continue;
          if (t.length > 10 && t.length < 300 && /direction|copy|open|closed|for two|₹|call/i.test(t) === false) {
            if (isAddressLike(t) && !/report an error|continue in app|view menus in app/i.test(t)) {
              return t;
            }
          }
        }

        return null;
      });

      // If DOM evaluation failed, fallback to Cheerio but with strict filtering:
      if (!address) {
        const html = await page.content();
        const $ = cheerio.load(html);

        // Search near top of body for address-like text and exclude known junk
        let found = null;

        // limit search to first 80 elements to prefer header area over modals/footer
        const elems = $("body *").slice(0, 80);
        elems.each((i, el) => {
          if (found) return;
          const text = $(el).text().trim();
          if (!text || text.length < 8 || text.length > 300) return;
          const lower = text.toLowerCase();
          if (/report an error|continue in app|view menus in app|reviews are better|send otp|sign in|log in/.test(lower)) return;
          // heuristics: comma + street/area/floor/road OR digits + street-like keywords
          if (/,/.test(text) && /street|road|floor|lane|area|chowringhee|park street|drive|avenue|kolkata|delhi|mumbai/i.test(text)) {
            found = text.replace(/\s+/g, " ").trim();
            return;
          }
          if (/\d/.test(text) && /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata/i.test(text)) {
            found = text.replace(/\s+/g, " ").trim();
            return;
          }
        });

        address = found || null;
      }

      if (!address) address = "N/A";

      // Phone number
      const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");

      details.push({ link, name: await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A"), address, phone });
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
