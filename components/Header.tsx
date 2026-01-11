
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-100 mb-4 animate-bounce-subtle">
        <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        PromptLab <span className="text-indigo-600">Pro</span>
      </h1>
      <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
        Elevate your AI interactions with structured, high-performance prompts.
      </p>
    </header>
  );
};

export default Header;
