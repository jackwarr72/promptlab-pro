
import React from 'react';
import { GeneratedPrompt } from '../types';

interface HistoryItemProps {
  item: GeneratedPrompt;
  onSelect: (item: GeneratedPrompt) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelect, onDelete }) => {
  return (
    <div className="group relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
      <div onClick={() => onSelect(item)} className="flex-1 min-w-0 pr-8">
        <h4 className="text-sm font-semibold text-slate-800 truncate mb-1">{item.topic}</h4>
        <p className="text-xs text-slate-400">
          {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
      >
        <i className="fa-solid fa-trash-can text-sm"></i>
      </button>
    </div>
  );
};

export default HistoryItem;
