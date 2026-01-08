import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * GET /api/visit
 * - total_visits (real)
 * - daily_visits (real)
 * - live_view (random 10–20)
 */
app.get("/api/visit", async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!shop || !token) {
      return res.status(500).json({ error: "Missing env config" });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    };

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    /** ===============================
     * 1️⃣ GET metafields
     * =============================== */
    const getRes = await fetch(
      `https://${shop}/admin/api/2024-10/metafields.json?owner_resource=shop&namespace=custom`,
      { headers }
    );

    const { metafields = [] } = await getRes.json();

    const totalMF = metafields.find(m => m.key === "tracking_total_visits");
    const dailyMF = metafields.find(m => m.key === "tracking_daily_visits");

    /** ===============================
     * 2️⃣ TOTAL VISITS
     * =============================== */
    let totalVisits = Number(totalMF?.value || 0) + 1;

    /** ===============================
     * 3️⃣ DAILY VISITS
     * =============================== */
    let dailyData = dailyMF
      ? JSON.parse(dailyMF.value)
      : { date: today, count: 0 };

    if (dailyData.date === today) {
      dailyData.count += 1;
    } else {
      dailyData = { date: today, count: 1 };
    }

    /** ===============================
     * 4️⃣ LIVE VIEW (RANDOM)
     * =============================== */
    const liveView = Math.floor(Math.random() * 11) + 10; // 10–20

    /** ===============================
     * 5️⃣ SAVE METAFIELDS
     * =============================== */
    const saveMetafield = async (body, id) => {
      const url = id
        ? `https://${shop}/admin/api/2024-10/metafields/${id}.json`
        : `https://${shop}/admin/api/2024-10/metafields.json`;

      await fetch(url, {
        method: id ? "PUT" : "POST",
        headers,
        body: JSON.stringify(body),
      });
    };

    await Promise.all([
      // TOTAL
      saveMetafield(
        {
          metafield: totalMF
            ? {
                id: totalMF.id,
                value: String(totalVisits),
                type: "number_integer",
              }
            : {
                namespace: "custom",
                key: "tracking_total_visits",
                type: "number_integer",
                value: String(totalVisits),
                owner_resource: "shop",
              },
        },
        totalMF?.id
      ),

      // DAILY
      saveMetafield(
        {
          metafield: dailyMF
            ? {
                id: dailyMF.id,
                value: JSON.stringify(dailyData),
                type: "json",
              }
            : {
                namespace: "custom",
                key: "tracking_daily_visits",
                type: "json",
                value: JSON.stringify(dailyData),
                owner_resource: "shop",
              },
        },
        dailyMF?.id
      ),
    ]);

    return res.json({
      success: true,
      total_visits: totalVisits,
      today_visits_daily: dailyData.count,
      live_view: liveView,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/api/liveview", async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_SHOP_ANMAISON;
    const token = process.env.SHOPIFY_ADMIN_TOKEN_ANMAISON;

    if (!shop || !token) {
      return res.status(500).json({ error: "Missing env config" });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    };

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    /** ===============================
     * 1️⃣ GET metafields
     * =============================== */
    const getRes = await fetch(
      `https://${shop}/admin/api/2024-10/metafields.json?owner_resource=shop&namespace=custom`,
      { headers }
    );

    const { metafields = [] } = await getRes.json();

    const totalMF = metafields.find(m => m.key === "tracking_total_visits");
    const dailyMF = metafields.find(m => m.key === "tracking_daily_visits");

    /** ===============================
     * 2️⃣ TOTAL VISITS
     * =============================== */
    let totalVisits = Number(totalMF?.value || 0) + 1;

    /** ===============================
     * 3️⃣ DAILY VISITS
     * =============================== */
    let dailyData = dailyMF
      ? JSON.parse(dailyMF.value)
      : { date: today, count: 0 };

    if (dailyData.date === today) {
      dailyData.count += 1;
    } else {
      dailyData = { date: today, count: 1 };
    }

    /** ===============================
     * 4️⃣ LIVE VIEW (RANDOM)
     * =============================== */
    const liveView = Math.floor(Math.random() * 11) + 10; // 10–20

    /** ===============================
     * 5️⃣ SAVE METAFIELDS
     * =============================== */
    const saveMetafield = async (body, id) => {
      const url = id
        ? `https://${shop}/admin/api/2024-10/metafields/${id}.json`
        : `https://${shop}/admin/api/2024-10/metafields.json`;

      await fetch(url, {
        method: id ? "PUT" : "POST",
        headers,
        body: JSON.stringify(body),
      });
    };

    await Promise.all([
      // TOTAL
      saveMetafield(
        {
          metafield: totalMF
            ? {
                id: totalMF.id,
                value: String(totalVisits),
                type: "number_integer",
              }
            : {
                namespace: "custom",
                key: "tracking_total_visits",
                type: "number_integer",
                value: String(totalVisits),
                owner_resource: "shop",
              },
        },
        totalMF?.id
      ),

      // DAILY
      saveMetafield(
        {
          metafield: dailyMF
            ? {
                id: dailyMF.id,
                value: JSON.stringify(dailyData),
                type: "json",
              }
            : {
                namespace: "custom",
                key: "tracking_daily_visits",
                type: "json",
                value: JSON.stringify(dailyData),
                owner_resource: "shop",
              },
        },
        dailyMF?.id
      ),
    ]);

    return res.json({
      success: true,
      total_visits: totalVisits,
      today_visits_daily: dailyData.count,
      live_view: liveView,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local server running: http://localhost:${PORT}`);
  console.log(`👉 Test: http://localhost:${PORT}/api/visit`);
});
