import { NextResponse } from "next/server";
const YouTube = require("youtube-live-chat");

let yt: any;
let messages: string[] = [];

export async function GET() {
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
      messages.push(data.snippet.displayMessage);
      // Keep only the last 100 messages
      if (messages.length > 100) {
        messages.shift();
      }
    });

    yt.on("error", (error: any) => {
      console.error("YouTube chat error:", error);
    });
  }

  return NextResponse.json({ messages });
}
