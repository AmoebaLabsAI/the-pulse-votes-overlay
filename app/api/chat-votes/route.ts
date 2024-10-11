/* eslint-disable @typescript-eslint/no-explicit-any */

//a comment
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const { platform, vote } = await request.json();
  try {
    await sql`INSERT INTO votes (platform, vote) VALUES (${platform}, ${vote})`;
    return NextResponse.json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Error inserting vote:", error);
    return NextResponse.json(
      { error: "Failed to record vote" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM votes`;
    return NextResponse.json({ votes: rows });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await sql`DELETE FROM votes`;
    return NextResponse.json({ message: "Votes cleared successfully" });
  } catch (error) {
    console.error("Error clearing votes:", error);
    return NextResponse.json(
      { error: "Failed to clear votes" },
      { status: 500 }
    );
  }
}
