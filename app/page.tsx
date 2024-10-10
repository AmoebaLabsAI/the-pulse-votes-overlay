"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper function to process votes data for the chart
const processVotesForChart = (votes: any[]) => {
  const voteCounts = { "1": 0, "2": 0 };

  return votes.map((vote, index) => {
    const voteType = vote.vote.toLowerCase() as "1" | "2";
    voteCounts[voteType] += 1;
    return {
      time: index,
      ...voteCounts,
    };
  });
};

const VoteButtons = ({ messageId }: { messageId: string }) => {
  const [voted, setVoted] = useState(false);

  const handleVote = async (choice: "1" | "2") => {
    if (voted) return;

    try {
      const response = await fetch("/api/chat-votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, choice }),
      });

      if (response.ok) {
        setVoted(true);
      } else {
        console.error("Failed to submit vote");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  return (
    <div className="flex space-x-2 mt-2">
      <button
        onClick={() => handleVote("1")}
        className={`px-3 py-1 rounded ${
          voted ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        disabled={voted}
      >
        1
      </button>
      <button
        onClick={() => handleVote("2")}
        className={`px-3 py-1 rounded ${
          voted ? "bg-gray-300" : "bg-red-500 hover:bg-red-600"
        } text-white`}
        disabled={voted}
      >
        2
      </button>
    </div>
  );
};

export default function Home() {
  const [debateId, setDebateId] = useState<number | null>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const startNewDebate = async () => {
    const response = await fetch("/api/chat-votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Debate" }),
    });
    const data = await response.json();
    setDebateId(data.debateId);
  };

  const getVotes = async () => {
    if (debateId) {
      const response = await fetch(`/api/chat-votes?debateId=${debateId}`);
      const data = await response.json();
      setVotes(data.votes);
    }
  };

  const clearVotes = async () => {
    if (debateId) {
      await fetch(`/api/chat-votes?debateId=${debateId}`, { method: "DELETE" });
      setVotes([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(getVotes, 5000); // Poll for votes every 5 seconds
    return () => clearInterval(interval);
  }, [debateId]);

  useEffect(() => {
    setChartData(processVotesForChart(votes));
  }, [votes]);

  return (
    <div>
      {!debateId ? (
        <button onClick={startNewDebate}>Start New Debate</button>
      ) : (
        <>
          <h1>Debate ID: {debateId}</h1>
          <button onClick={getVotes}>Refresh Votes</button>
          <button onClick={clearVotes}>Clear Votes</button>

          {/* Line Chart */}
          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="yes" stroke="#8884d8" />
                <Line type="monotone" dataKey="no" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vote counts */}
          <div>
            <h2>Total Votes</h2>
            <p>Yes: {chartData[chartData.length - 1]?.yes || 0}</p>
            <p>No: {chartData[chartData.length - 1]?.no || 0}</p>
          </div>

          {/* Existing vote list */}
          <ul>
            {votes.map((vote, index) => (
              <li key={index}>
                {vote.platform}: {vote.vote}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
