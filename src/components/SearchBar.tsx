import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Play, Square, AudioWaveform } from 'lucide-react';
import { SpotifyTrack } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SearchBarProps {
  onSelect: (track: SpotifyTrack) => void;
  disabled?: boolean;
}

const VIBE_CHIPS = ["Late-Night Melancholy", "Psychedelic Beat Switch", "Golden-Hour Soul"];

export function SearchBar({ onSelect, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok) {
          setResults(data);
          setIsOpen(true);
        } else {
          setError(data.error || 'Failed to search');
          setIsOpen(true);
          setResults([]);
        }
      } catch (e: any) {
        console.error('Search failed', e);
        setError(e.message || 'Network error');
        setIsOpen(true);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />
      
      <div className="relative flex items-center z-20">
        <div className="absolute left-4 text-zinc-500 z-10 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : query.length > 0 ? (
            <AudioWaveform className="w-4 h-4 text-zinc-400 animate-pulse" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Enter a seed track or vibe..."
          className="w-full bg-transparent border-b border-slate-300 text-slate-900 py-4 pl-12 pr-6 focus:outline-none focus:border-slate-800 transition-colors placeholder:text-slate-400 text-lg disabled:opacity-50 font-sans tracking-tight"
        />
      </div>

      {/* Vibe Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {VIBE_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setQuery(chip)}
            disabled={disabled}
            className="px-3 py-1.5 rounded bg-transparent border border-slate-200 text-[11px] font-mono tracking-wider uppercase text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || error) && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-[4.5rem] left-0 right-0 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xl z-50 p-1"
          >
            {error ? (
              <div className="p-4 text-slate-500 text-sm text-center">
                {error}
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {results.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      audioRef.current?.pause();
                      setPlayingUrl(null);
                      onSelect(track);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center gap-4 p-2 hover:bg-slate-50 transition-colors text-left rounded-md group"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {track.albumArt ? (
                        <img src={track.albumArt} alt="" className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-md border border-slate-200" />
                      )}
                      {track.previewUrl && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (playingUrl === track.previewUrl) {
                              audioRef.current?.pause();
                              setPlayingUrl(null);
                            } else {
                              if (audioRef.current && track.previewUrl) {
                                audioRef.current.src = track.previewUrl;
                                audioRef.current.play();
                                setPlayingUrl(track.previewUrl);
                              }
                            }
                          }}
                          className={`absolute inset-0 flex items-center justify-center rounded-md bg-black/60 transition-opacity ${playingUrl === track.previewUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                           {playingUrl === track.previewUrl ? <Square className="w-4 h-4 text-zinc-200" /> : <Play className="w-4 h-4 text-zinc-200 ml-0.5" />}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <div className="text-slate-900 font-medium text-sm truncate">{track.title}</div>
                      <div className="text-slate-500 text-xs truncate">{track.artist}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
