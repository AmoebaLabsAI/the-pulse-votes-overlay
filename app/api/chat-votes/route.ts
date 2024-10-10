import { NextResponse } from "next/server";
const YouTube = require("youtube-live-chat");
const tmi = require("tmi.js");

let yt: any;
let twitchClient: any;
let votes: { platform: string; vote: string }[] = [];

// Initialize YouTube chat
function initYouTube() {
  if (!yt) {
    yt = new YouTube(
      "UCOo_vz0lN6FeSCH8P4BFBFA",
      "AIzaSyBkxkRVUP4L1IflLxQpOXGoGL6MdxTUwsc"
    );

    yt.on("ready", () => {
      console.log("YouTube chat listener ready!");
      yt.listen(5000);
    });

    yt.on("message", (data: any) => {
      const message = data.snippet.displayMessage.toLowerCase();
      if (message.includes("1") || message.includes("2")) {
        votes.push({
          platform: "youtube",
          vote: message.includes("1") ? "1" : "2",
        });
      }
    });

    yt.on("error", (error: any) => {
      console.error("YouTube chat error:", error);
    });
  }
}

// Initialize Twitch chat
function initTwitch() {
  if (!twitchClient) {
    twitchClient = new tmi.Client({
      channels: ["jdamiba"],
    });

    twitchClient.connect();

    twitchClient.on(
      "message",
      (channel: string, tags: any, message: string, self: boolean) => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("1") || lowerMessage.includes("2")) {
          votes.push({
            platform: "twitch",
            vote: lowerMessage.includes("1") ? "1" : "2",
          });
        }
      }
    );
  }
}

export async function GET() {
  // Initialize chat listeners if not already done
  initYouTube();
  initTwitch();

  // Return the current votes and clear the array
  const currentVotes = [...votes];
  votes = [];
  return NextResponse.json({ votes: currentVotes });
}
