import { motion } from 'motion/react';
import { Play, Square } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  artist: string;
  match_rationale: string;
  spotifyId?: string;
  previewUrl?: string;
  badge?: string;
  playingUrl?: string | null;
  onPlayToggle?: (url: string) => void;
  index?: number;
}

export function RecommendationCard({ title, artist, match_rationale, spotifyId, previewUrl, badge, playingUrl, onPlayToggle, index = 0 }: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col bg-white/70 border border-pink-100 rounded-2xl overflow-hidden backdrop-blur-md hover:bg-white hover:border-pink-200 hover:shadow-xl hover:shadow-pink-200/40 transition-all"
    >
      <div className="p-4 flex-shrink-0">
        {spotifyId ? (
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-xl shadow-md"
          />
        ) : (
          <div className="w-full h-[152px] bg-pink-50/50 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-pink-100 p-4 text-center shadow-inner relative overflow-hidden group">
            <span className="font-medium text-slate-700 mb-1">{title}</span>
            <span className="text-sm">{artist}</span>
            {previewUrl ? (
                <>
                   <span className="text-xs mt-2 text-pink-500">Audio Preview Available</span>
                   <div 
                      onClick={() => onPlayToggle?.(previewUrl)}
                      className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity cursor-pointer ${playingUrl === previewUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                   >
                       {playingUrl === previewUrl ? <Square className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                   </div>
                </>
            ) : (
                <span className="text-xs mt-2 opacity-50">Preview Unavailable</span>
            )}
          </div>
        )}
      </div>
      
      <div className="px-5 pb-5 flex-grow flex flex-col">
        {badge && (
          <div className="mb-3">
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200 shadow-sm">
               {badge}
             </span>
          </div>
        )}
        <p className="text-slate-600 text-sm leading-relaxed border-t border-pink-100 pt-4 mt-auto">
          {match_rationale}
        </p>
      </div>
    </motion.div>
  );
}
