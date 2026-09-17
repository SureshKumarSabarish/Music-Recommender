import { Play, Square, ExternalLink, AudioWaveform } from 'lucide-react';
import { SpotifyTrack, SourceTrackAnalysis } from '../types';

interface Props {
  track: SpotifyTrack;
  analysis: SourceTrackAnalysis;
  playingUrl: string | null;
  onPlayToggle: (url: string) => void;
}

export function TrackHeroVinyl({ track, analysis, playingUrl, onPlayToggle }: Props) {
  const isPlaying = playingUrl === track.previewUrl && !!track.previewUrl;
  const coverUrl = track.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
      <div className="relative w-56 h-56 flex-shrink-0 group cursor-pointer mx-auto md:mx-0" onClick={() => track.previewUrl && onPlayToggle(track.previewUrl)}>
        <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-700 ${isPlaying ? 'bg-fuchsia-500/50 scale-110' : 'bg-indigo-500/30 group-hover:bg-fuchsia-500/40'}`} />
        
        <div className="relative w-full h-full rounded-full bg-slate-950 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center overflow-hidden animate-[spin_8s_linear_infinite]">
          <div className="absolute inset-[10%] rounded-full border border-white/5" />
          <div className="absolute inset-[25%] rounded-full border border-white/10" />
          <div className="absolute inset-[40%] rounded-full border border-white/5" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none mix-blend-screen" />
          <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-inner border border-white/10">
            <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute w-4 h-4 bg-slate-950 rounded-full border border-white/20 z-10 shadow-inner" />
        </div>

        {isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="absolute w-24 h-24 rounded-full border-2 border-fuchsia-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute w-28 h-28 rounded-full border border-indigo-500/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        )}

        {track.previewUrl && (
          <div className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className={`bg-black/60 backdrop-blur-md rounded-full p-4 border border-white/10 shadow-2xl transition-transform ${isPlaying ? 'scale-100' : 'scale-95 group-hover:scale-100'}`}>
              {isPlaying ? (
                <div className="relative flex items-center justify-center">
                  <Square className="w-8 h-8 text-fuchsia-400" />
                  <AudioWaveform className="absolute w-12 h-12 text-fuchsia-400/30 animate-pulse -z-10" />
                </div>
              ) : (
                <Play className="w-8 h-8 text-fuchsia-400 ml-1" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col text-center md:text-left justify-center py-4 flex-grow w-full min-w-0">
        <h3 className="text-3xl md:text-5xl font-black mb-3 text-slate-900 leading-tight drop-shadow-sm break-words">{track.title}</h3>
        <p className="text-slate-600 text-xl mb-6 font-medium tracking-wide break-words">{track.artist}</p>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-slate-100 text-slate-700 border border-slate-200 backdrop-blur-md shadow-sm">
            {analysis.bpm_and_rhythm}
          </span>
        </div>
        <a href={`https://open.spotify.com/track/${track.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-full transition-all duration-300 w-max mx-auto md:mx-0 text-sm border border-slate-800 hover:border-black shadow-md hover:shadow-lg" onClick={(e) => e.stopPropagation()}>
          <ExternalLink className="w-4 h-4" />
          Open in Spotify
        </a>
      </div>
    </div>
  );
}
