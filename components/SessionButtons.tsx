import React from 'react';
import type { Session } from '../types';
import { ClockIcon } from './icons';

interface SessionButtonsProps {
  sessions: Session[];
  selectedSession: string;
  onSelectSession: (sessionId: string) => void;
  loading: boolean;
  disabled: boolean;
  disabledText: string;
}

const SessionButtons: React.FC<SessionButtonsProps> = ({ sessions, selectedSession, onSelectSession, loading, disabled, disabledText }) => {

  const formatSessionName = (session: Session): string => {
    let formattedType = session.type.charAt(0).toUpperCase() + session.type.slice(1).toLowerCase();
    formattedType = formattedType.replace(/_/g, ' ');
    if (session.number !== null) {
      return `${formattedType} ${session.number}`;
    }
    return formattedType;
  };

  return (
    <div className="w-full">
      <label className="block mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
        <ClockIcon className="h-4 w-4 mr-2" />
        Sesión
      </label>
      <div className="relative min-h-[40px] flex items-center">
        {loading && (
          <div className="flex items-center text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-3"></div>
            Cargando Sesiones...
          </div>
        )}
        {!loading && disabled && (
          <p className="text-gray-500 italic text-sm">
            {disabledText}
          </p>
        )}
        {!loading && !disabled && sessions.length === 0 && (
          <p className="text-gray-500 italic text-sm">
            No hay Sesiones disponibles para esta selección.
          </p>
        )}
        {!loading && !disabled && sessions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                aria-pressed={selectedSession === session.id}
                className={`
                  px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500
                  ${selectedSession === session.id
                    ? 'bg-red-600 border-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-red-500 hover:text-white'
                  }
                `}
              >
                {formatSessionName(session)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionButtons;
