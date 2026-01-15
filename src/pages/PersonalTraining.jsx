
import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Dumbbell, Settings, UserCheck, Star, Trophy, Users, Save } from 'lucide-react';

const PersonalTraining = () => {
    const { members, ptSettings, setPtSettings, ptSubscriptions, setPtSubscriptions } = useGym();
    const [showSettings, setShowSettings] = useState(false);

    // Simple state for user selection
    const [selectedDuration, setSelectedDuration] = useState('one_month');

    // Local state for settings
    const [localSettings, setLocalSettings] = useState({ ...ptSettings.rates });

    React.useEffect(() => {
        setLocalSettings(ptSettings.rates);
    }, [ptSettings]);

    const handleSaveSettings = () => {
        setPtSettings(prev => ({ ...prev, rates: localSettings }));
        alert("Settings Saved Successfully!");
        setShowSettings(false);
    };

    const handleSubscribe = (memberId) => {
        setPtSubscriptions(prev => ({
            ...prev,
            [memberId]: {
                duration: selectedDuration,
                price: ptSettings.rates[selectedDuration],
                active: true,
                startDate: new Date().toLocaleDateString()
            }
        }));
    };

    const durations = [
        { id: 'one_month', name: '1 Month', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'six_months', name: '6 Months', icon: Star, color: 'text-gym-neon', bg: 'bg-gym-neon/10' },
        { id: 'one_year', name: '1 Year', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dumbbell className="text-gym-neon" size={32} />
                        Personal Training
                    </h2>
                    <p className="text-gray-400 mt-1">Duration-based Personal Training Subscriptions</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all border border-white/10"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Admin Settings */}
            {showSettings && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4">Rate Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">1 Month (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.one_month}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, one_month: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">6 Months (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.six_months}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, six_months: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-gray-400 text-sm">1 Year (PKR)</label>
                            <input
                                type="number"
                                value={localSettings.one_year}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, one_year: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="bg-gym-neon text-black px-6 py-2 rounded-xl font-bold hover:bg-[#2ecc11] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Select Duration */}
                <div className="lg:col-span-1 bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 p-6 h-fit">
                    <h3 className="text-xl font-bold text-white mb-4">1. Select Duration</h3>
                    <div className="space-y-4">
                        {durations.map((d) => (
                            <div
                                key={d.id}
                                onClick={() => setSelectedDuration(d.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedDuration === d.id
                                    ? 'bg-white/10 border-gym-neon'
                                    : 'bg-transparent border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full ${d.bg} flex items-center justify-center ${d.color}`}>
                                        <d.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{d.name}</h4>
                                        <div className="text-sm font-bold text-gym-neon">Rs. {ptSettings.rates[d.id].toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Assign to Members */}
                <div className="lg:col-span-2 bg-gym-card backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">2. Assign to Members</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-sm">
                                    <th className="px-6 py-4 font-medium">Member</th>
                                    <th className="px-6 py-4 font-medium">Current Plan</th>
                                    <th className="px-6 py-4 font-medium">Start Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {members.map((member) => {
                                    const sub = ptSubscriptions[member.id];
                                    return (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium">{member.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sub ? (
                                                    <div className="flex items-center gap-2">
                                                        <Star size={14} className="text-gym-neon" />
                                                        <span className="text-white capitalize">{durations.find(d => d.id === sub.duration)?.name || sub.duration}</span>
                                                    </div>
                                                ) : <span className="text-gray-500 text-sm italic">None</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {sub ? sub.startDate : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {sub ? (
                                                    <button
                                                        onClick={() => setPtSubscriptions(prev => {
                                                            const next = { ...prev };
                                                            delete next[member.id];
                                                            return next;
                                                        })}
                                                        className="text-red-400 hover:text-red-300 text-xs font-bold"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSubscribe(member.id)}
                                                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Assign {durations.find(d => d.id === selectedDuration)?.name}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalTraining;
