import type { Season, Category, Event, Session, ClassificationResponse } from '../types';

const BASE_URL = 'https://api.motogp.pulselive.com/motogp/v1/results';
const CORS_PROXY = 'https://corsproxy.io/?';

export const getSeasons = async (): Promise<Season[]> => {
  try {
    const url = `${BASE_URL}/seasons`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: Season[] = await response.json();
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
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: Category[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch categories for season ${seasonId}:`, error);
    return [];
  }
};

export const getEvents = async (seasonId: string): Promise<Event[]> => {
  if (!seasonId) return [];
  try {
    const url = `${BASE_URL}/events?seasonUuid=${seasonId}&isFinished=true`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: Event[] = await response.json();
    // Filter out events that are tests, as requested
    return data.filter(event => !event.test);
  } catch (error) {
    console.error(`Failed to fetch events for season ${seasonId}:`, error);
    return [];
  }
};

export const getSessions = async (eventId: string, categoryId: string): Promise<Session[]> => {
  if (!eventId || !categoryId) return [];
  try {
    const url = `${BASE_URL}/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: Session[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch sessions for event ${eventId} and category ${categoryId}:`, error);
    return [];
  }
};

export const getClassification = async (sessionId: string): Promise<ClassificationResponse> => {
  if (!sessionId) return { classification: [] };
  try {
    const url = `${BASE_URL}/session/${sessionId}/classification?test=false`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data: ClassificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch classification for session ${sessionId}:`, error);
    return { classification: [] };
  }
};