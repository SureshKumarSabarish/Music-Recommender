import { useState, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecommendationCard } from './components/RecommendationCard';
import { SettingsModal } from './components/SettingsModal';
import { SpotifyTrack, CurationData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Loader2, Sparkles, Disc3, Settings } from 'lucide-react';

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [curationData, setCurationData] = useState<CurationData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayToggle = (url: string) => {
    if (playingUrl === url) {
       audioRef.current?.pause();
       setPlayingUrl(null);
    } else {
       if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setPlayingUrl(url);
       }
    }
  };

  const handleSelectTrack = async (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setIsAnalyzing(true);
    setError(null);
    setCurationData(null);
    audioRef.current?.pause();
    setPlayingUrl(null);

    try {
      const geminiKey = localStorage.getItem('gemini_api_key') || '';
      const spotifyClientId = localStorage.getItem('spotify_client_id') || '';
      const spotifyClientSecret = localStorage.getItem('spotify_client_secret') || '';

      if (!geminiKey || !spotifyClientId || !spotifyClientSecret) {
         setError('Please configure your Gemini and Spotify API keys in Settings first.');
         setIsSettingsOpen(true);
         setIsAnalyzing(false);
         return;
      }

      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': geminiKey,
          'x-spotify-client-id': spotifyClientId,
          'x-spotify-client-secret': spotifyClientSecret
        },
        body: JSON.stringify({ title: track.title, artist: track.artist })
      });

      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || 'Failed to analyze track');
      }

      setCurationData(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900 pb-20 relative overflow-hidden">
      
      {/* Creative Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Bright background pattern */}
         <div 
           className="absolute inset-0 opacity-[0.3]"
           style={{
             backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
         />
         
         {/* Floating Fun Orbs */}
         <motion.div 
           animate={{ 
             y: [0, -40, 0],
             x: [0, 30, 0],
             scale: [1, 1.2, 1],
             opacity: [0.4, 0.7, 0.4]
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-pink-400/20 blur-[100px]" 
         />
         <motion.div 
           animate={{ 
             y: [0, 50, 0],
             x: [0, -40, 0],
             scale: [1, 1.5, 1],
             opacity: [0.3, 0.6, 0.3]
           }}
           transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-amber-300/20 blur-[120px]" 
         />
         <motion.div 
           animate={{ 
             y: [0, 20, 0],
             scale: [1, 1.1, 1],
             opacity: [0.4, 0.7, 0.4]
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
           className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[90px]" 
         />
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />

      {/* Settings Button */}
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-white/80 border border-pink-200 text-pink-500 rounded-full hover:bg-pink-50 shadow-md transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Header / Hero */}
      <div className="pt-20 pb-12 px-6 flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-16 h-16 bg-white border border-pink-200 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-200 mb-6 text-pink-500 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Music2 className="w-8 h-8 relative z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500"
        >
          Sonic Architect
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-slate-600 max-w-xl text-lg mb-10"
        >
          Discover music through deep sonic reasoning. Search for a seed track, and our musicologist engine will deconstruct its DNA.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full relative z-30"
        >
          <SearchBar onSelect={handleSelectTrack} disabled={isAnalyzing} />
        </motion.div>
      </div>

      <main className="max-w-7xl mx-auto px-6 z-10 relative">
        <AnimatePresence mode="wait">
          {error && (
             <motion.div 
               key="error"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="max-w-2xl mx-auto p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-center text-sm backdrop-blur-md"
             >
               {error}
             </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-8"
            >
               <div className="flex items-center justify-center gap-1.5 h-12">
                 {[0, 1, 2, 3, 4].map((i) => (
                   <motion.div
                     key={i}
                     animate={{ height: ["20%", "100%", "20%"] }}
                     transition={{
                       duration: 0.8,
                       repeat: Infinity,
                       ease: "easeInOut",
                       delay: i * 0.15
                     }}
                     className="w-1.5 bg-indigo-500 rounded-full opacity-80"
                   />
                 ))}
               </div>
               <div className="flex flex-col items-center">
                 <p className="text-lg font-medium text-slate-200">Analyzing sonic profile...</p>
                 <motion.p 
                   animate={{ opacity: [0.5, 1, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="text-sm mt-2 text-indigo-400/80"
                 >
                   Deconstructing emotional dissonance and rhythm velocity.
                 </motion.p>
               </div>
            </motion.div>
          )}

          {curationData && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", staggerChildren: 0.1 }}
              className="space-y-16 mt-8"
            >
              
              {/* Analysis Section */}
              <div className="bg-white/80 border border-pink-100 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-xl shadow-pink-100">
                <div className="absolute top-0 right-0 p-8 text-pink-100 rotate-12 scale-150">
                  <Disc3 className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    <h2 className="text-sm font-semibold tracking-widest uppercase text-pink-500">Track Architecture</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-1 text-slate-900">{curationData.source_track_analysis.title}</h3>
                      <p className="text-slate-500 mb-6">{curationData.source_track_analysis.artist}</p>
                      
                      {selectedTrack && (
                        <div className="mb-6 relative z-50">
                          <iframe
                            src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            className="rounded-xl shadow-lg"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Identified Mood</span>
                          <span className="text-slate-800">{curationData.source_track_analysis.identified_mood}</span>
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">BPM & Rhythm</span>
                          <span className="text-slate-800">{curationData.source_track_analysis.bpm_and_rhythm}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Micro-Genres</span>
                        <div className="flex flex-wrap gap-2">
                          {curationData.source_track_analysis.micro_genres.map((g, i) => (
                            <span key={i} className="px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs text-pink-700">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Sonic Elements</span>
                        <ul className="space-y-1">
                          {curationData.source_track_analysis.key_sonic_elements.map((el, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-pink-400 mt-0.5">•</span>
                              <span>{el}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {curationData.source_track_analysis.structural_notes && (
                         <div className="pt-2">
                           <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Structural Anomalies</span>
                           <p className="text-sm text-slate-700 italic">"{curationData.source_track_analysis.structural_notes}"</p>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Mood */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-pink-100">
                    <h3 className="text-lg font-medium text-slate-800">The Vibe</h3>
                  </div>
                  <div className="space-y-4">
                    {curationData.mood_matches.map((match, i) => (
                      <RecommendationCard
                        key={`mood-${i}`}
                        index={i}
                        title={match.title}
                        artist={match.artist}
                        match_rationale={match.match_rationale}
                        spotifyId={match.spotifyId}
                        previewUrl={match.previewUrl}
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                      />
                    ))}
                  </div>
                </div>

                {/* Column 2: Genre */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-pink-100">
                    <h3 className="text-lg font-medium text-slate-800">The Sound</h3>
                  </div>
                  <div className="space-y-4">
                    {curationData.genre_matches.map((match, i) => (
                      <RecommendationCard
                        key={`genre-${i}`}
                        index={i}
                        title={match.title}
                        artist={match.artist}
                        match_rationale={match.match_rationale}
                        spotifyId={match.spotifyId}
                        previewUrl={match.previewUrl}
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                        badge={match.subgenre}
                      />
                    ))}
                  </div>
                </div>

                {/* Column 3: Artist Orbit */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-pink-100">
                    <h3 className="text-lg font-medium text-slate-800">The Orbit</h3>
                  </div>
                  <div className="space-y-4">
                    {curationData.artist_universe_matches.map((match, i) => (
                      <RecommendationCard
                        key={`orbit-${i}`}
                        index={i}
                        title={match.title}
                        artist={match.artist}
                        match_rationale={match.match_rationale}
                        spotifyId={match.spotifyId}
                        previewUrl={match.previewUrl}
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                        badge={match.connection_type}
                      />
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
