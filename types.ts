export interface Season {
  id: string;
  name: string | null;
  year: number;
  current: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Circuit {
  id: string;
  name: string;
  place: string;
}

export interface Event {
  id: string;
  name: string;
  short_name: string;
  test: boolean;
  circuit: Circuit;
  sponsored_name: string;
}

export interface Session {
  id: string;
  type: string;
  number: number | null;
  category: {
    id: string;
    name: string;
  };
}

// --- New types for Classification ---

export interface Country {
  iso: string;
  name: string;
}

export interface Rider {
  id: string;
  full_name: string;
  country: Country;
  number: number;
}

export interface Team {
  id: string;
  name: string;
}

export interface Constructor {
  id: string;
  name: string;
}

export interface BestLap {
  number: number;
  time: string;
}

export interface Gap {
  first: string;
  prev?: string;
  lap?: string;
}

export interface Classification {
  id: string;
  position: number;
  rider: Rider;
  team: Team;
  constructor: Constructor;
  total_laps: number;
  gap: Gap;
  status: string;
  // Optional fields for practice/qualifying
  best_lap?: BestLap;
  top_speed?: number;
  // Optional fields for race/sprint
  time?: string;
  points?: number;
  average_speed?: number;
}

export interface ClassificationResponse {
    classification: Classification[];
}

// --- Types for Live Timing ---

export interface LiveTimingRider {
  id: string;
  position: number;
  number: number;
  full_name: string;
  bike: string;
  gap: string | null;
  interval: string | null;
  last_lap: string | null;
  status: string;
}

export interface LiveTimingResponse {
  riders: LiveTimingRider[];
  session_status: string;
  laps_to_go: number;
  category: {
    id: string;
    name: string;
  };
  track: {
    name: string;
  };
  air_temp: string;
  track_temp: string;
  humidity: string;
  track_condition: string;
}