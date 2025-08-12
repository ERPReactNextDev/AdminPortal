// pages/api/Data/Applications/Cloudflare/Analytics/Fetch.ts
import type { NextApiRequest, NextApiResponse } from "next";

interface ApiResponse {
  success: boolean;
  data?: {
    zoneId: string;
    data: {
      dimensions: { datetime: string }[];
      sum: {
        requests: number;
        cachedRequests: number;
        bandwidth: number;
        threats: number;
      };
    } | null;
  }[];
  errors?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneIds = [
    process.env.CLOUDFLARE_ZONE_ID_ECOSHIFT,
    process.env.CLOUDFLARE_ZONE_ID_DISRUPTIVE,
    process.env.CLOUDFLARE_ZONE_ID_BUILDCHEM,
    process.env.CLOUDFLARE_ZONE_ID_ESHOME,
  ].filter(Boolean) as string[];

  if (!token) {
    return res.status(500).json({ success: false, errors: "Missing CLOUDFLARE_API_TOKEN" });
  }
  if (zoneIds.length === 0) {
    return res.status(500).json({ success: false, errors: "No Zone IDs configured" });
  }

  try {
    const results = await Promise.all(
      zoneIds.map(async (zoneId) => {
        const query = `
          query {
            viewer {
              zones(filter: { zoneTag: "${zoneId}" }) {
                zoneTag
                httpRequests1dGroups(limit: 1, orderBy: [datetime_DESC]) {
                  dimensions {
                    datetime
                  }
                  sum {
                    requests
                    threats
                    bandwidth
                    cachedRequests
                  }
                }
              }
            }
          }
        `;

        const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Zone ${zoneId} API error: ${errorText}`);
        }

        const json = await response.json();

        if (json.errors) {
          // Check for permission-related errors specifically
          const permissionError = json.errors.find((e: any) =>
            e.message.toLowerCase().includes("permission") || 
            e.message.toLowerCase().includes("unauthorized")
          );
          if (permissionError) {
            throw new Error(`Zone ${zoneId} Permission error: ${permissionError.message}`);
          } else {
            throw new Error(`Zone ${zoneId} GraphQL error: ${JSON.stringify(json.errors)}`);
          }
        }

        const zoneData = json.data.viewer.zones[0];
        const data = zoneData?.httpRequests1dGroups[0] || null;

        return {
          zoneId: zoneData?.zoneTag || zoneId,
          data,
        };
      })
    );

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    return res.status(500).json({ success: false, errors: error.message || "Unknown error" });
  }
}
