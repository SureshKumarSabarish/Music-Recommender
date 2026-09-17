import { useState, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { VinylCard } from './components/VinylCard';
import { TrackHeroVinyl } from './components/TrackHeroVinyl';
import { InteractiveBackground } from './components/InteractiveBackground';
import { SpotifyTrack, CurationData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [curationData, setCurationData] = useState<CurationData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900 pb-24 relative overflow-x-hidden">
      
      <InteractiveBackground />
      
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />

      {/* Header / Hero */}
      <div className="pt-20 pb-16 px-6 flex flex-col items-center text-center relative z-10 max-w-3xl mx-auto">
        <motion.h1 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900"
        >
          SonicTech
        </motion.h1>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-slate-500 text-base md:text-lg mb-10 max-w-xl tracking-tight"
        >
          Discover music through structured sonic reasoning. Search for a seed track, and our engine will map its DNA.
        </motion.p>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          <SearchBar onSelect={handleSelectTrack} disabled={isAnalyzing} />
        </motion.div>
      </div>

      <main className="max-w-7xl mx-auto px-6 z-10 relative">
        <AnimatePresence mode="wait">
          {error && (
             <motion.div 
               key="error"
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 text-center text-sm"
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
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
               <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
               <div className="flex flex-col items-center text-center">
                 <p className="text-sm font-medium text-slate-700">Processing Request</p>
                 <p className="text-[10px] tracking-widest font-mono uppercase text-slate-400 mt-2">
                   Mapping sonic architecture
                 </p>
               </div>
            </motion.div>
          )}

          {curationData && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }}
              className="space-y-24 mt-8"
            >
              
              {/* Active Track Section */}
              {selectedTrack && (
                <div className="pt-4 flex flex-col gap-12">
                  <TrackHeroVinyl
                    track={selectedTrack} 
                    analysis={curationData.source_track_analysis} 
                    playingUrl={playingUrl} 
                    onPlayToggle={handlePlayToggle} 
                  />
                  
                  {/* Track Details Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-6 shadow-sm">
                    {/* Lyrical Meaning */}
                    <div>
                      <span className="block text-xs font-bold tracking-widest text-slate-900 uppercase mb-2">Lyrical Meaning</span>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {curationData.source_track_analysis.lyrical_meaning}
                      </p>
                    </div>
                    
                    {/* Genres */}
                    <div>
                      <span className="block text-xs font-bold tracking-widest text-slate-900 uppercase mb-2">Genres</span>
                      <div className="flex flex-wrap gap-2">
                        {curationData.source_track_analysis.genres?.map((genre, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700 font-medium">
                            {genre}
                          </span>
                        )) || <span className="text-slate-400 text-sm italic">Unknown</span>}
                      </div>
                    </div>

                    {/* Music Credits */}
                    <div>
                      <span className="block text-xs font-bold tracking-widest text-slate-900 uppercase mb-2">Music Credits</span>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {curationData.source_track_analysis.credits}
                      </p>
                    </div>

                    {/* Public Opinion */}
                    <div>
                      <span className="block text-xs font-bold tracking-widest text-slate-900 uppercase mb-2">Public Opinion</span>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {curationData.source_track_analysis.public_opinion}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full h-px bg-slate-200" />

              {/* Mood Matches */}
              {curationData.mood_matches && curationData.mood_matches.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-6 max-w-7xl mx-auto"
                >
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] tracking-widest font-mono uppercase text-slate-400 mb-1">01 / MOOD RESONANCE</span>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Emotional & Atmospheric Profiles</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 pt-4">
                    {curationData.mood_matches.slice(0, 6).map((rec, i) => (
                      <VinylCard
                        key={`${rec.title}-${rec.artist}`}
                        title={rec.title}
                        artist={rec.artist}
                        match_rationale={rec.match_rationale}
                        spotifyId={rec.spotifyId}
                        previewUrl={rec.previewUrl}
                        badge="Mood Match"
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                        index={i}
                        albumArt={rec.albumArt}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Genre Matches */}
              {curationData.genre_matches && curationData.genre_matches.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6 max-w-7xl mx-auto pt-8 border-t border-slate-100"
                >
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] tracking-widest font-mono uppercase text-slate-400 mb-1">02 / SONIC TWINS</span>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Micro-genres & Instrumentation</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 pt-4">
                    {curationData.genre_matches.slice(0, 6).map((rec, i) => (
                      <VinylCard
                        key={`${rec.title}-${rec.artist}`}
                        title={rec.title}
                        artist={rec.artist}
                        match_rationale={rec.match_rationale}
                        spotifyId={rec.spotifyId}
                        previewUrl={rec.previewUrl}
                        badge={rec.subgenre || "Genre Match"}
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                        index={i}
                        albumArt={rec.albumArt}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Artist Universe */}
              {curationData.artist_universe_matches && curationData.artist_universe_matches.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-6 max-w-7xl mx-auto pt-8 border-t border-slate-100"
                >
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] tracking-widest font-mono uppercase text-slate-400 mb-1">03 / ARTIST UNIVERSE</span>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Collaborators & Deep Cuts</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 pt-4">
                    {curationData.artist_universe_matches.slice(0, 6).map((rec, i) => (
                      <VinylCard
                        key={`${rec.title}-${rec.artist}`}
                        title={rec.title}
                        artist={rec.artist}
                        match_rationale={rec.match_rationale}
                        spotifyId={rec.spotifyId}
                        previewUrl={rec.previewUrl}
                        badge={rec.connection_type || "Artist Match"}
                        playingUrl={playingUrl}
                        onPlayToggle={handlePlayToggle}
                        index={i}
                        albumArt={rec.albumArt}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
