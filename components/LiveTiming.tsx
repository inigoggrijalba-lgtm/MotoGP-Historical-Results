import React, { useState, useEffect } from 'react';
import { getLiveTiming } from '../services/motogpApi';
import type { LiveTimingResponse } from '../types';

const LiveTiming: React.FC = () => {
    const [data, setData] = useState<LiveTimingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Keep loading true for the very first fetch
            if (loading) {
                 try {
                    const liveData = await getLiveTiming();
                    if (liveData) {
                        setData(liveData);
                        setError(null);
                    } else {
                        setData(null);
                        setError('No live timing session currently active.');
                    }
                } catch (err) {
                    setError('Failed to fetch live timing data.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else { // For subsequent fetches, don't show the main spinner
                 try {
                    const liveData = await getLiveTiming();
                     if (liveData) {
                        setData(liveData);
                        setError(null);
                    } else {
                         // If a session was active and now it's not, show the message.
                        setData(null);
                        setError('The live timing session has ended.');
                    }
                } catch (err) {
                    // Don't necessarily set a hard error if polling fails once
                    console.error('Polling for live timing data failed.', err);
                }
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <p className="ml-4 text-gray-300 text-lg">Connecting to Live Timing...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center text-yellow-300 bg-yellow-900/50 p-6 rounded-lg mt-8 border border-yellow-700">
                <p className="font-bold text-lg">Live Timing Unavailable</p>
                <p>{error || 'No data received from the live timing service.'}</p>
            </div>
        );
    }

    const { category, track, session_status, laps_to_go, track_condition, air_temp, track_temp, humidity, riders } = data;

    const renderRiderStatus = (status: string) => {
        const isPit = status === 'IN PIT';
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPit ? 'bg-yellow-600 text-yellow-100' : 'bg-green-600 text-green-100'}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            {/* Header Info */}
            <div className="p-4 bg-gray-700/50 border-b border-gray-600">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">{category.name} - {track.name}</h2>
                        <p className="text-red-400 font-semibold">{session_status.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                         {laps_to_go > 0 && <p className="text-lg font-bold">{laps_to_go} Laps to go</p>}
                         <p className="text-sm text-gray-300 capitalize">{track_condition.toLowerCase().replace('_', ' ')}</p>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                    <span><strong>Air:</strong> {air_temp}°C</span>
                    <span><strong>Track:</strong> {track_temp}°C</span>
                    <span><strong>Humidity:</strong> {humidity}%</span>
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center">Pos</th>
                            <th scope="col" className="px-2 py-3 text-center">Num</th>
                            <th scope="col" className="px-6 py-3">Rider</th>
                            <th scope="col" className="px-6 py-3">Bike</th>
                            <th scope="col" className="px-4 py-3">Gap</th>
                            <th scope="col" className="px-4 py-3">Interval</th>
                            <th scope="col" className="px-4 py-3">Last Lap</th>
                             <th scope="col" className="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.map((rider) => (
                            <tr key={rider.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 ease-in-out">
                                <td className="px-4 py-4 font-medium text-white text-center">{rider.position}</td>
                                <td className="px-2 py-4 text-center">{rider.number}</td>
                                <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{rider.full_name}</td>
                                <td className="px-6 py-4">{rider.bike}</td>
                                <td className="px-4 py-4">{rider.gap}</td>
                                <td className="px-4 py-4">{rider.interval}</td>
                                <td className="px-4 py-4">{rider.last_lap}</td>
                                <td className="px-4 py-4 text-center">{renderRiderStatus(rider.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LiveTiming;