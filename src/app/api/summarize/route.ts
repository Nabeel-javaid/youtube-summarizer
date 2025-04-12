import { NextRequest, NextResponse } from 'next/server';
import { exec, ExecException } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

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

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'YouTube URL is required' },
                { status: 400 }
            );
        }

        // Find the Python command
        const pythonCommand = await findPythonCommand();
        if (!pythonCommand) {
            console.error('Python is not installed or not in PATH');
            return NextResponse.json(
                { error: 'Server configuration error: Python is not available' },
                { status: 500 }
            );
        }

        // Construct full path to script
        const apiDir = getApiDirectory();
        const scriptPath = path.join(apiDir, 'simple_summarizer.py');
        const backupScriptPath = path.join(apiDir, 'youtube_summarizer.py');

        // Verify script exists
        if (!fs.existsSync(scriptPath) && !fs.existsSync(backupScriptPath)) {
            console.error(`Scripts not found at paths: ${scriptPath} or ${backupScriptPath}`);
            return NextResponse.json(
                { error: 'Server configuration error: Script not found' },
                { status: 500 }
            );
        }

        // Use the available script
        const scriptToUse = fs.existsSync(scriptPath) ? scriptPath : backupScriptPath;
        console.log(`Using Python script: ${scriptToUse}`);

        console.log(`Executing Python script: ${pythonCommand} ${scriptToUse} "${url}"`);

        // Add a timeout of 60 seconds
        const timeoutMs = 60000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Execute the Python script
            const { stdout, stderr } = await execAsync(`${pythonCommand} ${scriptToUse} "${url}"`, {
                maxBuffer: 1024 * 1024, // Increase buffer size to 1MB
            });

            clearTimeout(timeoutId);

            if (stderr) {
                console.log('Python script debug logs:', stderr);
            }

            // Try to parse the JSON output
            try {
                const result = JSON.parse(stdout);
                return NextResponse.json(result);
            } catch (parseError) {
                console.error('Failed to parse Python output as JSON:', parseError);
                console.error('Raw output:', stdout);
                return NextResponse.json(
                    { error: 'Invalid response from summarization script' },
                    { status: 500 }
                );
            }
        } catch (error) {
            clearTimeout(timeoutId);

            const execError = error as ExecException & { stderr?: string };

            if (execError.name === 'AbortError') {
                console.error('Python script execution timed out after 60 seconds');
                return NextResponse.json(
                    { error: 'Summarization took too long and timed out' },
                    { status: 504 }
                );
            }

            console.error('Python script execution error:', execError);
            console.error('Stderr:', execError.stderr);

            return NextResponse.json(
                { error: 'Error running summarization script: ' + (execError.stderr || execError.message) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to summarize the video: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
} 