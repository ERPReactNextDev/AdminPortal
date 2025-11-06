import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";
import { ObjectId } from "mongodb";

export default async function convertEmail(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    }

    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "No user IDs provided" });
        }

        const db = await connectToDatabase();
        const users = db.collection("users");

        const bulkOps = ids.map((id: string) => ({
            updateOne: {
                filter: { _id: new ObjectId(id) },
                update: [
                    {
                        $set: {
                            Email: {
                                $let: {
                                    vars: {
                                        local: { $arrayElemAt: [{ $split: ["$Email", "@"] }, 0] },
                                    },
                                    in: {
                                        $concat: [
                                            "$$local",
                                            "@disruptivesolutionsinc.com" // default domain
                                        ]
                                    }
                                }
                            },
                            Company: {
                                $cond: [
                                    { $regexMatch: { input: "$Email", regex: /@disruptivesolutionsinc\.com$/i } },
                                    "Disruptive Solutions Inc",
                                    {
                                        $cond: [
                                            { $regexMatch: { input: "$Email", regex: /@ecoshiftcorp\.com$/i } },
                                            "Ecoshift Corporation",
                                            "$Company" // keep existing if other domain
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        }));

        const result = await users.bulkWrite(bulkOps);

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} emails updated successfully`
        });

    } catch (error) {
        console.error("Error converting emails:", error);
        return res.status(500).json({ success: false, message: "Failed to convert emails" });
    }
}
