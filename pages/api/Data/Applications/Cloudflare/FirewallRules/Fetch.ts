// pages/api/Data/Applications/Cloudflare/FirewallRules/Fetch.ts
import type { NextApiRequest, NextApiResponse } from "next";

interface FirewallRule {
  id: string;
  description: string;
  action: string;
  filter: {
    id: string;
    expression: string;
  };
  paused: boolean;
  created_on: string;
  modified_on: string;
  zone_id?: string; // add zone id for reference
}

interface ApiResponse {
  success: boolean;
  data?: FirewallRule[];
  errors?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const token = process.env.CLOUDFLARE_API_TOKEN;

  const zoneIds = [
    process.env.CLOUDFLARE_ZONE_ID_ECOSHIFT,
    process.env.CLOUDFLARE_ZONE_ID_DISRUPTIVE,
    process.env.CLOUDFLARE_ZONE_ID_BUILDCHEM,
    process.env.CLOUDFLARE_ZONE_ID_ESHOME,
  ].filter(Boolean) as string[]; // remove undefined if any

  if (!token) {
    return res.status(500).json({ success: false, errors: "Missing CLOUDFLARE_API_TOKEN" });
  }

  if (zoneIds.length === 0) {
    return res.status(500).json({ success: false, errors: "No Cloudflare Zone IDs configured" });
  }

  try {
    // Fetch firewall rules from all zones concurrently
    const fetches = zoneIds.map(async (zoneId) => {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/firewall/rules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zone ${zoneId}: ${errorText}`);
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error(`Zone ${zoneId}: ${JSON.stringify(json.errors)}`);
      }

      // Add zoneId to each rule for reference
      return json.result.map((rule: FirewallRule) => ({
        ...rule,
        zone_id: zoneId,
      }));
    });

    // Wait for all fetches
    const results = await Promise.all(fetches);

    // Flatten array of arrays to single array
    const allRules = results.flat();

    return res.status(200).json({ success: true, data: allRules });
  } catch (error: any) {
    return res.status(500).json({ success: false, errors: error.message || "Unknown error" });
  }
}
