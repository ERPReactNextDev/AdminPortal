import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const updates = body.updates;

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json(
                { success: false, error: "No updates provided." },
                { status: 400 }
            );
        }

        let updatedCount = 0;

        for (const update of updates) {
            const { id, targetquota } = update;
            if (!id || !targetquota) continue;

            // Update the activity table
            await Xchire_sql`
                UPDATE activity
                SET targetquota = ${targetquota}
                WHERE _id = ${id} OR referenceid = ${id} OR activitynumber = ${id};
            `;

            updatedCount++;
        }

        return NextResponse.json(
            {
                success: true,
                message: `${updatedCount} records updated successfully.`,
                count: updatedCount,
            },
            { status: 200 }
        );
    } catch (Xchire_error: any) {
        console.error("Error updating quotas:", Xchire_error);
        return NextResponse.json(
            {
                success: false,
                error: Xchire_error.message || "Failed to update activity quotas.",
            },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Always fetch/update fresh data
