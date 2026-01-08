import fetch from "node-fetch";

export default async function handler(req, res) {
  // ============================
  // CORS: cho phép Shopify domain
  // ============================
  const allowedOrigin = "https://bietthu-anmaison.com.vn";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!shop || !token) {
      return res.status(500).json({ error: "Missing env" });
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
     * TOTAL VISITS
     * =============================== */
    let totalVisits = Number(totalMF?.value || 0) + 1;

    /** ===============================
     * DAILY VISITS
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
     * LIVE VIEW (RANDOM 10–20)
     * =============================== */
    const liveView = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

    /** ===============================
     * SAVE METAFIELDS
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
}
