/* eslint-disable @typescript-eslint/no-explicit-any */

//a comment
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Add this function at the beginning of the file
async function createTableIfNotExists() {
  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(50) NOT NULL,
      vote CHAR(1) NOT NULL,
      author VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      UNIQUE(platform, author, timestamp)
    );
  `;
}

export async function POST(request: Request) {
  await createTableIfNotExists();
  const { platform, vote, author, timestamp } = await request.json();
  try {
    await sql`
      INSERT INTO votes (platform, vote, author, timestamp)
      VALUES (${platform}, ${vote}, ${author}, ${timestamp})
      ON CONFLICT (platform, author, timestamp) DO NOTHING;
    `;
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
  await createTableIfNotExists();
  try {
    const { rows } = await sql`SELECT * FROM votes ORDER BY timestamp DESC`;
    return NextResponse.json({ votes: rows });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
