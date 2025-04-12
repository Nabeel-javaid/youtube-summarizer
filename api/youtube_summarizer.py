from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
import re
import sys
import json

def extract_video_id(url):
    """Extract the video ID from a YouTube URL."""
    video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
    if video_id_match:
        return video_id_match.group(1)
    return url  # If it's already just the ID

def get_transcript(video_id):
    """Get the transcript of a YouTube video."""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([t["text"] for t in transcript])
    except Exception as e:
        return f"Error getting transcript: {str(e)}"

def summarize_text(text, max_length=150):
    """Summarize the given text."""
    summarizer = pipeline("summarization")
    
    # Split text into chunks if it's too long
    max_chunk_size = 1000
    chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]
    
    summaries = []
    for chunk in chunks:
        if len(chunk) < 50:  # Skip very small chunks
            continue
        summary = summarizer(chunk, max_length=max_length, min_length=30, do_sample=False)
        summaries.append(summary[0]['summary_text'])
    
    return " ".join(summaries)

def summarize_youtube_video(url):
    """Main function to summarize a YouTube video."""
    video_id = extract_video_id(url)
    transcript = get_transcript(video_id)
    
    if transcript.startswith("Error"):
        return {"error": transcript}
    
    summary = summarize_text(transcript)
    return {"summary": summary}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python youtube_summarizer.py <youtube_url>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = summarize_youtube_video(url)
    print(json.dumps(result))
