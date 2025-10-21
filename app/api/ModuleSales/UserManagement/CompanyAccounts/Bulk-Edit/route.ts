import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.TASKFLOW_DB_URL;
if (!databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(databaseUrl);

async function bulkUpdate(userIds: string[], targetquota: string) {
  try {
    if (!userIds?.length || !targetquota) {
      throw new Error("User IDs and TSM are required.");
    }

    const updatedRows = await sql`
      UPDATE activity
      SET targetquota = ${targetquota}
      WHERE id = ANY(${userIds})
      RETURNING *;
    `;

    return { success: true, data: updatedRows };
  } catch (error: any) {
    console.error("Error updating users:", error);
    return { success: false, error: error.message || "Failed to update users." };
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userIds, targetquota } = body;

    if (!userIds || !targetquota) {
      return NextResponse.json(
        { success: false, error: "Missing userIds or tsm." },
        { status: 400 }
      );
    }

    const result = await bulkUpdate(userIds, targetquota);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in PUT /api/ModuleSales/UserManagement/CompanyAccounts/Bulk-Edit:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
