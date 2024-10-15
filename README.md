# Live Voting Application

This application collects and visualizes votes from YouTube and Twitch live chats in real-time.

## How It Works: Data Flow

1. **Initialization**

   - User clicks "Start Listening for Votes" in the UI (`app/page.tsx`).
   - The app fetches the YouTube Live Chat ID (`/api/get-live-chat-id`).

2. **Message Fetching (Every 5 seconds)**

   - The app calls `/api/fetch-messages` with the Live Chat ID.
   - This API route:
     a. Retrieves recent YouTube chat messages.

3. **Vote Processing**

   - For each message containing "1" or "2":
     - The app sends a POST request to `/api/chat-votes`.
     - This inserts the vote into the database, avoiding duplicates.

4. **Vote Retrieval**

   - After processing new messages, the app calls GET `/api/chat-votes`.
   - This retrieves all votes from the database.

5. **UI Update**
   - The app processes the vote data and updates the charts and counters.

## API Routes

### `/api/get-live-chat-id`

- **Input**: YouTube video ID
- **Output**: Live Chat ID for the video
- **Purpose**: Initializes YouTube chat connection

### `/api/fetch-messages`

- **Input**: Live Chat ID, page token
- **Output**: Recent messages from YouTube and Twitch
- **Purpose**: Retrieves new chat messages for vote processing

### `/api/chat-votes`

- **POST**
  - **Input**: Platform, vote, author, timestamp
  - **Purpose**: Inserts a new vote into the database
- **GET**
  - **Output**: All recorded votes
  - **Purpose**: Retrieves votes for display
- **DELETE**
  - **Purpose**: Clears all votes from the database

## Data Freshness and Deduplication

- Only messages from the current day are processed.
- The database schema prevents duplicate votes from the same author, platform, and timestamp.

## Privacy and Data Usage

- Only voting data ("1" or "2" messages) is collected and stored.
- Votes are stored with minimal identifying information (platform and timestamp).

## Technical Notes

- This application uses API keys for YouTube and Twitch connections.
- The app is built with Next.js and uses server-side API routes for data processing.
- Real-time updates are achieved through polling every 5 seconds.

### Architecture Overview

The Pulse, an innovative live streaming series, incorporates real-time audience interaction as a core feature. Central to this interaction is the graphical overlay system, a sophisticated component that collects viewer votes and displays them in real-time during the livestream. This document provides an in-depth exploration of the architecture behind this system, elucidating its various components and their interactions.

At the heart of the graphical overlay is the OBS (Open Broadcaster Software) Web Source. This feature embeds a web browser directly into the broadcast, displaying a single website that serves as the overlay. This approach allows for dynamic, real-time updates to the visual elements of the stream without interrupting the broadcast.

The frontend of the system is built using Next.js, a JavaScript-based web application framework. When a team member first accesses the application, they are prompted to input the YouTube Video ID of the current livestream. This ID is crucial as it allows the system to connect to the correct YouTube chat stream. Once the ID is entered, the application switches to the overlay view, currently displaying two bar charts representing each participant's vote total. It's worth noting that this visualization is subject to change as the team continues to refine the design for optimal data representation.

Behind the scenes, the web application performs several critical functions. Every five seconds, it sends a request to the YouTube API to fetch the latest chat log. The YouTube API is designed to deliver the entire chat log with each request, presenting messages in chronological order. As the chat log grows, YouTube begins to paginate the responses, providing a nextPageToken that must be included in subsequent requests to retrieve the correct page of messages.
Upon receiving the chat log, the application processes each message, identifying votes (represented by "1" or "2" in the chat) and adding them to a Postgres database hosted on Vercel. To maintain data integrity and prevent duplicate entries, each vote is stored with a unique combination of username and timestamp.

The Twitch integration follows a different approach due to the event-based nature of its API. An Amazon EC2 instance runs a Node.js server that listens for incoming Twitch chat messages in real-time. As messages arrive, they are temporarily stored in a Redis cache. Periodically, this cache is flushed, and the data is transferred to the same Postgres database that stores the YouTube chat messages.

The backend of the system is implemented using Next.js API routes, providing endpoints for various functions such as fetching the YouTube Live Chat ID, retrieving chat messages, and recording and retrieving votes. These API routes serve as the bridge between the frontend application and the underlying data sources and storage systems.

Data visualization is handled on the frontend using the Recharts library. The application processes the vote data, aggregating counts and preparing the information in a format suitable for the charting library. This processed data is then used to update the visual representation of votes in real-time.

## Data Flow

The data flow in the system begins when a user enters the YouTube Video ID in the frontend.

The backend then fetches the Live Chat ID from the YouTube API. With this information, the frontend begins its regular polling for new messages. Meanwhile, an EC2 instance is populating the database with Twitch chat messages in real time.

The backend retrieves messages from both YouTube and Twitch (via the Postgres database), processes the votes, and stores them.

The frontend then fetches this aggregated vote data and uses it to update the visualization, which is displayed through OBS as part of the livestream.

## Getting Started

In order for this app to work, you need to setup environment variables as shown in the .env.example file. Change this to a .env.local file for local development. Make sure these environment variables are set in your production environment. Don't forget to get API keys and client secrets from Twitch and YouTube.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
