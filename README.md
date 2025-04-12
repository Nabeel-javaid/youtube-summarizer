# YouTube Video Summarizer

A web application that takes a YouTube video URL and generates a concise summary of its content using NLP technology.

## Features

- Input a YouTube video URL
- Extract video transcript automatically
- Process and summarize the content
- Display the summary in a user-friendly format

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes, Python
- **NLP**: Transformers library (Hugging Face)
- **Deployment**: Vercel

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd youtube-summarizer
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies (requires Python 3.8+):
   ```bash
   # Use the installation script (recommended)
   ./install-python-deps.sh
   
   # Or manually install
   pip install -r api/requirements.txt
   # Or with pip3 if you use python3
   pip3 install -r api/requirements.txt
   ```

4. Verify your Python environment:
   ```bash
   # Run the provided check script
   ./check-python.sh
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Python Not Available Error

If you see "Error: Server configuration error: Python is not available":

1. Make sure Python is installed (Python 3.8+ recommended)
2. Verify that `python` or `python3` is in your PATH
3. Install dependencies using the installation script:
   ```bash
   ./install-python-deps.sh
   ```
4. If issues persist, manually install the required packages:
   ```bash
   pip install numpy==1.24.3 youtube-transcript-api==0.6.1 transformers==4.37.2 torch==2.2.0 sentencepiece==0.1.99
   # Or
   pip3 install numpy==1.24.3 youtube-transcript-api==0.6.1 transformers==4.37.2 torch==2.2.0 sentencepiece==0.1.99
   ```
5. Run the check script to verify:
   ```bash
   ./check-python.sh
   ```

### NumPy Compatibility Issues

If you see NumPy-related errors, try forcing an older version of NumPy:
```bash
pip install numpy==1.24.3 --force-reinstall
# Or
pip3 install numpy==1.24.3 --force-reinstall
```

## Deployment on Vercel

This project is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com/)
3. Import your GitHub repository in Vercel
4. Deploy

The `vercel.json` file in this repository already contains the necessary configuration to install Python dependencies during deployment.

## How It Works

1. The frontend collects a YouTube URL from the user
2. The URL is sent to the Next.js API route
3. The API route runs the Python script to:
   - Extract the video ID
   - Fetch the transcript using YouTube Transcript API
   - Process and summarize the text using Transformers
4. The summary is returned to the frontend and displayed to the user

## License

MIT
