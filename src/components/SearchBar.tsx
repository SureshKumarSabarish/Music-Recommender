import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Play, Square } from 'lucide-react';
import { SpotifyTrack } from '../types';
import { getCredentials } from '../lib/credentials';

interface SearchBarProps {
  onSelect: (track: SpotifyTrack) => void;
  disabled?: boolean;
  openSettings: () => void;
}

export function SearchBar({ onSelect, disabled, openSettings }: SearchBarProps) {
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
        const { spotifyClientId, spotifyClientSecret } = getCredentials();

        if (!spotifyClientId || !spotifyClientSecret) {
           setError('Please configure your Spotify credentials in Settings.');
           setIsOpen(true);
           setResults([]);
           setIsLoading(false);
           openSettings();
           return;
        }

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'x-spotify-client-id': spotifyClientId,
            'x-spotify-client-secret': spotifyClientSecret
          }
        });
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
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />
      
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 group-focus-within:text-pink-400 transition-colors">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Search for a seed track..."
          className="w-full bg-white/80 border border-pink-200 text-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all placeholder-slate-400 text-lg shadow-xl shadow-pink-100/50 backdrop-blur-sm disabled:opacity-50"
        />
      </div>

      {isOpen && (results.length > 0 || error) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 border border-pink-100 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md z-50">
          {error ? (
            <div className="p-4 text-red-500 text-sm text-center bg-red-50">
              {error}
            </div>
          ) : (
            results.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  audioRef.current?.pause();
                  setPlayingUrl(null);
                  onSelect(track);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full flex items-center gap-4 p-3 hover:bg-rose-50 transition-colors text-left border-b border-rose-100 last:border-0 group"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  {track.albumArt ? (
                    <img src={track.albumArt} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-rose-100 rounded shadow-sm" />
                  )}
                  {track.previewUrl && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playingUrl === track.previewUrl) {
                          audioRef.current?.pause();
                          setPlayingUrl(null);
                        } else {
                          if (audioRef.current) {
                            audioRef.current.src = track.previewUrl;
                            audioRef.current.play();
                            setPlayingUrl(track.previewUrl);
                          }
                        }
                      }}
                      className={`absolute inset-0 flex items-center justify-center rounded bg-black/40 backdrop-blur-sm transition-opacity ${playingUrl === track.previewUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                       {playingUrl === track.previewUrl ? <Square className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                    </div>
                  )}
                </div>
                <div className="flex-col overflow-hidden">
                  <div className="text-slate-800 font-medium truncate">{track.title}</div>
                  <div className="text-slate-500 text-sm truncate">{track.artist}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
