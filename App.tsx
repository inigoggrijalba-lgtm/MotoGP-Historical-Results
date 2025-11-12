import React, { useState, useEffect } from 'react';
import type { Season, Category, Event, Session, Classification } from './types';
import { getSeasons, getCategories, getEvents, getSessions, getClassification } from './services/motogpApi';
import Select from './components/Select';
import { CalendarIcon, MotorcycleIcon, FlagIcon, ClockIcon } from './components/icons';
import ResultsTable from './components/ResultsTable';

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
  }, [selectedSeason]);

  useEffect(() => {
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
  }, [selectedEvent, selectedCategory]);

  useEffect(() => {
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
  }, [selectedSession]);

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
  
  const formatSessionName = (session: Session): string => {
    if (session.type === 'RACE') {
      return session.type;
    }
    if (session.number !== null) {
      return `${session.type}${session.number}`;
    }
    return session.type;
  };

  const sessionOptions = sessions.map(session => ({
    value: session.id,
    label: formatSessionName(session)
  }));

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };
  
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(e.target.value);
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
  
  const getSessionPlaceholder = () => {
    if (loadingSessions) return 'Cargando Sesiones...';
    if (!selectedEvent || !selectedCategory) return 'Seleccione Evento y Categoría';
    if (!loadingSessions && sessions.length === 0) return 'No hay Sesiones';
    return 'Seleccione Sesión';
  };

  const selectedSeasonYear = seasons.find(s => s.id === selectedSeason)?.year;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
            MotoGP™ Historical Results
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Explore race results from the world's premier motorcycle racing championship.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Select
                  label="Sesión"
                  value={selectedSession}
                  onChange={handleSessionChange}
                  options={sessionOptions}
                  placeholder={getSessionPlaceholder()}
                  disabled={!selectedEvent || !selectedCategory || loadingSessions || sessions.length === 0}
                  Icon={ClockIcon}
                />
              </div>
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

        </main>
      </div>
    </div>
  );
};

export default App;