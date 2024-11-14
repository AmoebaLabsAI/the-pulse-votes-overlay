/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useRef, useEffect } from "react";
import { useCountAnimation } from "../hooks/useCountAnimation";

export default function Overlay() {
  const [guest1Votes, setGuest1Votes] = useState<number | null>(90);
  const [guest2Votes, setGuest2Votes] = useState<number | null>(90);
  const [guest1Name, setGuest1Name] = useState<string>("cortez");
  const [guest2Name, setGuest2Name] = useState<string>("trump");

  const guest1TextRef = useRef<HTMLParagraphElement>(null);
  const guest1ContainerRef = useRef<HTMLDivElement>(null);

  // Animate the vote counts
  const animatedGuest1Votes = useCountAnimation(guest1Votes);
  const animatedGuest2Votes = useCountAnimation(guest2Votes);

  // Calculate vote ratio with animated values
  const votesRatio =
    animatedGuest1Votes && animatedGuest2Votes
      ? animatedGuest1Votes / (animatedGuest1Votes + animatedGuest2Votes)
      : 0.5;

  // Convert ratio to weight (100-900 scale)
  const getWeight = (ratio: number) => {
    return Math.round(ratio * 800 + 100);
  };

  const guest1FontWeight = getWeight(votesRatio);
  const guest2FontWeight = getWeight(1 - votesRatio);

  // Calculate font size for each name individually
  const getFontSize = () => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;

    // Use the smaller container width to ensure both names fit
    const smallerWidth = Math.min(guest1Width, guest2Width);
    const longerNameLength = Math.max(guest1Name.length, guest2Name.length);

    // Calculate available width in pixels
    const paddingPixels = 8;
    const containerPixels =
      (viewportWidth * smallerWidth) / 100 - paddingPixels;

    // Calculate font size based on longer name and smaller container
    const fontSize =
      (containerPixels / longerNameLength / (viewportWidth / 100)) * 2.5;

    return Math.max(8, fontSize);
  };

  // Calculate font stretch to exactly fill container width
  const getStretch = (
    name: string,
    containerWidth: number,
    fontSize: number
  ) => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;
    const paddingPixels = 8;
    const containerPixels =
      (viewportWidth * containerWidth) / 100 - paddingPixels;

    // Calculate base width using shared font size
    const baseCharWidth = (viewportWidth * fontSize) / 120;
    const baseTextWidth = baseCharWidth * name.length;

    // Calculate stretch needed
    const stretchNeeded = (containerPixels / baseTextWidth) * 100;

    return Math.max(75, Math.min(3000, stretchNeeded * 1.4));
  };

  // Calculate container width proportional to votes (50/50 to 65/35)
  const getWidth = (ratio: number) => {
    if (Math.abs(ratio - 0.5) < 0.001) return 50; // Equal votes = equal width

    // Scale linearly from 50% to 65%
    const width = 50 + (ratio - 0.5) * 30; // Changed from 60 to 30 to scale to 65%
    return Math.max(35, Math.min(65, width)); // Changed from 20/80 to 35/65 split
  };

  const guest1Width = getWidth(votesRatio);
  const guest2Width = 100 - guest1Width; // Ensure total is exactly 100%

  // Calculate a single font size for both names
  const sharedFontSize = getFontSize();

  // Calculate stretches using shared font size
  const guest1Stretch = getStretch(guest1Name, guest1Width, sharedFontSize);
  const guest2Stretch = getStretch(guest2Name, guest2Width, sharedFontSize);

  // Debug measurements
  useEffect(() => {
    if (guest1TextRef.current && guest1ContainerRef.current) {
      const textWidth = guest1TextRef.current.getBoundingClientRect().width;
      const containerWidth =
        guest1ContainerRef.current.getBoundingClientRect().width;

      console.log("Text width:", textWidth);
      console.log("Container width:", containerWidth);
      console.log("Current stretch:", guest1Stretch);
      console.log("Ratio needed:", containerWidth / textWidth);
    }
  }, [guest1Stretch, guest1Name, guest1Width]);

  return (
    <div className="max-w-screen overflow-x-hidden">
      <div className="p-3">
        <label>Guest 1 Votes:</label>
        <input
          type="number"
          className="text-black"
          onChange={(e) => {
            setGuest1Votes(Number(e.target.value));
          }}
        />
      </div>
      <div className="p-3">
        <label>Guest 1 last name:</label>
        <input
          type="text"
          className="text-black"
          onChange={(e) => {
            setGuest1Name(e.target.value);
          }}
        />
      </div>
      <div className="p-3">
        <label>Guest 2 Votes:</label>
        <input
          type="number"
          className="text-black"
          onChange={(e) => {
            setGuest2Votes(Number(e.target.value));
          }}
        />
      </div>
      <div className="p-3">
        <label>Guest 2 last name:</label>
        <input
          type="text"
          className="text-black"
          onChange={(e) => {
            setGuest2Name(e.target.value);
          }}
        />
      </div>
      <div className="flex w-screen max-w-full font-roboto-flex">
        <div
          className="flex"
          style={{
            width: `${guest1Width}%`,
          }}
        >
          <div className="flex flex-col w-full min-w-0">
            <p className="guest1-vote-count text-4xl">
              {animatedGuest1Votes ?? 0}
            </p>
            <div
              ref={guest1ContainerRef}
              className="w-full flex items-end min-w-0"
            >
              <p
                ref={guest1TextRef}
                style={{
                  fontStretch: `${guest1Stretch}%`,
                  fontWeight: guest1FontWeight,
                  maxWidth: "100%",
                  fontSize: `${sharedFontSize}vw`,
                }}
                className="guest1-lastname leading-none whitespace-nowrap text-left w-full"
              >
                {guest1Name}
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex"
          style={{
            width: `${guest2Width}%`,
          }}
        >
          <div className="flex flex-col w-full min-w-0 overflow-hidden">
            <p className="guest2-vote-count text-4xl text-right">
              {animatedGuest2Votes ?? 0}
            </p>
            <div className="w-full flex items-end justify-end min-w-0 overflow-hidden">
              <div className="w-full min-w-0 overflow-hidden">
                <p
                  style={{
                    fontStretch: `${guest2Stretch}%`,
                    fontWeight: guest2FontWeight,
                    maxWidth: "100%",
                    fontSize: `${sharedFontSize}vw`,
                  }}
                  className="guest2-lastname leading-none whitespace-nowrap text-right w-full"
                >
                  {guest2Name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
