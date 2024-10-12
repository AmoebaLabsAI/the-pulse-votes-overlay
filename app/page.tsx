/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper function to process votes data for the charts
const processVotesForCharts = (votes: any[]) => {
  const voteCounts = { "1": 0, "2": 0 };
  const platforms = new Set<string>();

  votes.forEach((vote) => {
    if (vote.vote === "1" || vote.vote === "2") {
      voteCounts[vote.vote as "1" | "2"] += 1;
      platforms.add(vote.platform);
    }
  });

  const maxVotes = Math.max(voteCounts["1"], voteCounts["2"]);

  return {
    voteData: [
      { name: "Option 1", votes: voteCounts["1"] },
      { name: "Option 2", votes: voteCounts["2"] },
    ],
    platforms: Array.from(platforms),
    maxVotes: maxVotes,
  };
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [voteData, setVoteData] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [liveChatId, setLiveChatId] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string>("");

  const clearVotes = async () => {
    await fetch(`/api/chat-votes`, { method: "DELETE" });
    setVotes([]);
  };

  const getVotes = async () => {
    const response = await fetch(`/api/chat-votes`);
    const data = await response.json();
    setVotes(data.votes);
  };

  const fetchMessages = async () => {
    if (!liveChatId) {
      console.error("Live Chat ID is not set");
      return;
    }

    try {
      const response = await fetch(
        `/api/fetch-messages?liveChatId=${liveChatId}&pageToken=${
          pageToken || ""
        }`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching messages:", data.error);
        if (data.error.includes("The live stream may have ended")) {
          setIsListening(false);
        }
        return;
      }

      setPageToken(data.nextPageToken);

      for (const message of data.messages) {
        if (message.message === "1" || message.message === "2") {
          await fetch("/api/chat-votes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: message.platform,
              vote: message.message,
              author: message.author,
              timestamp: message.timestamp,
            }),
          });
        }
      }
      await getVotes();
    } catch (error) {
      console.error("Error in fetchMessages:", error);
    }
  };

  const getLiveChatId = async (videoId: string) => {
    if (!videoId) {
      console.error("Video ID is required");
      return;
    }
    try {
      const response = await fetch(
        `/api/get-live-chat-id?videoId=${videoId}&_=${Date.now()}`,
        {
          cache: "no-store",
        }
      );
      const data = await response.json();

      console.log("API Response:", data);

      if (data.liveChatId) {
        console.log("New Live Chat ID:", data.liveChatId);
        setLiveChatId(data.liveChatId);
        setIsListening(true); // Automatically start listening when we get a valid Live Chat ID
      } else {
        console.error("Error!!! Failed to get Live Chat ID:", data.error);
        setIsListening(false);
      }
    } catch (error) {
      console.error("Error fetching Live Chat ID:", error);
      setIsListening(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && liveChatId) {
      interval = setInterval(fetchMessages, 5000); // Poll for messages every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isListening, liveChatId, pageToken]);

  useEffect(() => {
    const { voteData, platforms, maxVotes } = processVotesForCharts(votes);
    setVoteData(voteData);
    setPlatforms(platforms);
    setMaxVotes(maxVotes);
  }, [votes]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="Enter YouTube Video ID"
          className="border p-2 mr-2"
        />
        <button
          onClick={() => getLiveChatId(videoId)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Set Live Chat ID
        </button>
      </div>

      {!isListening ? (
        <p>
          Enter a Video ID and click &quot;Set Live Chat ID&quot; to start
          listening for votes.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Live Voting</h1>
          <div className="space-x-2 mb-4">
            <button
              onClick={getVotes}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Refresh Votes
            </button>
            <button
              onClick={clearVotes}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Votes
            </button>
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {voteData.map((data, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">
                  Votes for Option {data.name}
                </h2>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={[data]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, maxVotes]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="votes"
                        fill={index === 0 ? "#8884d8" : "#82ca9d"}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* Vote counts */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">Total Votes</h2>
            <p>Option 1: {voteData[0]?.votes || 0}</p>
            <p>Option 2: {voteData[1]?.votes || 0}</p>
          </div>

          {/* Platforms */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">Active Platforms</h2>
            <ul>
              {platforms.map((platform, index) => (
                <li key={index}>{platform}</li>
              ))}
            </ul>
          </div>

          {/* Existing vote list */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Recent Votes</h2>
            <ul>
              {votes
                .slice(-10)
                .reverse()
                .map((vote, index) => (
                  <li key={index}>
                    {vote.platform}: {vote.vote}
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
