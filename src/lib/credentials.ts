// Unified credential resolver
export function getCredentials() {
  // 1. Check Env Vars (Vite or Next.js)
  const envGemini = import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_GEMINI_API_KEY : '');
  const envSpotifyId = import.meta.env?.VITE_SPOTIFY_CLIENT_ID || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SPOTIFY_CLIENT_ID : '');
  const envSpotifySecret = import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET : '');

  // 2. Fallback to localStorage
  const localGemini = localStorage.getItem('gemini_api_key') || '';
  const localSpotifyId = localStorage.getItem('spotify_client_id') || '';
  const localSpotifySecret = localStorage.getItem('spotify_client_secret') || '';

  return {
    geminiKey: envGemini || localGemini,
    spotifyClientId: envSpotifyId || localSpotifyId,
    spotifyClientSecret: envSpotifySecret || localSpotifySecret
  };
}
