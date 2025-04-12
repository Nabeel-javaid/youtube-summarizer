import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getSubtitles, Caption } from 'youtube-captions-scraper';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
        }

        // Extract video ID from URL
        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        try {
            // Fetch transcript using youtube-captions-scraper
            const captions = await getSubtitles({
                videoID: videoId,
                lang: 'en' // default to English
            });

            if (!captions || captions.length === 0) {
                return NextResponse.json({ error: 'Could not fetch transcript for this video' }, { status: 404 });
            }

            // Format transcript for better readability
            const formattedTranscript = formatTranscript(captions);

            // Get video title
            const videoTitle = await fetchVideoTitle(videoId);

            // Summarize the transcript
            const summary = await summarizeTranscript(formattedTranscript);

            return NextResponse.json({
                success: true,
                videoId,
                summary,
                transcript: formattedTranscript,
                videoTitle
            });
        } catch (captionError) {
            console.error('Error fetching captions:', captionError);
            return NextResponse.json({ error: 'Could not fetch transcript for this video' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}

function formatTranscript(captionsItems: Caption[]): string {
    // Group transcript items into sentences and paragraphs
    let transcript = '';
    let currentSentence = '';
    const paragraphs: string[] = [];

    // First pass: combine into sentences
    for (let i = 0; i < captionsItems.length; i++) {
        let text = captionsItems[i].text.trim();

        // Fix common HTML entities
        text = text.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');

        // Add space between text segments if needed
        if (currentSentence && !currentSentence.endsWith(' ') && !text.startsWith(' ')) {
            currentSentence += ' ';
        }

        currentSentence += text;

        // If this text ends with sentence-ending punctuation or it's the last item
        if (text.match(/[.!?]$/) || i === captionsItems.length - 1) {
            // Add period at the end if missing
            if (!currentSentence.match(/[.!?]$/)) {
                currentSentence += '.';
            }

            // Capitalize the first letter of the sentence if it's not already
            if (currentSentence.length > 0 && /[a-z]/.test(currentSentence[0])) {
                currentSentence = currentSentence[0].toUpperCase() + currentSentence.slice(1);
            }

            // Add to transcript
            transcript += currentSentence + ' ';

            // Reset current sentence
            currentSentence = '';

            // Create a new paragraph every 3-5 sentences
            if ((transcript.match(/[.!?]/g) || []).length >= 4) {
                paragraphs.push(transcript.trim());
                transcript = '';
            }
        }
    }

    // Add any remaining text as a paragraph
    if (transcript.trim()) {
        paragraphs.push(transcript.trim());
    }

    return paragraphs.join('\n\n');
}

async function fetchVideoTitle(videoId: string): Promise<string> {
    try {
        // Try to fetch the title directly from the YouTube page
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();

        // Extract title from HTML using regex
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1].replace(' - YouTube', '');
        }

        // Try another method (og:title meta tag)
        const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
        if (ogTitleMatch && ogTitleMatch[1]) {
            return ogTitleMatch[1];
        }

        return 'YouTube Video';
    } catch (error) {
        console.error('Error fetching video title:', error);
        return 'YouTube Video';
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