
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from './components/Button';
import { generateAIPrompt } from './services/geminiService';
import { GeneratedPrompt, PromptStyle } from './types';

const MAX_CHARS = 500;

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>(PromptStyle.STRUCTURED);
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [topic]);

  const triggerHaptic = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Enter a topic to begin crafting.");
      return;
    }

    triggerHaptic();
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateAIPrompt(topic, selectedStyle);
      setCurrentPrompt({
        id: crypto.randomUUID(),
        topic: topic,
        content: result,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!currentPrompt) return;
    triggerHaptic();
    try {
      await navigator.clipboard.writeText(currentPrompt.content);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, [currentPrompt]);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 transition-colors duration-500">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none animate-float">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <span className="font-bold text-lg tracking-tight dark:text-white">PromptLab</span>
        </div>
        <button 
          onClick={() => { triggerHaptic(); setIsDarkMode(!isDarkMode); }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      <main className="flex-1 flex flex-col gap-6">
        {/* Input Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-zinc-800">
          <div className="mb-4 relative">
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                Main Topic
              </label>
              <span className={`text-[10px] font-bold tabular-nums ${topic.length >= MAX_CHARS ? 'text-rose-500' : 'text-slate-400 dark:text-zinc-600'}`}>
                {topic.length} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={topic}
              maxLength={MAX_CHARS}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to build a rocket in my backyard..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-400 dark:focus:border-indigo-600 outline-none transition-all text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 min-h-[120px] max-h-[300px] overflow-y-auto no-scrollbar resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">
              Architecture Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PromptStyle).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`text-[11px] font-bold py-3 px-2 rounded-xl border-2 transition-all ${
                    selectedStyle === style 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 hover:border-slate-200 dark:hover:border-zinc-700'
                  }`}
                >
                  {style.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            isLoading={isLoading}
            className="w-full !rounded-2xl py-4"
            icon={<i className="fa-solid fa-bolt-lightning"></i>}
          >
            Craft Professional Prompt
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
        </section>

        {/* Output Section */}
        {(currentPrompt || isLoading) && (
          <div className={`prompt-card relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-zinc-800 flex flex-col min-h-[300px] ${isLoading ? 'animate-pulse' : 'animate-fade-in'}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest max-w-[70%] truncate">
                {isLoading ? "Engineering..." : currentPrompt?.topic}
              </span>
              {!isLoading && (
                <button 
                  onClick={handleCopy}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCopying 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <i className={`fa-solid ${isCopying ? 'fa-check' : 'fa-copy'}`}></i>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-full w-5/6"></div>
                  <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-full w-2/3"></div>
                </div>
              ) : (
                <p className="text-sm md:text-base font-medium text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {currentPrompt?.content}
                </p>
              )}
            </div>

            {!isLoading && isCopying && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-zinc-900/90 text-white rounded-2xl text-xs font-bold backdrop-blur shadow-xl pointer-events-none animate-fade-in">
                Copied to clipboard!
              </div>
            )}
          </div>
        )}

        {/* Info Area */}
        <div className="text-center px-4 mt-auto py-6">
          <p className="text-[10px] text-slate-300 dark:text-zinc-600 font-bold uppercase tracking-[0.2em]">
            Powered by Gemini-3-Flash
          </p>
        </div>
      </main>

      {/* Decorative Blur Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-64 h-64 bg-violet-400/10 dark:bg-violet-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
};

export default App;
