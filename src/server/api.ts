import { Router } from "express";
import { getSpotifyToken } from "./spotify.js";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

export const apiRouter = Router();

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON Schema for Gemini
const curationSchema = {
  type: Type.OBJECT,
  properties: {
    source_track_analysis: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        artist: { type: Type.STRING },
        lyrical_meaning: { type: Type.STRING, description: "A concise 2-3 sentence explanation of the song's themes, story, or message." },
        genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-4 specific genres or subgenres." },
        credits: { type: Type.STRING, description: "A brief string detailing known primary producers, writers, or featured artists." },
        public_opinion: { type: Type.STRING, description: "A 1-2 sentence summary of the song's critical reception, cultural impact, or fan consensus." },
        bpm_and_rhythm: { type: Type.STRING, description: "BPM and rhythm tag, e.g. '120 BPM - Four-on-the-floor'" }
      },
      required: ["title", "artist", "lyrical_meaning", "genres", "credits", "public_opinion", "bpm_and_rhythm"]
    },
    mood_matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          match_rationale: { type: Type.STRING },
          spotifyId: { type: Type.STRING, description: "Optional Spotify ID" },
          previewUrl: { type: Type.STRING, description: "Optional Spotify Preview URL" }
        },
        required: ["title", "artist", "match_rationale"]
      }
    },
    genre_matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          subgenre: { type: Type.STRING },
          match_rationale: { type: Type.STRING },
          spotifyId: { type: Type.STRING, description: "Optional Spotify ID" },
          previewUrl: { type: Type.STRING, description: "Optional Spotify Preview URL" }
        },
        required: ["title", "artist", "subgenre", "match_rationale"]
      }
    },
    artist_universe_matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          connection_type: { 
            type: Type.STRING,
            description: "Must be one of: 'Deep Cut', 'Collaborator / Producer Link', 'Aesthetic Contemporary'"
          },
          match_rationale: { type: Type.STRING },
          spotifyId: { type: Type.STRING, description: "Optional Spotify ID" },
          previewUrl: { type: Type.STRING, description: "Optional Spotify Preview URL" }
        },
        required: ["title", "artist", "connection_type", "match_rationale"]
      }
    }
  },
  required: ["source_track_analysis", "mood_matches", "genre_matches", "artist_universe_matches"]
};

const systemInstruction = `You are an elite musicologist and audio-profile analyst. Your objective is to ingest a single song and artist provided by the user, dissect its sonic anatomy using deep reasoning, and output a highly specific curation package strictly in JSON format.

First, analyze the input track's architecture:
- Identify structural anomalies (e.g., mid-song beat switches, tempo shifts, phase changes).
- Deconstruct the emotional dissonance, vocal chain (e.g., dry vs. tape-saturated), reverb space, and rhythm velocity.

Then, curate three distinct matching buckets. Provide EXACTLY 6 recommended tracks for each bucket (18 total recommendations):
1. Mood & Atmosphere Matches: Songs with exact emotional resonance, dynamic pacing, and sonic grain. If the input has a beat-switch, provide matches for both halves of the track. Provide exactly 6 matches.
2. Genre & Micro-Genre Matches: Bypass surface genres. Classify into specific micro-genres (e.g., Hypnagogic Pop, PBR&B, Ambient Trap) and match based on drum programming and synth architecture. Provide exactly 6 matches.
3. Artist Universe Matches: Deep cuts/B-sides from the input artist, plus tracks by primary producers, frequent session musicians, or kindred-spirit contemporaries. Provide exactly 6 matches.

Curatorial Guardrails:
- No generic Top-40 commercial hits unless they are undeniable sonic twins. Prioritize critically acclaimed, underground, or cult-classic records.
- For every recommendation, provide a 1-to-2 sentence technical rationale highlighting concrete instrumentation or production elements.
- Output data strictly conforming to the defined JSON response schema.`;

apiRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
       res.status(400).json({ error: "Missing query parameter 'q'" });
       return;
    }

    let token: string;
    try {
        token = await getSpotifyToken();
    } catch (e: any) {
        console.warn("Spotify Token Warning: Missing credentials.", e.message);
        res.status(401).json({ error: "Failed to authenticate with Spotify. Please configure your API keys." });
        return;
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const results = data.tracks.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists.map((a: any) => a.name).join(', '),
      albumArt: item.album.images[0]?.url || null,
      previewUrl: item.preview_url || null
    }));

    res.json(results);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

apiRouter.post("/curate", async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!title || !artist) {
       res.status(400).json({ error: "Missing title or artist" });
       return;
    }

    // 1. Generate JSON with Gemini
    let aiResponse;
    let retries = 3;
    let delay = 1500;
    
    while (true) {
      try {
        aiResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Song Title: ${title}\nArtist: ${artist}`,
          config: {
            systemInstruction,
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: curationSchema
          }
        });
        break;
      } catch (e: any) {
        if (retries > 0 && (e.status === 503 || e.status === 'UNAVAILABLE' || e.message?.includes('503') || e.message?.includes('high demand'))) {
          console.warn(`Gemini API overloaded. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          throw e;
        }
      }
    }

    const text = aiResponse.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }
    
    const curationData = JSON.parse(text);

    // 2. Hydrate with Spotify IDs
    let token: string;
    try {
        token = await getSpotifyToken();
    } catch (e: any) {
        console.warn("Spotify Token Warning: Missing credentials. Skipping hydration.");
        // Return the unhydrated data if Spotify fails, so the app still works partially
        res.json(curationData);
        return;
    }

    const hydrateTracks = async (tracks: any[]) => {
      if (!tracks) return;
      for (const track of tracks) {
         const query = `track:${track.title} artist:${track.artist}`;
         try {
           const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
             headers: {
               'Authorization': `Bearer ${token}`
             }
           });
           if (spotifyResponse.ok) {
             const data = await spotifyResponse.json();
             if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
               track.spotifyId = data.tracks.items[0].id;
               if (data.tracks.items[0].preview_url) {
                 track.previewUrl = data.tracks.items[0].preview_url;
               }
               if (data.tracks.items[0].album?.images?.length > 0) {
                 track.albumArt = data.tracks.items[0].album.images[0].url;
               }
             }
           }
         } catch(e) {
           console.error(`Failed to hydrate ${track.title}`, e);
         }
      }
    };

    await Promise.all([
      hydrateTracks(curationData.mood_matches),
      hydrateTracks(curationData.genre_matches),
      hydrateTracks(curationData.artist_universe_matches)
    ]);

    res.json(curationData);

  } catch (error: any) {
    console.error('Curate error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});
