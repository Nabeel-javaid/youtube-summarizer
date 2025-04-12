#!/bin/bash

echo "Checking Python installation..."

if command -v python &>/dev/null; then
    PYTHON_CMD="python"
    echo "Found Python: $(python --version 2>&1)"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
    echo "Found Python: $(python3 --version 2>&1)"
else
    echo "Error: Python is not installed or not in PATH"
    exit 1
fi

echo "Checking Python dependencies..."
$PYTHON_CMD -c "
try:
    import youtube_transcript_api
    import transformers
    print('All required Python packages are installed')
except ImportError as e:
    print(f'Error: Missing required packages: {e}')
    print('Please run: pip install -r api/requirements.txt')
    exit(1)
"

echo "Python environment is ready." 