'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setVideoTitle('');
    setVideoId('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize video');
      }

      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
        if (data.title) setVideoTitle(data.title);
        if (data.videoId) setVideoId(data.videoId);
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Format summary with paragraphs
  const formattedSummary = summary
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          YouTube Video Summarizer
        </h1>

        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium mb-2 text-gray-300">
                YouTube Video URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md disabled:bg-blue-800 disabled:opacity-70 min-w-[140px] transition-all font-medium"
                >
                  {loading ?
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Summarizing...
                    </span> :
                    'Summarize Video'
                  }
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-4 border-l-4 border-red-500 bg-red-900/30 rounded mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {summary && (
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {videoId && (
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
                </iframe>
              </div>
            )}

            <div className="p-6">
              {videoTitle && (
                <h2 className="text-2xl font-bold mb-6 text-blue-400">{videoTitle}</h2>
              )}

              <h3 className="text-xl font-semibold mb-4 text-gray-300">Summary</h3>
              <div className="prose prose-lg prose-invert max-w-none">
                {formattedSummary}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
