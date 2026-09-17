export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string | null;
  previewUrl?: string | null;
}

export interface SourceTrackAnalysis {
  title: string;
  artist: string;
  lyrical_meaning: string;
  genres: string[];
  credits: string;
  public_opinion: string;
  bpm_and_rhythm: string;
}

export interface MoodMatch {
  title: string;
  artist: string;
  match_rationale: string;
  spotifyId?: string;
  previewUrl?: string;
  albumArt?: string;
}

export interface GenreMatch {
  title: string;
  artist: string;
  subgenre: string;
  match_rationale: string;
  spotifyId?: string;
  previewUrl?: string;
  albumArt?: string;
}

export interface ArtistUniverseMatch {
  title: string;
  artist: string;
  connection_type: "Deep Cut" | "Collaborator / Producer Link" | "Aesthetic Contemporary";
  match_rationale: string;
  spotifyId?: string;
  previewUrl?: string;
  albumArt?: string;
}

export interface CurationData {
  source_track_analysis: SourceTrackAnalysis;
  mood_matches: MoodMatch[];
  genre_matches: GenreMatch[];
  artist_universe_matches: ArtistUniverseMatch[];
}
