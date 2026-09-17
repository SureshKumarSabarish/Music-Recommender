import 'dotenv/config';

// Use globalThis to cache the access token to survive hot-reloads during development
const globalForSpotify = globalThis as unknown as {
  spotifyCachedToken?: string;
  spotifyTokenExpirationTime?: number;
};

export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.');
  }

  // Check if we have a valid cached token and it's not within 60 seconds of expiring
  if (
    globalForSpotify.spotifyCachedToken && 
    globalForSpotify.spotifyTokenExpirationTime && 
    Date.now() < globalForSpotify.spotifyTokenExpirationTime - 60000
  ) {
    return globalForSpotify.spotifyCachedToken;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get Spotify token:', errorText);
    throw new Error(`Spotify auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  globalForSpotify.spotifyCachedToken = data.access_token;
  // Store the exact expiration time (expires_in is usually 3600 seconds)
  globalForSpotify.spotifyTokenExpirationTime = Date.now() + data.expires_in * 1000;

  return globalForSpotify.spotifyCachedToken!;
}
