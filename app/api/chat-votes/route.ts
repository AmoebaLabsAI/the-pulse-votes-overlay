import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
const YouTube = require("youtube-live-chat");
const tmi = require("tmi.js");

let yt: any;
let twitchClient: any;
let currentDebateId: number | null = null;

// Initialize YouTube chat
function initYouTube(debateId: number) {
  if (!yt) {
    yt = new YouTube(
      process.env.YOUTUBE_CHANNEL_ID,
      process.env.YOUTUBE_API_KEY
    );

    yt.on("ready", () => {
      console.log("YouTube chat listener ready!");
      yt.listen(5000);
    });

    yt.on("message", async (data: any) => {
      const message = data.snippet.displayMessage.toLowerCase();
      if (message.includes("1") || message.includes("2")) {
        await sql`INSERT INTO votes (debate_id, platform, vote) VALUES (${debateId}, 'youtube', ${
          message.includes("1") ? "1" : "2"
        })`;
      }
    });

    yt.on("error", (error: any) => {
      console.error("YouTube chat error:", error);
    });
  }
}

// Initialize Twitch chat
function initTwitch(debateId: number) {
  if (!twitchClient) {
    twitchClient = new tmi.Client({
      channels: [process.env.TWITCH_CHANNEL],
    });

    twitchClient.connect();

    twitchClient.on(
      "message",
      async (channel: string, tags: any, message: string, self: boolean) => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("1") || lowerMessage.includes("2")) {
          await sql`INSERT INTO votes (debate_id, platform, vote) VALUES (${debateId}, 'twitch', ${
            lowerMessage.includes("1") ? "1" : "2"
          })`;
        }
      }
    );
  }
}

export async function POST(request: Request) {
  const { title } = await request.json();

  // Create a new debate
  const { rows } =
    await sql`INSERT INTO debates (title) VALUES (${title}) RETURNING id`;
  currentDebateId = rows[0].id;

  // Initialize chat listeners for the new debate
  initYouTube(currentDebateId!);
  initTwitch(currentDebateId!);

  return NextResponse.json({ debateId: currentDebateId });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debateId = searchParams.get("debateId");

  if (!debateId) {
    return NextResponse.json(
      { error: "debateId is required" },
      { status: 400 }
    );
  }

  // Get all votes for the specified debate from the database
  const { rows } = await sql`SELECT * FROM votes WHERE debate_id = ${debateId}`;

  return NextResponse.json({ votes: rows });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const debateId = searchParams.get("debateId");

  if (!debateId) {
    return NextResponse.json(
      { error: "debateId is required" },
      { status: 400 }
    );
  }

  // Clear the votes for the specified debate
  await sql`DELETE FROM votes WHERE debate_id = ${debateId}`;

  return NextResponse.json({ message: "Votes cleared successfully" });
}
