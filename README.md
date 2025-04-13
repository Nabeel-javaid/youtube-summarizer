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

- **Framework**: Next.js
- **Language**: TypeScript
- **UI**: React, TailwindCSS, Framer Motion
- **API**: Next.js API Routes (Node.js runtime)
- **AI**: OpenAI GPT API

## Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Nabeel-javaid/youtube-summarizer.git
    cd youtube-summarizer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    - Create a `.env` file in the root of the project.
    - Add your OpenAI API key to the `.env` file:
      ```
      OPENAI_API_KEY=your_openai_api_key_here
      ```
    - Obtain your key from [OpenAI API Keys](https://platform.openai.com/api-keys).

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1.  The frontend collects a YouTube URL from the user.
2.  The URL is sent to the Next.js API route (`/api/summarize`).
3.  The API route (running on Node.js) extracts the video ID.
4.  It fetches the transcript using the `youtube-captions-scraper` library.
5.  The transcript text is formatted into readable paragraphs.
6.  The formatted transcript is sent to the OpenAI API (GPT model) for summarization.
7.  Both the AI-generated summary and the formatted transcript are returned to the frontend.
8.  The frontend displays the summary and transcript, allowing users to switch between them and copy the content.

## License

MIT
