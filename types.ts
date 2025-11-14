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
  id:string;
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

export interface LiveTimingHead {
  championship_id: string;
  category: string;
  circuit_id: string;
  circuit_name: string;
  global_event_id: string;
  event_id: string;
  event_tv_name: string;
  event_shortname: string;
  date: string;
  datet: number;
  datst: number;
  num_laps: number;
  gmt: string;
  trsid: number;
  session_id: string;
  session_type: number;
  session_name: string;
  session_shortname: string;
  duration: string;
  remaining: string;
  session_status_id: string;
  session_status_name: string;
  date_formated: string;
  url: string | null;
}

export interface LiveTimingRider {
  order: number;
  rider_id: number;
  status_name: string;
  status_id: string;
  rider_number: string;
  color: string;
  text_color: string;
  pos: number;
  rider_shortname: string;
  rider_name: string;
  rider_surname: string;
  lap_time: string;
  num_lap: number;
  last_lap_time: string;
  last_lap: number;
  trac_status: string;
  team_name: string;
  bike_name: string;
  gap_first: string;
  gap_prev: string;
  on_pit: boolean;
}

export interface LiveTimingResponse {
  head: LiveTimingHead;
  rider: { [key: string]: LiveTimingRider };
}