#!/bin/bash

echo "Installing Python dependencies..."

if command -v python &>/dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
else
    echo "Error: Python is not installed or not in PATH"
    exit 1
fi

echo "Using $PYTHON_CMD ($(${PYTHON_CMD} --version 2>&1))"
echo "Using $PIP_CMD ($(${PIP_CMD} --version))"

echo "Installing dependencies..."
$PIP_CMD install -r api/requirements.txt

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully!"
    
    # Verify imports work
    $PYTHON_CMD -c "
try:
    import numpy
    print(f'NumPy version: {numpy.__version__}')
    
    import torch
    print(f'PyTorch version: {torch.__version__}')
    
    import transformers
    print(f'Transformers version: {transformers.__version__}')
    
    import youtube_transcript_api
    print(f'YouTube Transcript API version: {youtube_transcript_api.__version__}')
    
    print('All packages imported successfully!')
except Exception as e:
    print(f'Error: {e}')
    exit(1)
"
else
    echo "Error installing dependencies. Please check error messages above."
    exit 1
fi 