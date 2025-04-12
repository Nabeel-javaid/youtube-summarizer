'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setTranscript('');
    setVideoTitle('');
    setVideoId('');
    setActiveTab('summary');

    // Basic URL validation before sending to server
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube URL');
      setLoading(false);
      return;
    }

    try {
      // Get base URL to ensure correct API endpoint in both development and production
      const baseUrl = window.location.origin;
      const apiEndpoint = `${baseUrl}/api/summarize`;

      console.log(`Sending request to: ${apiEndpoint}`);

      // First check if the API is available
      try {
        const healthCheck = await fetch(`${baseUrl}/api/summarize`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (!healthCheck.ok) {
          console.error(`API health check failed: ${healthCheck.status}`);
        } else {
          console.log('API health check passed');
        }
      } catch (healthError) {
        console.error('API health check error:', healthError);
      }

      // Now make the actual request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store',
        body: JSON.stringify({ url }),
      });

      console.log(`Response status: ${response.status}`);

      // For non-JSON responses, handle separately
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        const textResponse = await response.text();
        console.error('Response body:', textResponse.substring(0, 200) + '...');
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Failed to parse API response. The server might be experiencing issues.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`);
      }

      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary || 'Summary not available');
        if (data.transcript) setTranscript(data.transcript);
        if (data.videoTitle) setVideoTitle(data.videoTitle);
        if (data.videoId) setVideoId(data.videoId);
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error occurred'));
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format summary with paragraphs
  const formattedSummary = summary
    .split('\n\n')
    .map((paragraph, index) => (
      <motion.p
        key={index}
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {paragraph}
      </motion.p>
    ));

  // Format transcript with paragraphs
  const formattedTranscript = transcript
    .split('\n\n')
    .map((paragraph, index) => (
      <motion.p
        key={index}
        className="mb-6 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        {paragraph}
      </motion.p>
    ));

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Reset copy state when summary/transcript changes
    setCopied(false);
  }, [summary, transcript]);

  // Don't render animations until hydration is complete
  if (!isHydrated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-gray-100 font-sans">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[#0F172A] z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 -left-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
              YouTube Summarizer
            </span>
          </h1>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Get concise, meaningful summaries of any YouTube video in seconds
            <motion.span
              className="ml-2 inline-flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <span className="text-xs text-gray-500 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 px-2 py-0.5 rounded-sm border-l border-purple-500/20">ai</span>
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-purple-500/10">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <svg className="w-5 h-5 text-purple-500 group-focus-within:text-cyan-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-focus-within:opacity-30"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  ></motion.div>
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube video URL here..."
                    className="relative text-gray-200 pl-12 pr-4 py-5 w-full bg-gray-700/50 border border-gray-600/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ease-in-out"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full relative inline-flex group items-center justify-center px-6 py-5 font-bold text-white rounded-xl transition-all duration-500 ease-in-out bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 overflow-hidden disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-400/20 via-transparent to-transparent skew-x-[-20deg] transform -translate-x-full group-hover:translate-x-[200%] transition-all duration-1000"></span>
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
                </motion.button>
              </form>

              {error && (
                <motion.div
                  className="mt-5 flex p-4 text-sm text-red-400 rounded-lg bg-red-900/30 border border-red-800/30"
                  role="alert"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <svg className="flex-shrink-0 inline w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <span className="font-medium">Error:</span> {error}
                  </div>
                </motion.div>
              )}
            </div>

            {summary && (
              <motion.div
                className="border-t border-gray-700/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {videoId && (
                  <div className="aspect-video w-full bg-black relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                    <iframe
                      className="w-full h-full relative z-10"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen>
                    </iframe>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex-1">
                      {videoTitle && (
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{videoTitle}</h2>
                      )}
                    </div>
                  </motion.div>

                  {/* Tabs for Summary and Transcript */}
                  <motion.div
                    className="flex border-b border-gray-700/50 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`px-4 py-3 font-medium text-sm transition-all duration-300 ${activeTab === 'summary'
                        ? 'text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                      AI Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`px-4 py-3 font-medium text-sm transition-all duration-300 ${activeTab === 'transcript'
                        ? 'text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                      Full Transcript
                    </button>

                    <div className="flex-1"></div>

                    <motion.button
                      onClick={() => copyToClipboard(activeTab === 'summary' ? summary : transcript)}
                      className="ml-4 flex items-center space-x-2 text-sm px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                        >
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copied!</span>
                        </motion.div>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                          </svg>
                          <span>Copy {activeTab === 'summary' ? 'summary' : 'transcript'}</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {activeTab === 'summary' ? (
                    <motion.div
                      className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      key="summary-tab"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 opacity-60"></div>
                      <div className="absolute -right-40 -bottom-32 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.03] animate-pulse"></div>

                      <h3 className="text-xl font-semibold mb-6 text-gray-200 relative">
                        <span className="inline-block relative">
                          AI-Enhanced Summary
                          <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-purple-500 to-transparent"></span>
                        </span>
                      </h3>
                      <div className="prose prose-lg prose-invert max-w-none text-gray-300 relative z-10">
                        {formattedSummary}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      key="transcript-tab"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-indigo-500/5 opacity-60"></div>
                      <div className="absolute -left-40 -bottom-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.03] animate-pulse"></div>

                      <h3 className="text-xl font-semibold mb-6 text-gray-200 relative">
                        <span className="inline-block relative">
                          Full Transcript
                          <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-blue-500 to-transparent"></span>
                        </span>
                      </h3>
                      <div className="prose prose-lg prose-invert max-w-none text-gray-300 relative z-10 max-h-[600px] overflow-y-auto pr-4">
                        {formattedTranscript}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p>© {new Date().getFullYear()} YouTube Summarizer. <span className="inline-flex items-center px-1 py-0.5 text-xs text-gray-400"><svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0001 2.99988C16.9407 2.99988 21.0001 7.05931 21.0001 11.9999C21.0001 16.9405 16.9407 20.9999 12.0001 20.9999C7.05961 20.9999 3.00018 16.9405 3.00018 11.9999C3.00018 7.05931 7.05961 2.99988 12.0001 2.99988Z" stroke="currentColor" strokeWidth="1.5"></path><path d="M9 9.5V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V9.5C15 10.6046 14.1046 11.5 13 11.5H11C9.89543 11.5 9 12.3954 9 13.5V14C9 15.1046 9.89543 16 11 16H13C14.1046 16 15 15.1046 15 14V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>Enhanced with AI</span></p>
        </motion.div>
      </div>
    </main>
  );
}
