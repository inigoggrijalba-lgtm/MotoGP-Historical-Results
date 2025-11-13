import type { Season, Category, Event, Session, ClassificationResponse, LiveTimingResponse } from '../types';

const BASE_URL = 'https://api.motogp.pulselive.com/motogp/v1/results';
const LIVE_TIMING_URL = 'https://api.motogp.pulselive.com/motogp/v1/timing-gateway/livetiming-lite';
// Switched to a more reliable CORS proxy to ensure stability.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const fetchWithProxy = async <T>(url: string): Promise<T> => {
    // We must encode the target URL for this proxy to work correctly.
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} for URL: ${url}`);
    }
    return response.json() as Promise<T>;
};


export const getSeasons = async (): Promise<Season[]> => {
  try {
    const url = `${BASE_URL}/seasons`;
    const data = await fetchWithProxy<Season[]>(url);
    // Sort seasons in descending order by year for better UX
    return data.sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error('Failed to fetch seasons:', error);
    // Return empty array on failure to prevent app crash
    return [];
  }
};

export const getCategories = async (seasonId: string): Promise<Category[]> => {
  if (!seasonId) return [];
  try {
    const url = `${BASE_URL}/categories?seasonUuid=${seasonId}`;
    return await fetchWithProxy<Category[]>(url);
  } catch (error) {
    console.error(`Failed to fetch categories for season ${seasonId}:`, error);
    return [];
  }
};

export const getEvents = async (seasonId: string): Promise<Event[]> => {
  if (!seasonId) return [];
  try {
    const url = `${BASE_URL}/events?seasonUuid=${seasonId}&isFinished=true`;
    const data = await fetchWithProxy<Event[]>(url);
    // Filter out events that are tests, as requested
    return data.filter(event => !event.test);
  } catch (error) {
    console.error(`Failed to fetch events for season ${seasonId}:`, error);
    return [];
  }
};

// Reverted: Fetches sessions for a specific event AND category.
export const getSessions = async (eventId: string, categoryId: string): Promise<Session[]> => {
  if (!eventId || !categoryId) return [];
  try {
    const url = `${BASE_URL}/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`;
    return await fetchWithProxy<Session[]>(url);
  } catch (error) {
    console.error(`Failed to fetch sessions for event ${eventId} and category ${categoryId}:`, error);
    return [];
  }
};

export const getClassification = async (sessionId: string): Promise<ClassificationResponse> => {
  if (!sessionId) return { classification: [] };
  try {
    const url = `${BASE_URL}/session/${sessionId}/classification?test=false`;
    return await fetchWithProxy<ClassificationResponse>(url);
  } catch (error)
  {
    console.error(`Failed to fetch classification for session ${sessionId}:`, error);
    return { classification: [] };
  }
};

export const getLiveTiming = async (): Promise<LiveTimingResponse | null> => {
  try {
    const data = await fetchWithProxy<LiveTimingResponse>(LIVE_TIMING_URL);
    // The API might return an empty object if no session is live.
    // We check for the 'riders' property to confirm it's a valid session.
    if (data && data.riders) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch live timing data:', error);
    // The API often returns 404 when no session is live, so we treat it as "no session"
    // instead of a critical error.
    return null;
  }
};