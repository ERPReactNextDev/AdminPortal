import { NextApiRequest, NextApiResponse } from "next"
import { connectToDatabase } from "@/lib/MongoDB"
import { ObjectId } from "mongodb"

export default async function deleteAccounts(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing 'ids' array.",
      })
    }

    const db = await connectToDatabase()
    const UserCollection = db.collection("users")

    const objectIds = ids.map((id) => new ObjectId(id))
    const result = await UserCollection.deleteMany({ _id: { $in: objectIds } })

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found to delete.",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Users deleted successfully.",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting users:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to delete users.",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
