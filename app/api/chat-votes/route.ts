/* eslint-disable @typescript-eslint/no-explicit-any */

//a comment
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Add this function at the beginning of the file
async function createTableIfNotExists() {
  await sql`
    CREATE TABLE IF NOT EXISTS youtube_chat_messages (
      id SERIAL PRIMARY KEY,
      channel VARCHAR(50) NOT NULL,
      message CHAR(1) NOT NULL,
      username VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      UNIQUE(channel, username, timestamp)
    );
  `;
}

export async function POST(request: Request) {
  await createTableIfNotExists();
  const { platform, vote, author, timestamp } = await request.json();
  try {
    await sql`
      INSERT INTO youtube_chat_messages (channel, message, username, timestamp)
      VALUES (${platform}, ${vote}, ${author}, ${timestamp})
      ON CONFLICT (channel, username, timestamp) DO NOTHING;
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
    const { rows: youtubeVotes } = await sql`
      SELECT 'youtube' AS platform, * FROM youtube_chat_messages
    `;
    const { rows: twitchVotes } = await sql`
      SELECT 'twitch' AS platform, * FROM twitch_chat_messages
    `;

    const allVotes = [...youtubeVotes, ...twitchVotes].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ votes: allVotes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
