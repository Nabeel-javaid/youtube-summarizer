# YouTube Video Summarizer

A modern web application that takes a YouTube video URL and generates a concise summary of its content using AI. The app also displays the full transcript in a readable format.

## Features

- Input a YouTube video URL
- Extract video transcript automatically
- Process and summarize the content using OpenAI's API
- Display the AI-generated summary in a user-friendly format
- View the full, formatted transcript with proper paragraphs and punctuation
- Beautiful, animated UI with a dark theme
- Copy summary or transcript to clipboard

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API routes
- **AI**: OpenAI GPT API for generating summaries
- **Deployment**: Vercel

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Nabeel-javaid/youtube-summarizer.git
   cd youtube-summarizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your OpenAI API key to `.env`
   - Optionally add your YouTube API key for better title fetching

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The application requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for generating summaries
- `YOUTUBE_API_KEY` (optional): YouTube Data API key for fetching video metadata

You can obtain these keys from:
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Google Cloud Console](https://console.cloud.google.com/) (for YouTube API)

## Deployment on Vercel

This project is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com/)
3. Import your GitHub repository in Vercel
4. Add your environment variables in the Vercel project settings
5. Deploy

## How It Works

1. The frontend collects a YouTube URL from the user
2. The URL is sent to the Next.js API route
3. The API extracts the video ID and fetches the transcript
4. The transcript is formatted for readability with proper paragraphs
5. The formatted transcript is sent to OpenAI for summarization
6. Both the summary and transcript are returned to the frontend and displayed to the user
7. Users can switch between viewing the summary and full transcript

## License

MIT
