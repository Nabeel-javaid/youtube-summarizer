import { NextRequest, NextResponse } from 'next/server';
import { exec, ExecException } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { YoutubeTranscript } from 'youtube-transcript';
import { OpenAI } from 'openai';

// Define typescript interface for transcript item
interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
}

const execAsync = promisify(exec);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper to get the absolute path to the API directory
function getApiDirectory() {
    // In production on Vercel, the code is in a different location
    if (process.env.VERCEL) {
        return path.join(process.cwd(), 'api');
    }

    // In development
    return path.join(process.cwd(), 'api');
}

// Find the available Python command (python or python3)
async function findPythonCommand() {
    try {
        await execAsync('python --version');
        return 'python';
    } catch (error) {
        try {
            await execAsync('python3 --version');
            return 'python3';
        } catch (error) {
            return null;
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Extract video ID from the URL
        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Get video transcript
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcriptResponse || transcriptResponse.length === 0) {
            return NextResponse.json({ error: 'Unable to get transcript for this video' }, { status: 400 });
        }

        // Convert transcript to text
        const transcriptText = transcriptResponse.map((item: TranscriptItem) => item.text).join(' ');

        // Get video title
        const videoTitle = await fetchVideoTitle(videoId);

        // Summarize transcript with OpenAI
        const summary = await summarizeTranscript(transcriptText);

        return NextResponse.json({
            summary,
            transcript: transcriptText,
            title: videoTitle,
            videoId
        });
    } catch (error) {
        console.error('Error summarizing video:', error);
        return NextResponse.json({ error: 'Failed to summarize video' }, { status: 500 });
    }
}

function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchVideoTitle(videoId: string): Promise<string> {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.title;
        }
        return 'Unknown Video Title';
    } catch (error) {
        console.error('Error fetching video title:', error);
        return 'Unknown Video Title';
    }
}

async function summarizeTranscript(transcript: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    "role": "system",
                    "content": `You are an AI assistant specialized in summarizing YouTube video transcripts. 
          Your task is to provide a comprehensive, well-structured summary of the transcript in clear, concise language.
          
          Follow these guidelines:
          1. Organize the summary into paragraphs with logical flow
          2. Identify and include the key points, main arguments, and important details
          3. Maintain the original meaning and intent while improving grammar and clarity
          4. Use proper punctuation and correct any grammatical errors from the transcript
          5. Format the summary with clear paragraph breaks (use double line breaks between paragraphs)
          6. Keep your tone neutral and informative
          7. Don't include phrases like "the transcript discusses" or "in this video"
          8. Focus on providing valuable information to someone who hasn't watched the video`
                },
                {
                    "role": "user",
                    "content": `Please summarize the following YouTube transcript:\n\n${transcript}`
                }
            ],
            temperature: 0.5,
            max_tokens: 4000,
        });

        return response.choices[0].message.content || 'Summary not available';
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        throw new Error('Failed to generate summary');
    }
} 