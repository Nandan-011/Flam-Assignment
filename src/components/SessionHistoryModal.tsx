import React from 'react';
import { SavedSession } from '../types';
import { History, X, Trash2, Download, ExternalLink, Calendar } from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onClearSessions: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onLoadSession,
  onClearSessions,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flam_ai_sessions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF3B30]" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#FF3B30] font-mono font-bold text-xs uppercase tracking-widest">
            <History className="h-5 w-5" />
            Saved Sessions & History ({sessions.length})
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-xs font-mono space-y-2">
            <p className="uppercase tracking-widest">[NO SAVED SESSIONS FOUND]</p>
            <p className="text-[11px] font-sans">Sessions are auto-persisted to local storage when tools generate.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-xl border border-white/10 bg-black/60 hover:border-[#FF3B30] flex items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40">
                      {sess.mode}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-medium text-white/90 truncate font-sans">
                    {sess.prompt}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onLoadSession(sess);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF3B30] hover:bg-[#e03126] text-white font-mono font-bold uppercase text-xs shrink-0 flex items-center gap-1 shadow-md shadow-[#FF3B30]/20"
                >
                  <span>LOAD</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          {sessions.length > 0 && (
            <button
              onClick={onClearSessions}
              className="text-[#FF3B30] font-mono uppercase tracking-wider font-bold hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          )}

          {sessions.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono uppercase tracking-wider text-xs font-bold flex items-center gap-1.5 border border-white/10"
            >
              <Download className="h-3.5 w-3.5 text-[#FF3B30]" /> Export JSON
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
