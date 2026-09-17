import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Square, Heart } from 'lucide-react';

interface VinylCardProps {
  title: string;
  artist: string;
  match_rationale: string;
  spotifyId?: string;
  previewUrl?: string;
  badge?: string;
  playingUrl?: string | null;
  onPlayToggle?: (url: string) => void;
  index?: number;
  albumArt?: string;
}

function ReactionParticles({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0, 
            scale: Math.random() * 1.5 + 0.5,
            x: (Math.random() - 0.5) * 100, 
            y: -Math.random() * 100 - 50,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 text-fuchsia-400"
        >
          {i % 2 === 0 ? '✨' : '🎵'}
        </motion.div>
      ))}
    </div>
  );
}

export function VinylCard({ title, artist, match_rationale, spotifyId, previewUrl, badge, playingUrl, onPlayToggle, index = 0, albumArt }: VinylCardProps) {
  const [liked, setLiked] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isPlaying = playingUrl === previewUrl && !!previewUrl;

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
  };

  const coverUrl = albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15, type: 'spring', bounce: 0.4 }}
      className="relative w-full max-w-sm mx-auto group perspective cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Vinyl Disc */}
      <div className={`absolute top-4 right-4 bottom-4 w-[calc(100%-2rem)] rounded-full bg-black shadow-2xl shadow-black/80 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 flex items-center justify-center ${isExpanded ? 'translate-x-[25%] md:translate-x-[45%] rotate-[30deg]' : 'group-hover:translate-x-[25%] md:group-hover:translate-x-[45%] group-hover:rotate-[30deg]'}`}>
        <div className="absolute inset-2 rounded-full border border-white/10" />
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute inset-10 rounded-full border border-white/5" />
        <div className="absolute inset-14 rounded-full border border-white/10" />
        <div className={`w-1/3 h-1/3 rounded-full relative overflow-hidden ${isExpanded ? 'animate-[spin_4s_linear_infinite_reverse]' : 'group-hover:animate-[spin_4s_linear_infinite_reverse]'}`}>
          <img src={coverUrl} alt="Album Art" className="w-full h-full object-cover opacity-80" />
        </div>
        <div className="absolute w-3 h-3 bg-[#07080F] rounded-full border border-white/20 z-10" />
      </div>

      {/* Sleeve Overlay */}
      <div className="relative z-10 w-full aspect-square bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden group-hover:border-slate-300 transition-colors">
        <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <img src={coverUrl} alt="" className="w-full h-full object-cover blur-3xl saturate-200" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white" />
        </div>

        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
             {badge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  {badge}
                </span>
             )}
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }} 
                className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
             >
                <ReactionParticles active={showParticles} />
                <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
             </button>
          </div>

          <div className="flex-grow flex flex-col justify-center">
            {spotifyId ? (
              <div className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                <iframe src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" className="w-full" />
              </div>
            ) : (
              <div className="w-full h-[80px] bg-slate-50 rounded-xl border border-slate-200 flex items-center p-3 relative overflow-hidden group/preview">
                 <img src={coverUrl} className="w-14 h-14 rounded object-cover mr-4 border border-slate-200" />
                 <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-900 truncate text-sm">{title}</span>
                    <span className="text-xs text-slate-500 truncate">{artist}</span>
                 </div>
                 {previewUrl && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayToggle?.(previewUrl);
                      }} 
                      className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover/preview:opacity-100'}`}
                    >
                       {isPlaying ? <Square className="w-8 h-8 text-fuchsia-400" /> : <Play className="w-8 h-8 text-fuchsia-400 ml-1" />}
                    </div>
                 )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 truncate mb-1">{title}</h3>
            <p className="text-sm text-slate-600 truncate mb-2">{artist}</p>
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{match_rationale}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
