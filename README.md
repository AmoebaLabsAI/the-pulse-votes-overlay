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
     b. Connects to Twitch and listens for messages for 5 seconds.
     c. Filters messages from both platforms to only include those from today.

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

## Getting Started

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
