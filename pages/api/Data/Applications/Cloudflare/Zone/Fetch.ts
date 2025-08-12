// pages/api/cloudflare/zones.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!token) {
      return res.status(500).json({ success: false, error: "Missing Cloudflare API token" });
    }

    const cfRes = await fetch("https://api.cloudflare.com/client/v4/zones", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!cfRes.ok) {
      const errorText = await cfRes.text();
      return res.status(cfRes.status).json({ success: false, error: errorText });
    }

    const data = await cfRes.json();

    if (!data.success) {
      return res.status(500).json({ success: false, error: JSON.stringify(data.errors) });
    }

    // Return zones array as `data` for frontend consistency
    res.status(200).json({ success: true, data: data.result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
