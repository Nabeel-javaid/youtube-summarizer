'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Reset copy state when summary changes
    setCopied(false);
  }, [summary]);

  return (
    <main className="min-h-screen bg-[#0F172A] text-gray-100 font-sans">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[#0F172A] z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 -left-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              YouTube Summarizer
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get concise, meaningful summaries of any YouTube video in seconds
          </p>
        </div>

        {/* Main card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube video URL here..."
                    className="text-gray-200 pl-12 pr-4 py-5 w-full bg-gray-700/50 border border-gray-600/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ease-in-out"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full relative inline-flex group items-center justify-center px-6 py-5 font-bold text-white rounded-xl transition-all duration-500 ease-in-out bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 overflow-hidden disabled:opacity-70"
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-in-out bg-white rounded-full group-hover:w-96 group-hover:h-96 opacity-10"></span>
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting insights...
                    </div>
                  ) : (
                    <>Summarize Video</>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-5 flex p-4 text-sm text-red-400 rounded-lg bg-red-900/30 border border-red-800/30" role="alert">
                  <svg className="flex-shrink-0 inline w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <span className="font-medium">Error:</span> {error}
                  </div>
                </div>
              )}
            </div>

            {summary && (
              <div className="border-t border-gray-700/50">
                {videoId && (
                  <div className="aspect-video w-full bg-black">
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

                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      {videoTitle && (
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{videoTitle}</h2>
                      )}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="ml-4 flex items-center space-x-2 text-sm px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 transition-all duration-300"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                          </svg>
                          <span>Copy summary</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h3 className="text-xl font-semibold mb-4 text-gray-200">Summary</h3>
                    <div className="prose prose-lg prose-invert max-w-none text-gray-300">
                      {formattedSummary}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} YouTube Summarizer. Powered by Next.js and AI.</p>
        </div>
      </div>
    </main>
  );
}
