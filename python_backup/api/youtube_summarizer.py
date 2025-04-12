import sys
import re
import json
import time

def log_debug(message):
    """Print a debug message with timestamp"""
    print(f"DEBUG [{time.time()}]: {message}", file=sys.stderr)

def check_dependencies():
    """Check if all required dependencies are installed"""
    log_debug("Checking dependencies...")
    missing_deps = []
    try:
        import youtube_transcript_api
        log_debug("youtube_transcript_api found")
    except ImportError:
        missing_deps.append("youtube_transcript_api")
    
    try:
        import numpy
        log_debug(f"NumPy version: {numpy.__version__}")
        if numpy.__version__.startswith('2.'):
            print(f"Warning: NumPy version {numpy.__version__} might cause issues. Version 1.x is recommended.")
    except ImportError:
        missing_deps.append("numpy")
    
    try:
        import torch
        log_debug(f"PyTorch version: {torch.__version__}")
    except ImportError:
        missing_deps.append("torch")
    
    try:
        import transformers
        log_debug(f"Transformers version: {transformers.__version__}")
    except ImportError:
        missing_deps.append("transformers")
    
    try:
        import sentencepiece
        log_debug("sentencepiece found")
    except ImportError:
        missing_deps.append("sentencepiece")
    
    if missing_deps:
        print(json.dumps({
            "error": f"Missing Python dependencies: {', '.join(missing_deps)}. "
                    f"Please run: pip install -r api/requirements.txt"
        }))
        sys.exit(1)
    
    log_debug("All dependencies found")

# Check dependencies first
check_dependencies()

# Now import properly
log_debug("Importing libraries...")
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
import numpy as np

def extract_video_id(url):
    """Extract the video ID from a YouTube URL."""
    log_debug(f"Extracting video ID from URL: {url}")
    video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
    if video_id_match:
        video_id = video_id_match.group(1)
        log_debug(f"Extracted video ID: {video_id}")
        return video_id
    log_debug(f"Could not extract video ID, using URL as is")
    return url  # If it's already just the ID

def get_transcript(video_id):
    """Get the transcript of a YouTube video."""
    log_debug(f"Getting transcript for video ID: {video_id}")
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        log_debug(f"Got transcript with {len(transcript)} segments")
        text = " ".join([t["text"] for t in transcript])
        log_debug(f"Transcript length: {len(text)} characters")
        return text
    except Exception as e:
        log_debug(f"Error getting transcript: {str(e)}")
        return f"Error getting transcript: {str(e)}"

def summarize_text(text, max_length=150):
    """Summarize the given text."""
    log_debug(f"Summarizing text of length {len(text)}")
    try:
        log_debug("Loading summarization pipeline...")
        summarizer = pipeline("summarization")
        log_debug("Pipeline loaded successfully")
        
        # Split text into chunks if it's too long
        max_chunk_size = 1000
        chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]
        log_debug(f"Split text into {len(chunks)} chunks")
        
        summaries = []
        for i, chunk in enumerate(chunks):
            if len(chunk) < 50:  # Skip very small chunks
                log_debug(f"Skipping chunk {i+1} (too small: {len(chunk)} chars)")
                continue
            log_debug(f"Summarizing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
            summary = summarizer(chunk, max_length=max_length, min_length=30, do_sample=False)
            log_debug(f"Chunk {i+1} summarized successfully")
            summaries.append(summary[0]['summary_text'])
        
        final_summary = " ".join(summaries)
        log_debug(f"Final summary length: {len(final_summary)} characters")
        return final_summary
    except Exception as e:
        log_debug(f"Error summarizing text: {str(e)}")
        return f"Error summarizing text: {str(e)}"

def summarize_youtube_video(url):
    """Main function to summarize a YouTube video."""
    log_debug(f"Summarizing YouTube video: {url}")
    video_id = extract_video_id(url)
    transcript = get_transcript(video_id)
    
    if transcript.startswith("Error"):
        log_debug(f"Returning error: {transcript}")
        return {"error": transcript}
    
    log_debug("Starting text summarization...")
    summary = summarize_text(transcript)
    if summary.startswith("Error"):
        log_debug(f"Returning error: {summary}")
        return {"error": summary}
    
    log_debug("Summarization complete")
    return {"summary": summary}

if __name__ == "__main__":
    log_debug("Script started")
    if len(sys.argv) != 2:
        log_debug("Invalid arguments")
        print(json.dumps({"error": "Usage: python youtube_summarizer.py <youtube_url>"}))
        sys.exit(1)
    
    url = sys.argv[1]
    log_debug(f"Processing URL: {url}")
    result = summarize_youtube_video(url)
    log_debug("Returning result as JSON")
    print(json.dumps(result))
    log_debug("Script completed")
