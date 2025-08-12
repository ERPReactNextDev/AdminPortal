import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneIds = [
      process.env.CLOUDFLARE_ZONE_ID_ECOSHIFT,
      process.env.CLOUDFLARE_ZONE_ID_DISRUPTIVE,
      process.env.CLOUDFLARE_ZONE_ID_BUILDCHEM,
      process.env.CLOUDFLARE_ZONE_ID_ESHOME
    ];

    if (!token || zoneIds.some((z) => !z)) {
      return res.status(500).json({ success: false, error: "Missing Cloudflare credentials" });
    }

    const results = await Promise.all(
      zoneIds.map(async (zoneId) => {
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!cfRes.ok) {
          const errorText = await cfRes.text();
          throw new Error(`Cloudflare API error (Zone ${zoneId}): ${errorText}`);
        }

        const data = await cfRes.json();

        if (!data.success) {
          throw new Error(`Cloudflare API failed for Zone ${zoneId}: ${JSON.stringify(data.errors)}`);
        }

        return data.result.map((record: any) => ({
          id: `${zoneId}-${record.id}`, // unique key per zone + record
          type: record.type,
          name: record.name,
          content: record.content,
          ttl: record.ttl,
          status: record.proxied ? "Proxied" : "DNS Only",
          zoneName: record.zone_name,
          lastModified: record.modified_on,
        }));
      })
    );

    const mergedData = results.flat();

    res.status(200).json({ success: true, data: mergedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
