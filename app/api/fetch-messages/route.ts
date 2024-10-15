import { NextResponse } from "next/server";
import { google } from "googleapis";
import tmi from "tmi.js";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
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

    return NextResponse.json({
      messages: [...youtubeMessages],
      nextPageToken: youtubeResponse.data.nextPageToken,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    if (
      error instanceof Error &&
      error.message.includes("page token is not valid")
    ) {
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
