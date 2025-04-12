import sys
import re
import json
import time

def log_debug(message):
    """Print a debug message with timestamp"""
    print(f"DEBUG [{time.time()}]: {message}", file=sys.stderr)

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
        
        # Improved transcript processing
        segments = []
        for t in transcript:
            text = t["text"].strip()
            # Add period if the segment doesn't end with punctuation
            if text and not text[-1] in ".!?":
                text += "."
            segments.append(text)
        
        text = " ".join(segments)
        # Fix multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Fix spaces before punctuation
        text = re.sub(r'\s([,.!?;:])', r'\1', text)
        # Add spaces after punctuation if missing
        text = re.sub(r'([,.!?;:])([A-Za-z])', r'\1 \2', text)
        # Capitalize first letter of sentences
        text = re.sub(r'(?<=[.!?])\s+([a-z])', lambda m: ' ' + m.group(1).upper(), text)
        text = text[0].upper() + text[1:]
        
        log_debug(f"Transcript length: {len(text)} characters")
        return text
    except Exception as e:
        log_debug(f"Error getting transcript: {str(e)}")
        return f"Error getting transcript: {str(e)}"

def format_transcript_for_display(transcript):
    """Format the transcript into paragraphs for better readability."""
    sentences = re.split(r'(?<=[.!?])\s+', transcript)
    
    # Group sentences into paragraphs (8-10 sentences per paragraph)
    paragraphs = []
    for i in range(0, len(sentences), 8):
        paragraph = " ".join(sentences[i:i+8])
        if paragraph:
            paragraphs.append(paragraph)
    
    return "\n\n".join(paragraphs)

def simple_summarize(text, sentences=12):
    """Create a simple extractive summary by selecting key sentences."""
    log_debug(f"Simple summarizing text of length {len(text)}")
    try:
        # Split into sentences (improved regex for better sentence splitting)
        sentences_list = re.split(r'(?<=[.!?])\s+', text)
        sentences_list = [s.strip() for s in sentences_list if s.strip()]
        
        log_debug(f"Split into {len(sentences_list)} sentences")
        
        if len(sentences_list) <= sentences:
            log_debug("Text is already shorter than requested summary length")
            return text
        
        # Take a few sentences from the beginning (introduction)
        intro_count = min(3, len(sentences_list) // 6)
        intro_sentences = sentences_list[:intro_count]
        
        # Take a few sentences from the end (conclusion)
        outro_count = min(2, len(sentences_list) // 8)
        outro_sentences = sentences_list[-outro_count:] if outro_count > 0 else []
        
        # Take remaining sentences from evenly spaced positions in the middle
        middle_count = sentences - intro_count - outro_count
        middle_indices = []
        
        if middle_count > 0 and len(sentences_list) > (intro_count + outro_count):
            middle_section = sentences_list[intro_count:-outro_count] if outro_count > 0 else sentences_list[intro_count:]
            step = max(1, len(middle_section) // middle_count)
            
            for i in range(0, len(middle_section), step):
                if len(middle_indices) < middle_count:
                    middle_indices.append(i + intro_count)
        
        # Combine all selected sentences in their original order
        all_indices = sorted(list(set(list(range(intro_count)) + middle_indices + [len(sentences_list) - i - 1 for i in range(outro_count)])))
        summary_sentences = [sentences_list[i] for i in all_indices]
        
        # Group sentences into paragraphs (3-4 sentences per paragraph)
        paragraphs = []
        for i in range(0, len(summary_sentences), 4):
            paragraph = " ".join(summary_sentences[i:i+4])
            paragraphs.append(paragraph)
        
        summary = "\n\n".join(paragraphs)
        log_debug(f"Created summary with {len(summary_sentences)} sentences, {len(summary)} characters, {len(paragraphs)} paragraphs")
        return summary
    except Exception as e:
        log_debug(f"Error in simple summarization: {str(e)}")
        return f"Error summarizing text: {str(e)}"

def enhance_summary_with_gpt(summary, transcript):
    """Simulate GPT enhancing the summary with better grammar and coherence.
    In a real implementation, this would call the OpenAI API."""
    log_debug("Enhancing summary with GPT-like processing")
    
    try:
        # This is a simple function to improve the grammar and flow
        # In a real implementation, you would call the OpenAI API here
        
        # Some basic improvements
        enhanced = summary
        
        # Fix common issues
        enhanced = re.sub(r'\s+', ' ', enhanced)  # Remove multiple spaces
        enhanced = re.sub(r'\s([,.!?;:])', r'\1', enhanced)  # Fix spaces before punctuation
        enhanced = re.sub(r'([,.!?;:])([A-Za-z])', r'\1 \2', enhanced)  # Add space after punctuation
        
        # Ensure proper capitalization
        sentences = re.split(r'(?<=[.!?])\s+', enhanced)
        sentences = [s[0].upper() + s[1:] if s else s for s in sentences]
        enhanced = " ".join(sentences)
        
        # Add concluding sentence
        if len(sentences) > 3:
            enhanced += "\n\nThis summary was generated from the full transcript and enhanced for better readability."
        
        return enhanced
    except Exception as e:
        log_debug(f"Error enhancing summary: {str(e)}")
        return summary  # Return original if enhancement fails

def summarize_youtube_video(url):
    """Main function to summarize a YouTube video."""
    log_debug(f"Summarizing YouTube video: {url}")
    video_id = extract_video_id(url)
    transcript = get_transcript(video_id)
    
    if transcript.startswith("Error"):
        log_debug(f"Returning error: {transcript}")
        return {"error": transcript}
    
    # Format full transcript for display
    formatted_transcript = format_transcript_for_display(transcript)
    
    log_debug("Starting text summarization...")
    summary = simple_summarize(transcript)
    if summary.startswith("Error"):
        log_debug(f"Returning error: {summary}")
        return {"error": summary}
    
    # Enhance summary with GPT-like processing
    enhanced_summary = enhance_summary_with_gpt(summary, transcript)
    
    # Try to add a title from the video
    try:
        import urllib.request
        log_debug("Fetching video title...")
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        html = urllib.request.urlopen(video_url).read().decode()
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1).replace(' - YouTube', '') if title_match else "Video Summary"
        log_debug(f"Video title: {title}")
        
        return {
            "summary": enhanced_summary,
            "transcript": formatted_transcript,
            "title": title,
            "videoId": video_id
        }
    except Exception as e:
        log_debug(f"Error getting video title: {str(e)}")
        # Continue without title if there's an error
        return {
            "summary": enhanced_summary, 
            "transcript": formatted_transcript,
            "videoId": video_id
        }

# Now import properly
log_debug("Importing libraries...")
from youtube_transcript_api import YouTubeTranscriptApi
import numpy as np

if __name__ == "__main__":
    log_debug("Script started")
    if len(sys.argv) != 2:
        log_debug("Invalid arguments")
        print(json.dumps({"error": "Usage: python simple_summarizer.py <youtube_url>"}))
        sys.exit(1)
    
    url = sys.argv[1]
    log_debug(f"Processing URL: {url}")
    result = summarize_youtube_video(url)
    log_debug("Returning result as JSON")
    print(json.dumps(result))
    log_debug("Script completed") 