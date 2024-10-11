import { NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function GET(request: Request) {
  console.log("Fetching Live Chat ID");
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  console.log("Video ID:", videoId);

  if (!videoId) {
    console.error("Video ID is missing");
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Calling YouTube API");
    const response = await youtube.videos.list({
      part: ["liveStreamingDetails"],
      id: [videoId],
    });

    console.log(
      "YouTube API Response:",
      JSON.stringify(response.data, null, 2)
    );

    const liveChatId =
      response.data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) {
      console.error("Live chat ID not found in response");
      return NextResponse.json(
        { error: "Live chat ID not found" },
        { status: 404 }
      );
    }

    console.log("Live Chat ID found:", liveChatId);
    return NextResponse.json({ liveChatId });
  } catch (error) {
    console.error("Error fetching live chat ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch live chat ID" },
      { status: 500 }
    );
  }
}
