import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

export default async function handler(req, res) {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;

    // LIVE USERS
    const [realtime] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }],
    });

    // TODAY USERS
    const [today] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    });

    // TOTAL USERS
    const [total] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
      metrics: [{ name: "totalUsers" }],
    });

    res.status(200).json({
      live: realtime.rows?.[0]?.metricValues?.[0]?.value || 0,
      today: today.rows?.[0]?.metricValues?.[0]?.value || 0,
      total: total.rows?.[0]?.metricValues?.[0]?.value || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
