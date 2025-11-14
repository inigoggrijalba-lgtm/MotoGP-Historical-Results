import React, { useState, useEffect } from 'react';
import type { Season, Category, Event, Session, Classification } from './types';
import { getSeasons, getCategories, getEvents, getSessions, getClassification } from './services/motogpApi';
import Select from './components/Select';
import { CalendarIcon, MotorcycleIcon, FlagIcon, LiveIcon, MotoTimingLogo } from './components/icons';
import ResultsTable from './components/ResultsTable';
import SessionButtons from './components/SessionButtons';
import LiveTiming from './components/LiveTiming';

const App: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);

  const [classification, setClassification] = useState<Classification[]>([]);
  const [loadingClassification, setLoadingClassification] = useState<boolean>(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  
  const [view, setView] = useState<'historical' | 'live'>('historical');


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const seasonsData = await getSeasons();
        if (seasonsData.length > 0) {
          setSeasons(seasonsData);
          const currentSeason = seasonsData.find(s => s.current) || seasonsData[0];
          setSelectedSeason(currentSeason.id);
        } else {
            setError('Could not load season data. The API might be unavailable.');
        }
      } catch (err) {
        setError('An error occurred while fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (view === 'live') return;
    const fetchCategoriesAndEvents = async () => {
      if (!selectedSeason) {
        setCategories([]);
        setSelectedCategory('');
        setEvents([]);
        setSelectedEvent('');
        return;
      }

      try {
        setLoadingCategories(true);
        setSelectedCategory('');
        const categoriesData = await getCategories(selectedSeason);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingEvents(true);
        setSelectedEvent('');
        const eventsData = await getEvents(selectedSeason);
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchCategoriesAndEvents();
  }, [selectedSeason, view]);

  useEffect(() => {
    if (view === 'live') return;
    const fetchSessions = async () => {
      if (!selectedEvent || !selectedCategory) {
        setSessions([]);
        setSelectedSession('');
        return;
      }

      try {
        setLoadingSessions(true);
        setSelectedSession('');
        const sessionsData = await getSessions(selectedEvent, selectedCategory);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [selectedEvent, selectedCategory, view]);

  useEffect(() => {
    if (view === 'live') return;
    const fetchClassification = async () => {
      if (!selectedSession) {
        setClassification([]);
        return;
      }
      try {
        setLoadingClassification(true);
        setClassificationError(null);
        const classificationData = await getClassification(selectedSession);
        setClassification(classificationData.classification);
      } catch (err) {
        setClassificationError('Failed to load classification data.');
        console.error('Failed to fetch classification:', err);
        setClassification([]);
      } finally {
        setLoadingClassification(false);
      }
    };
    fetchClassification();
  }, [selectedSession, view]);

  const seasonOptions = seasons.map(season => ({
    value: season.id,
    label: season.year.toString()
  }));

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const eventOptions = events.map(event => ({
    value: event.id,
    label: event.sponsored_name
  }));

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSession(''); // Reset session when category changes
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };
  
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
  };

  const getCategoryPlaceholder = () => {
    if (loadingCategories) return 'Cargando Categorías...';
    if (!selectedSeason) return 'Seleccione una Temporada';
    if (!loadingCategories && categories.length === 0) return 'No hay Categorías';
    return 'Seleccione Categoría';
  };

  const getEventPlaceholder = () => {
    if (loadingEvents) return 'Cargando Eventos...';
    if (!selectedSeason) return 'Seleccione una Temporada';
    if (!loadingEvents && events.length === 0) return 'No hay Eventos';
    return 'Seleccione Evento';
  };
  
  const getSessionDisabledText = () => {
    if (!selectedEvent || !selectedCategory) return 'Seleccione Evento y Categoría para ver las sesiones.';
    return '';
  };

  const selectedSeasonYear = seasons.find(s => s.id === selectedSeason)?.year;

  return (
    <div className="min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
         <header className="flex justify-end items-center mb-8 md:mb-12">
           <button
              onClick={() => setView(v => v === 'historical' ? 'live' : 'historical')}
              className="relative inline-flex items-center gap-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors duration-200"
            >
              <LiveIcon className={`h-2 w-2 ${view === 'historical' ? 'animate-pulse' : ''}`} />
              {view === 'historical' ? 'Live Timing' : 'Back to History'}
            </button>
        </header>


        <main>
          {view === 'historical' ? (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
                 <div className="mb-4">
                    <h2 className="text-xl font-bold">Historical Results</h2>
                    <p className="text-gray-400">Explore past race results from the world's premier motorcycle racing championship.</p>
                </div>
                {loading && (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    <p className="ml-4 text-gray-300">Loading Seasons...</p>
                  </div>
                )}
                {error && !loading && (
                  <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Select
                        label="Temporada"
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        options={seasonOptions}
                        placeholder="Select a Season"
                        Icon={CalendarIcon}
                      />
                      <Select
                        label="Categoría"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        placeholder={getCategoryPlaceholder()}
                        disabled={!selectedSeason || loadingCategories || categories.length === 0}
                        Icon={MotorcycleIcon}
                      />
                      <Select
                        label="Evento"
                        value={selectedEvent}
                        onChange={handleEventChange}
                        options={eventOptions}
                        placeholder={getEventPlaceholder()}
                        disabled={!selectedSeason || loadingEvents || events.length === 0}
                        Icon={FlagIcon}
                      />
                    </div>
                    <div className="mt-6">
                      <SessionButtons
                        sessions={sessions}
                        selectedSession={selectedSession}
                        onSelectSession={handleSessionSelect}
                        loading={loadingSessions}
                        disabled={!selectedEvent || !selectedCategory}
                        disabledText={getSessionDisabledText()}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-8">
                <ResultsTable 
                  data={classification} 
                  loading={loadingClassification} 
                  error={classificationError}
                  hasSelectedSession={!!selectedSession}
                  seasonYear={selectedSeasonYear}
                />
              </div>
            </>
          ) : (
            <LiveTiming />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;