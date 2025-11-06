import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";
import { ObjectId } from "mongodb";

export default async function transferUsers(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { ids, type, targetId } = req.body;

    // 🔹 Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided." });
    }

    if (!type || !["TSM", "Manager"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid transfer type." });
    }

    if (!targetId) {
      return res.status(400).json({ success: false, message: "No target ID provided." });
    }

    const db = await connectToDatabase();
    const userCollection = db.collection("users");

    // 🔹 Convert string IDs to ObjectId
    const objectIds = ids.map((id: string) => new ObjectId(id));

    // 🔹 Update selected users
    const result = await userCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { [type]: targetId, updatedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${result.modifiedCount} user(s) to ${type}.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error transferring users:", error);
    return res.status(500).json({ success: false, message: "Failed to transfer users." });
  }
}
