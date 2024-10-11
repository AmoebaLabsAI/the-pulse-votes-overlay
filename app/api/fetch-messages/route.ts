import { NextResponse } from "next/server";
import { google } from "googleapis";
import tmi from "tmi.js";
import { ChatUserstate } from "tmi.js";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const twitchClient = new tmi.Client({
  channels: [process.env.TWITCH_CHANNEL!],
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const liveChatId = searchParams.get("liveChatId");
  const pageToken = searchParams.get("pageToken") || undefined;

  if (!liveChatId) {
    return NextResponse.json(
      { error: "Live chat ID is required" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Fetch YouTube messages
    const youtubeResponse = await youtube.liveChatMessages.list({
      liveChatId: liveChatId,
      part: ["snippet", "authorDetails"],
      pageToken: pageToken,
    });

    const youtubeMessages =
      youtubeResponse.data.items
        ?.filter((item) => {
          const publishedAt = new Date(item.snippet?.publishedAt || "");
          return publishedAt >= today;
        })
        .map((item) => ({
          platform: "youtube",
          message: item.snippet?.displayMessage,
          author: item.authorDetails?.displayName,
          timestamp: item.snippet?.publishedAt,
        })) || [];

    // Fetch Twitch messages
    await twitchClient.connect();
    const twitchMessages = await new Promise<any[]>((resolve) => {
      const messages: any[] = [];
      const timeout = setTimeout(() => {
        twitchClient.disconnect();
        resolve(messages);
      }, 5000); // Listen for 5 seconds

      twitchClient.on(
        "message",
        (
          _channel: string,
          tags: { [key: string]: any },
          message: string,
          self: boolean
        ) => {
          if (!self) {
            const timestamp = new Date(parseInt(tags["tmi-sent-ts"] as string));
            if (timestamp >= today) {
              messages.push({
                platform: "twitch",
                message: message,
                author: tags["display-name"],
                timestamp: timestamp.toISOString(),
              });
            }
          }
        }
      );
    });

    return NextResponse.json({
      messages: [...youtubeMessages, ...twitchMessages],
      nextPageToken: youtubeResponse.data.nextPageToken,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    if (error.message.includes("page token is not valid")) {
      return NextResponse.json(
        { error: "Invalid page token. The live stream may have ended." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
