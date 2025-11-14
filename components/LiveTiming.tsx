import React, { useState, useEffect } from 'react';
import { getLiveTiming } from '../services/motogpApi';
import type { LiveTimingResponse, LiveTimingRider } from '../types';
import { ClockIcon, LiveIcon, SpainFlagIcon } from './icons';

const LiveTiming: React.FC = () => {
    const [data, setData] = useState<LiveTimingResponse | null>(null);
    const [processedRiders, setProcessedRiders] = useState<LiveTimingRider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isFirstLoad = true;
        const fetchData = async () => {
            try {
                const liveData = await getLiveTiming();
                if (liveData) {
                    setData(liveData);
                    const ridersArray = Object.values(liveData.rider).sort((a, b) => {
                        const aIsNegative = a.pos < 0;
                        const bIsNegative = b.pos < 0;

                        if (aIsNegative && !bIsNegative) return 1;
                        if (!aIsNegative && bIsNegative) return -1;

                        return a.pos - b.pos;
                    });
                    setProcessedRiders(ridersArray);
                    setError(null);
                } else {
                    setData(null);
                    setProcessedRiders([]);
                    setError(isFirstLoad ? 'No live timing session currently active.' : 'The live timing session has ended.');
                }
            } catch (err) {
                if (isFirstLoad) {
                    setError('Failed to fetch live timing data.');
                }
                console.error('Polling for live timing data failed.', err);
            } finally {
                if (isFirstLoad) {
                    setLoading(false);
                    isFirstLoad = false;
                }
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);
    
    const formatTime = (secondsStr: string): string => {
        let seconds = parseInt(secondsStr, 10);
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatElapsedTime = (durationMsStr: string, remainingSecStr: string): string => {
        const durationSec = parseInt(durationMsStr, 10) / 1000;
        const remainingSec = parseInt(remainingSecStr, 10);
        if (isNaN(durationSec) || isNaN(remainingSec)) return '00:00:00';
        
        let elapsedSec = durationSec - remainingSec;
        if (elapsedSec < 0) elapsedSec = 0;

        const hours = Math.floor(elapsedSec / 3600);
        const minutes = Math.floor((elapsedSec % 3600) / 60);
        const seconds = Math.floor(elapsedSec % 60);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    const renderStatusTag = (text: string, colorClass: string) => (
        <span className={`px-2 py-1 text-xs font-bold rounded ${colorClass}`}>
            {text}
        </span>
    );

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

    const { head } = data;
    const isSessionActive = head.session_status_id === 'S';

    return (
        <div className="bg-[#212121] rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
            <header className="p-4 bg-[#2c2c2c] border-b border-gray-700">
                <div className="flex justify-between items-center">
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Live Timing: <span className="font-normal text-gray-300">{head.category} | {head.session_name}</span>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <LiveIcon className={`h-3 w-3 ${isSessionActive ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                            </div>
                        </div>
                    </div>
                    {/* Right Side */}
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <SpainFlagIcon className="h-4 w-auto rounded-sm" />
                            <h3 className="font-semibold text-white">{head.event_tv_name}</h3>
                        </div>
                        <div className="mt-1 bg-gray-900/80 rounded-md px-3 py-1 inline-block">
                           <p className="text-2xl font-mono font-bold text-white">{formatTime(head.remaining)}</p>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300 font-mono">
                    <thead className="text-xs text-gray-400 uppercase bg-[#2c2c2c]">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-center">P</th>
                            <th scope="col" className="px-4 py-3">Rider</th>
                            <th scope="col" className="px-3 py-3 text-center">#</th>
                            <th scope="col" className="px-4 py-3">Best Lap</th>
                            <th scope="col" className="px-4 py-3 text-center">Lap</th>
                            <th scope="col" className="px-4 py-3">Last Lap</th>
                            <th scope="col" className="px-4 py-3">Gap P.</th>
                            <th scope="col" className="px-4 py-3">Gap F.</th>
                            <th scope="col" className="px-6 py-3">Team</th>
                            <th scope="col" className="px-6 py-3">Bike</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[#212121]">
                        {processedRiders.map((rider) => (
                            <tr key={rider.rider_id} className="border-b border-[#3a3a3a] hover:bg-gray-700/20 transition-colors duration-150">
                                <td className="px-3 py-2 font-bold text-white text-center">{rider.pos > 0 ? rider.pos : ''}</td>
                                <td className="px-4 py-2 font-semibold text-white whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-1 h-5 rounded-full mr-3" style={{ backgroundColor: `#${rider.color}` }}></div>
                                        {`${rider.rider_name} ${rider.rider_surname.toUpperCase()}`}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span className="inline-block px-2 py-1 text-xs font-bold rounded-md" style={{ backgroundColor: `#${rider.color}`, color: `#${rider.text_color}`}}>
                                        {rider.rider_number}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    {rider.on_pit ? renderStatusTag('PIT', 'bg-gray-500 text-white') : rider.lap_time}
                                </td>
                                <td className="px-4 py-2 text-center">{`${rider.num_lap} / ${rider.last_lap}`}</td>
                                <td className="px-4 py-2">{rider.last_lap_time}</td>
                                <td className="px-4 py-2">
                                    {rider.status_name !== "CL" ? renderStatusTag(rider.status_name, 'bg-yellow-600 text-white') : rider.gap_prev}
                                </td>
                                <td className="px-4 py-2">{rider.gap_first}</td>
                                <td className="px-6 py-2 text-gray-400">{rider.team_name}</td>
                                <td className="px-6 py-2 text-gray-400">{rider.bike_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {processedRiders.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-400">
                        <p>Waiting for riders on track...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTiming;