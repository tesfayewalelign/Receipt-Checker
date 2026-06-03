import express, { Request, Response } from "express";
import axios from "axios";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const TELEBIRR_BASE = "https://transactioninfo.ethiotelecom.et/receipt";

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Telebirr proxy is running" });
});

// ── Main proxy endpoint ───────────────────────────────────────────────────
// POST /verify
// Body: { "reference": "DBXXXXXXXX" }
// Response: { "html": "..." } or { "error": "..." }
app.post("/verify", async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ error: "reference field is required" });
  }

  // Clean the reference
  const clean = reference.toUpperCase().replace(/[^A-Z0-9]/g, "");
  console.log(`[proxy] Received request for reference: ${clean}`);

  // Try Axios first (fast)
  let html = await fetchViaAxios(clean);

  // If Axios fails, try Puppeteer (handles JS-heavy pages)
  if (!html) {
    console.log("[proxy] Axios failed, trying Puppeteer...");
    html = await fetchViaPuppeteer(clean);
  }

  if (!html) {
    console.error("[proxy] Both methods failed for:", clean);
    return res.status(502).json({
      error:
        "Could not fetch receipt from Ethiotelecom. Make sure this machine is on ET network.",
    });
  }

  console.log("[proxy] Successfully fetched receipt for:", clean);
  return res.json({ html });
});

// ── Fetch using Axios (fast, simple HTTP request) ─────────────────────────
async function fetchViaAxios(reference: string): Promise<string | null> {
  try {
    const response = await axios.get(`${TELEBIRR_BASE}/${reference}`, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.status === 200 && response.data) {
      const $ = cheerio.load(response.data);
      const bodyText = $("body").text();

      // Make sure we got real receipt data, not an error page
      if (
        bodyText.includes("Amount") ||
        bodyText.includes("amount") ||
        bodyText.includes("Birr")
      ) {
        console.log("[proxy] Axios fetch succeeded");
        return response.data;
      }

      console.warn(
        "[proxy] Axios got a response but it looks empty or invalid",
      );
      return null;
    }

    return null;
  } catch (err: any) {
    console.error("[proxy] Axios error:", err.message);
    return null;
  }
}

// ── Fetch using Puppeteer (browser automation, handles JS rendering) ───────
async function fetchViaPuppeteer(reference: string): Promise<string | null> {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    );

    await page.goto(`${TELEBIRR_BASE}/${reference}`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for a table to appear (receipt data is in a table)
    try {
      await page.waitForSelector("table", { timeout: 20000 });
    } catch {
      console.warn(
        "[proxy] Puppeteer: no table found on page, receipt may not exist",
      );
      return null;
    }

    const html = await page.content();
    console.log("[proxy] Puppeteer fetch succeeded");
    return html;
  } catch (err: any) {
    console.error("[proxy] Puppeteer error:", err.message);
    return null;
  } finally {
    // Always close browser to free memory
    if (browser) {
      await browser.close();
    }
  }
}

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Telebirr proxy server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Verify endpoint: POST http://localhost:${PORT}/verify`);
});
