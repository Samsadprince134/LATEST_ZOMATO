// // // // const express = require("express");
// // // // const router = express.Router();
// // // // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // // // console.log("hello route")
// // // // // GET /api/data/location?city=kolkata&area=park-street&limit=5
// // // // router.get("/location", async (req, res) => {
// // // //   const { city, area, limit } = req.query;
// // // //   console.log("city", "limit", city, limit)

// // // //   if (!city) return res.status(400).json({ error: "city parameter is required" });

// // // //   try {
// // // //     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
// // // //     console.log("max", max)
// // // //     const data = await scrapeByLocation(city, area || "", max);
// // // //     res.json({ message: `${data.length} results for ${city}`, data });
// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({ error: "Scraping failed", details: err.message });
// // // //   }
// // // // });




// // // // module.exports = router;
// // // const express = require("express");
// // // const router = express.Router();
// // // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // // const puppeteer = require("puppeteer-extra");
// // // const Stealth = require("puppeteer-extra-plugin-stealth");
// // // puppeteer.use(Stealth());

// // // // Sleep helper to replace page.waitForTimeout
// // // const sleep = ms => new Promise(r => setTimeout(r, ms));

// // // router.get("/location", async (req, res) => {
// // //   const { city, area, limit } = req.query;
// // //   if (!city) return res.status(400).json({ error: "city parameter is required" });

// // //   try {
// // //     const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
// // //     const links = await scrapeByLocation(city, area || "", max);

// // //     const browser = await puppeteer.launch({
// // //       headless: true,
// // //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
// // //     });
// // //     const page = await browser.newPage();

// // //     const details = [];

// // //     for (const link of links) {
// // //       await page.goto(link, { waitUntil: "networkidle2" });
// // //       await sleep(1000);

// // //       if (details.length === 0) {
// // //     const html = await page.content();
// // //     console.log("===== DEBUG HTML START =====");
// // //     console.log(html);
// // //     console.log("===== DEBUG HTML END =====");
// // //   }

// // //       // 1. Name
// // //       const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

// // //       // 2. Address: Extract the line immediately after <h1>
// // //       // const address = await page.evaluate(() => {
// // //       //   const h1 = document.querySelector("h1");
// // //       //   if (!h1 || !h1.nextSibling) return "N/A";
// // //       //   const text = h1.nextSibling.textContent.trim();
// // //       //   return text || "N/A";
// // //       // });

// // //        const address = await page.$eval(
// // //         ".sc-clNaTc.ckqoPM",
// // //         el => el.innerText.trim()
// // //       ).catch(() => "N/A");

     

// // //           const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");
// // //       details.push({ link, name, address, phone });
// // //     }

// // //     await browser.close();
// // //     res.json({
// // //       message: `Fetched details for ${details.length} restaurants in ${city}`,
// // //       details,
// // //     });
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Failed to fetch restaurant details", message: err.message });
// // //   }
// // // });

// // // module.exports = router;





























// // const express = require("express");
// // const router = express.Router();
// // const { scrapeByLocation } = require("../scraper/zomatoScraper");
// // const puppeteer = require("puppeteer-extra");
// // const Stealth = require("puppeteer-extra-plugin-stealth");
// // const cheerio = require("cheerio");

// // puppeteer.use(Stealth());

// // // Sleep helper
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


// //          if (details.length === 0) {
// //     const html = await page.content();
// //     console.log("===== DEBUG HTML START =====");
// //     console.log(html);
// //     console.log("===== DEBUG HTML END =====");
// //   }

// //       // 1. Restaurant Name
// //       const name = await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A");

// //       // 2. Address Fetch Logic
// //       let address = await page.evaluate(() => {
// //         // Direct selectors Zomato sometimes uses
// //         let el = document.querySelector("[data-testid='restaurant-address']");
// //         if (el) return el.innerText.trim();

// //         el = document.querySelector("address");
// //         if (el) return el.innerText.trim();

// //         el = document.querySelector(".sc-bLQqVy");
// //         if (el) return el.innerText.trim();

// //         return null; // Continue to Cheerio parsing
// //       });

// //       // If direct selectors failed, parse HTML with Cheerio
// //       if (!address) {
// //         const html = await page.content();
// //         const $ = cheerio.load(html);

// //         address =
// //           $("address").text().trim() ||
// //           $("[data-testid='restaurant-address']").text().trim() ||
// //           $(".sc-bLQqVy").first().text().trim();

// //         // Fallback: search for short text containing "Floor" or "Area"
// //         if (!address) {
// //           $("*").each((_, el) => {
// //             const text = $(el).text().trim();
// //             if (
// //               /address/i.test(text) ||
// //               /floor/i.test(text) ||
// //               /area/i.test(text)
// //             ) {
// //               if (text.length > 10 && text.length < 200) {
// //                 address = text;
// //                 return false; // stop loop
// //               }
// //             }
// //           });
// //         }
// //       }

// //       if (!address) address = "N/A";

// //       // 3. Phone Number
// //       const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");

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
//     // Use a desktop UA to get the desktop layout consistently
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114 Safari/537.36"
//     );

//     const details = [];

//     for (const link of links) {
//       await page.goto(link, { waitUntil: "networkidle0" });
//       // wait for the header to be present; this is where the name + address area renders
//       await page.waitForSelector("h1", { timeout: 8000 }).catch(() => {});

//       // Small delay so React can finish rendering header area
//       await sleep(600);

//       // Robust DOM-based address extraction:
//       let address = await page.evaluate(() => {
//         const SCOREOUT = text => /report an error|reviews are better|view menus in app|continue in app|continue in browser|booking|book a table|order online|reviews|menu/i.test(text);

//         // Address-like heuristic: comma + any of these keywords OR contains digit + street-like words
//         const isAddressLike = text => {
//           if (!text) return false;
//           const t = text.trim();
//           if (t.length < 8 || t.length > 300) return false;
//           if (!/,/.test(t) && !/\d/.test(t)) {
//             // also accept if it contains strong keywords without comma
//             return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t);
//           }
//           return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t) || /\d+/.test(t);
//         };

//         const h1 = document.querySelector("h1");
//         if (h1) {
//           // Walk siblings right after h1 to find the address block
//           let node = h1.nextElementSibling;
//           let attempt = 0;
//           while (node && attempt < 10) { // limit how many siblings we scan
//             const txt = (node.innerText || "").trim();
//             const lower = txt.toLowerCase();

//             // Skip obviously non-address blocks (ratings, buttons, price, call, share etc.)
//             if (!txt || SCOREOUT(txt)) {
//               node = node.nextElementSibling;
//               attempt++;
//               continue;
//             }
//             if (/^\₹|^₹|^call\b|^share\b|^direction\b|^view gallery\b|^reviews\b/i.test(txt)) {
//               node = node.nextElementSibling;
//               attempt++;
//               continue;
//             }

//             // If this sibling looks address-like, return it
//             if (isAddressLike(txt)) {
//               // remove inner child hints like "copy" or "direction" if present
//               // join lines but remove short tokens like "copy"
//               const cleaned = txt.split("\n")
//                 .map(s => s.trim())
//                 .filter(s => s && !/^(copy|direction|call|share)$/i.test(s))
//                 .join(", ");
//               return cleaned;
//             }

//             // As another heuristic: sometimes the address is inside a child element inside this sibling
//             // Look for child elements that individually look address-like
//             const children = Array.from(node.querySelectorAll("p, span, div, a"));
//             for (const c of children) {
//               const ctxt = (c.innerText || "").trim();
//               if (ctxt && isAddressLike(ctxt) && !SCOREOUT(ctxt)) {
//                 return ctxt;
//               }
//             }

//             node = node.nextElementSibling;
//             attempt++;
//           }
//         }

//         // If we didn't find via h1 siblings, try finding a top-level "Direction" or "info-line" grouping
//         const possibleLabels = Array.from(document.querySelectorAll("div, p, span"));
//         for (let i = 0; i < Math.min(possibleLabels.length, 200); i++) {
//           const el = possibleLabels[i];
//           const t = (el.innerText || "").trim();
//           if (!t) continue;
//           if (t.length > 10 && t.length < 300 && /direction|copy|open|closed|for two|₹|call/i.test(t) === false) {
//             if (isAddressLike(t) && !/report an error|continue in app|view menus in app/i.test(t)) {
//               return t;
//             }
//           }
//         }

//         return null;
//       });

//       // If DOM evaluation failed, fallback to Cheerio but with strict filtering:
//       if (!address) {
//         const html = await page.content();
//         const $ = cheerio.load(html);

//         // Search near top of body for address-like text and exclude known junk
//         let found = null;

//         // limit search to first 80 elements to prefer header area over modals/footer
//         const elems = $("body *").slice(0, 80);
//         elems.each((i, el) => {
//           if (found) return;
//           const text = $(el).text().trim();
//           if (!text || text.length < 8 || text.length > 300) return;
//           const lower = text.toLowerCase();
//           if (/report an error|continue in app|view menus in app|reviews are better|send otp|sign in|log in/.test(lower)) return;
//           // heuristics: comma + street/area/floor/road OR digits + street-like keywords
//           if (/,/.test(text) && /street|road|floor|lane|area|chowringhee|park street|drive|avenue|kolkata|delhi|mumbai/i.test(text)) {
//             found = text.replace(/\s+/g, " ").trim();
//             return;
//           }
//           if (/\d/.test(text) && /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata/i.test(text)) {
//             found = text.replace(/\s+/g, " ").trim();
//             return;
//           }
//         });

//         address = found || null;
//       }

//       if (!address) address = "N/A";

//       // Phone number
//       const phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => "N/A");

//       details.push({ link, name: await page.$eval("h1", el => el.innerText.trim()).catch(() => "N/A"), address, phone });
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
const axios = require("axios");

puppeteer.use(Stealth());

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-IN,en;q=0.9",
};

// JSON-LD parser (your getInfo adapted to return { Name, Address, Phone } or null)
async function getInfo(url) {
  try {
    const resp = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: s => s >= 200 && s < 400,
    });

    const $ = cheerio.load(resp.data);
    const scripts = $("script[type='application/ld+json']");

    if (!scripts.length) {
      return null;
    }

    let restaurant = null;

    scripts.each((_, el) => {
      if (restaurant) return;
      let text = $(el).contents().text().trim();
      if (!text) return;

      try {
        const parsed = JSON.parse(text);
        const candidates = Array.isArray(parsed) ? parsed : [parsed];

        for (const obj of candidates) {
          if (!obj) continue;
          const t = obj["@type"];
          const types = Array.isArray(t) ? t : t ? [t] : [];
          if (types.includes("Restaurant")) {
            restaurant = obj;
            break;
          }
        }
      } catch (_) {}
    });

    if (!restaurant) {
      // fallback: look inside @graph arrays
      scripts.each((_, el) => {
        if (restaurant) return;
        try {
          const parsed = JSON.parse($(el).contents().text().trim());
          const graph = parsed && parsed["@graph"];
          if (Array.isArray(graph)) {
            for (const obj of graph) {
              const t = obj && obj["@type"];
              const types = Array.isArray(t) ? t : t ? [t] : [];
              if (types.includes("Restaurant")) {
                restaurant = obj;
                break;
              }
            }
          }
        } catch (_) {}
      });
    }

    if (!restaurant) return null;

    const name = (restaurant.name || "").toString().trim() || null;

    // Address handling
    let address = null;
    const addr = restaurant.address || {};
    if (typeof addr === "string") {
      address = addr.trim();
    } else if (addr && typeof addr === "object") {
      address =
        (addr.streetAddress || "").toString().trim() ||
        [addr.houseNumber, addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode]
          .filter(Boolean)
          .map(x => x.toString().trim())
          .join(", ") ||
        null;
    }

    let phone = (restaurant.telephone || "").toString().trim();
    if (!phone) {
      // fallback: try tel: link in DOM
      const tel = $("a[href^='tel:']").first().text().trim();
      if (tel) phone = tel;
    }
    if (!phone) phone = null;

    return { Name: name || null, Address: address || null, Phone: phone || null };
  } catch (e) {
    console.error(`[getInfo ERROR] ${url} — ${e.message}`);
    return null;
  }
}

// Heuristic DOM address extraction (runs inside page.evaluate)
function domAddressExtractionScript() {
  return (() => {
    const SCOREOUT = text => /report an error|reviews are better|view menus in app|continue in app|continue in browser|booking|book a table|order online|reviews|menu|send otp|sign in|log in/i.test(text);

    const isAddressLike = text => {
      if (!text) return false;
      const t = text.trim();
      if (t.length < 8 || t.length > 300) return false;
      if (!/,/.test(t) && !/\d/.test(t)) {
        return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t);
      }
      return /street|road|floor|lane|area|chowringhee|park street|drive|avenue|colony|kolkata|delhi|mumbai/i.test(t) || /\d+/.test(t);
    };

    const extractFromNode = node => {
      if (!node) return null;
      const txt = (node.innerText || "").trim();
      if (!txt || SCOREOUT(txt)) return null;

      // prefer child-level p/span that look address-like
      const children = Array.from(node.querySelectorAll("p, span, div, a"));
      for (const c of children) {
        const ctxt = (c.innerText || "").trim();
        if (ctxt && isAddressLike(ctxt) && !SCOREOUT(ctxt)) {
          return ctxt;
        }
      }

      if (isAddressLike(txt)) {
        const cleaned = txt.split("\n")
          .map(s => s.trim())
          .filter(s => s && !/^(copy|direction|call|share)$/i.test(s))
          .join(", ");
        return cleaned;
      }
      return null;
    };

    const h1 = document.querySelector("h1");
    if (h1) {
      let node = h1.nextElementSibling;
      let attempt = 0;
      while (node && attempt < 12) {
        const maybe = extractFromNode(node);
        if (maybe) return maybe;
        node = node.nextElementSibling;
        attempt++;
      }
    }

    // broader fallback: scan first N elements in DOM looking for address-like text
    const candidates = Array.from(document.querySelectorAll("p, div, span, a")).slice(0, 200);
    for (const el of candidates) {
      const t = (el.innerText || "").trim();
      if (!t) continue;
      if (t.length < 8 || t.length > 300) continue;
      if (SCOREOUT(t)) continue;
      if (isAddressLike(t)) return t;
    }

    return null;
  })();
}

router.get("/location", async (req, res) => {
  const { city, area, limit } = req.query;
  if (!city) return res.status(400).json({ error: "city parameter is required" });

  try {
    const max = parseInt(limit) || parseInt(process.env.AREA_LIMIT) || 5;
    const links = await scrapeByLocation(city, area || "", max);

    // Launch Puppeteer once (we may not use it for every link, but it's available)
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(DEFAULT_HEADERS["User-Agent"]);

    const details = [];

    for (const link of links) {
      // 1) First try JSON-LD via axios+cheerio (fast, no browser)
      const info = await getInfo(link);

      let name = info && info.Name ? info.Name : null;
      let address = info && info.Address ? info.Address : null;
      let phone = info && info.Phone ? info.Phone : null;

      // If any important piece is missing, navigate with Puppeteer and fill gaps
      if (!name || !address || !phone) {
        try {
          await page.goto(link, { waitUntil: "networkidle0", timeout: 30000 });
        } catch (e) {
          // navigation failed: continue and use whatever we have
          console.warn(`[WARN] navigation failed for ${link}: ${e.message}`);
        }

        // Ensure header area has time to render
        await page.waitForSelector("h1", { timeout: 8000 }).catch(() => {});
        await sleep(500); // small extra wait

        // if name missing, grab from h1
        if (!name) {
          name = await page.$eval("h1", el => el.innerText.trim()).catch(() => null);
        }

        // if address missing, use DOM heuristics
        if (!address) {
          address = await page.evaluate(domAddressExtractionScript).catch(() => null);
          if (address) {
            address = address.replace(/\s+/g, " ").trim();
          }
        }

        // if phone missing, try tel: links on page
        if (!phone) {
          phone = await page.$eval("a[href^='tel:']", el => el.innerText.trim()).catch(() => null);
          if (phone) phone = phone.trim();
        }
      }

      // final normalization/fallbacks
      if (!name) name = "N/A";
      if (!address) address = "N/A";
      if (!phone) phone = "N/A";

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

