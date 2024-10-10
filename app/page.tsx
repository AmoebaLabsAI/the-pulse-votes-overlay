"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Pulse component to visualize sentiment
const Pulse = ({ sentiment }: { sentiment: number }) => {
  const height = `${(sentiment + 1) * 50}%`;
  const backgroundColor =
    sentiment > 0
      ? `rgb(255, ${255 - sentiment * 255}, ${255 - sentiment * 255})`
      : `rgb(${255 + sentiment * 255}, ${255 + sentiment * 255}, 255)`;

  return (
    <div className="w-full h-64 bg-gray-200 relative">
      <div
        className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-in-out"
        style={{ height, backgroundColor }}
      />
    </div>
  );
};

export default function Home() {
  const [sentiment, setSentiment] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/youtube-chat");
        const data = await response.json();

        data.messages.forEach((message: string) => {
          const lowerMessage = message.toLowerCase();
          if (lowerMessage.includes("1")) {
            setSentiment((prevSentiment) => Math.min(prevSentiment + 0.1, 1));
          } else if (lowerMessage.includes("2")) {
            setSentiment((prevSentiment) => Math.max(prevSentiment - 0.1, -1));
          }
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Live Debate Sentiment</h1>
        <p>Watch the pulse change as the audience reacts!</p>
      </header>

      <main className="w-full max-w-2xl">
        <Pulse sentiment={sentiment} />
        <div className="mt-4 text-center">
          <p>Current Sentiment: {sentiment.toFixed(2)}</p>
          <p>
            {sentiment > 0
              ? "Favoring Guest 1"
              : sentiment < 0
              ? "Favoring Guest 2"
              : "Neutral"}
          </p>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
