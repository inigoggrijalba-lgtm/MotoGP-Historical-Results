import React from 'react';
import type { Classification } from '../types';

interface ResultsTableProps {
  data: Classification[];
  loading: boolean;
  error: string | null;
  hasSelectedSession: boolean;
  seasonYear?: number;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, loading, error, hasSelectedSession, seasonYear }) => {
  if (!hasSelectedSession) {
    return (
      <div className="mt-8 text-center text-gray-500">
        <p>Select filters to view results.</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="ml-4 text-gray-300 text-lg">Loading Results...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg mt-8 border border-red-700">
          <p className="font-bold text-lg">Error</p>
          <p>{error}</p>
        </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="text-center text-gray-400 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-8 border border-gray-700">
            <p>No classification data available for this session.</p>
        </div>
    );
  }
  
  const isOldSeason = seasonYear && seasonYear < 2005;

  if (isOldSeason) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center">Pos</th>
                            <th scope="col" className="px-6 py-3">Rider</th>
                            <th scope="col" className="px-6 py-3">Constructor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 ease-in-out">
                                <td className="px-4 py-4 font-medium text-white text-center">{item.position}</td>
                                <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{item.rider.full_name}</td>
                                <td className="px-6 py-4">{item.constructor.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }


  const isRaceOrSprint = data.length > 0 && data[0].points !== undefined;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-center">Pos</th>
                        <th scope="col" className="px-6 py-3">Rider</th>
                        <th scope="col" className="px-2 py-3 text-center">Num</th>
                        <th scope="col" className="px-2 py-3 text-center">Country</th>
                        <th scope="col" className="px-6 py-3">Team</th>
                        <th scope="col" className="px-6 py-3">Constructor</th>
                         {isRaceOrSprint ? (
                          <>
                            <th scope="col" className="px-4 py-3">Time</th>
                            <th scope="col" className="px-2 py-3 text-center">Laps</th>
                            <th scope="col" className="px-2 py-3 text-center">Points</th>
                            <th scope="col" className="px-4 py-3">Gap</th>
                          </>
                        ) : (
                          <>
                            <th scope="col" className="px-4 py-3">Best Lap</th>
                            <th scope="col" className="px-2 py-3 text-center">Laps</th>
                            <th scope="col" className="px-4 py-3">Top Speed</th>
                            <th scope="col" className="px-4 py-3">Gap</th>
                          </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 ease-in-out">
                            <td className="px-4 py-4 font-medium text-white text-center">{item.position}</td>
                            <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{item.rider.full_name}</td>
                            <td className="px-2 py-4 text-center">{item.rider.number}</td>
                            <td className="px-2 py-4 text-center">{item.rider.country.iso}</td>
                            <td className="px-6 py-4">{item.team.name}</td>
                            <td className="px-6 py-4">{item.constructor.name}</td>
                            {isRaceOrSprint ? (
                              <>
                                <td className="px-4 py-4">{item.time || 'N/A'}</td>
                                <td className="px-2 py-4 text-center">{item.total_laps}</td>
                                <td className="px-2 py-4 text-center">{item.points}</td>
                                <td className="px-4 py-4">{item.gap.first}</td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-4">{item.best_lap?.time || 'N/A'}</td>
                                <td className="px-2 py-4 text-center">{item.total_laps}</td>
                                <td className="px-4 py-4">{item.top_speed ? `${item.top_speed} km/h` : 'N/A'}</td>
                                <td className="px-4 py-4">{item.gap.first}</td>
                              </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ResultsTable;