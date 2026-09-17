import 'dotenv/config';

let cachedToken: string | null = null;
let tokenExpirationTime: number | null = null;
let cachedClientId: string | null = null;

export async function getSpotifyToken(headerClientId?: string, headerClientSecret?: string): Promise<string> {
  const clientId = headerClientId || process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = headerClientSecret || process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.');
  }

  // Check if we have a valid cached token
  if (cachedToken && tokenExpirationTime && cachedClientId === clientId && Date.now() < tokenExpirationTime) {
    return cachedToken;
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
  
  cachedToken = data.access_token;
  cachedClientId = clientId;
  // Expire 5 minutes before actual expiration to be safe
  tokenExpirationTime = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken!;
}
