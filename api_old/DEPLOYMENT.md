# Deployment Guide for YouTube Summarizer API

This guide provides instructions for deploying the Python components of the YouTube Summarizer, specifically addressing common issues with dependencies like `sentencepiece`.

## Available Summarizers

The project includes two summarizer options:

1. **Simple Summarizer** (`simple_summarizer.py`): Uses basic NLP techniques without heavy ML dependencies.
2. **Advanced Summarizer** (`youtube_summarizer.py`): Uses transformer models for better quality summaries but requires additional dependencies.

## Installation Options

### Option 1: Simple Installation (Recommended for most deployments)

If you're facing issues with the transformer models or sentencepiece, use the simple summarizer:

```bash
pip install -r api/requirements-simple.txt
```

Then update your API to use `simple_summarizer.py` instead of `youtube_summarizer.py`.

### Option 2: Full Installation with Pre-built Wheels

If you need the advanced summarizer with transformers:

```bash
pip install -r api/requirements.txt
```

### Troubleshooting sentencepiece Installation

If you encounter errors building `sentencepiece` like:

```
subprocess.CalledProcessError: Command '['./build_bundled.sh', '0.1.99']' returned non-zero exit status 127.
```

Try these solutions:

#### Solution 1: Install system dependencies

```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential cmake

# On CentOS/RHEL
sudo yum install -y gcc gcc-c++ make cmake
```

#### Solution 2: Use conda environment

```bash
conda create -n youtube-summarizer python=3.9
conda activate youtube-summarizer
conda install -c conda-forge sentencepiece
pip install -r api/requirements.txt
```

#### Solution 3: Use a pre-built wheel

On some platforms, you can install a pre-built wheel:

```bash
pip install --only-binary=:all: sentencepiece
```

## Deploying on Various Platforms

### Vercel

When deploying on Vercel, add this to your `vercel.json`:

```json
{
  "buildCommand": "pip install -r api/requirements-simple.txt && npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Other Platforms

For other platforms, consider using Docker to ensure consistent dependencies:

```dockerfile
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y python3 python3-pip
WORKDIR /app
COPY . .
RUN pip install -r api/requirements-simple.txt
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]
```

## Testing Your Installation

To test if the Python component works correctly:

```bash
# For the simple summarizer
npm run test-summarizer

# For the advanced summarizer
npm run test-advanced-summarizer
``` 