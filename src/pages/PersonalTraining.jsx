import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Settings, UserCheck, DollarSign, Dumbbell } from 'lucide-react';

const PersonalTraining = () => {
    const { members, ptSettings, setPtSettings } = useGym();
    const [showSettings, setShowSettings] = useState(false);

    // Calculator State
    const [sessionConfig, setSessionConfig] = useState({
        trainerLevel: 'certified', // beginner, certified, elite
        packageType: 'session', // session, weekly, monthly
        count: 1, // Number of sessions or weeks/months
        manualDiscount: 0
    });

    const calculateTotal = () => {
        let rate = ptSettings.rates[sessionConfig.trainerLevel] || 0;
        let multiplier = sessionConfig.count;

        // Simple logic: Weekly = 3 sessions/week, Monthly = 12 sessions/month
        if (sessionConfig.packageType === 'weekly') multiplier *= 3;
        if (sessionConfig.packageType === 'monthly') multiplier *= 12;

        let total = rate * multiplier;

        if (ptSettings.manualDiscountAllowed && sessionConfig.manualDiscount > 0) {
            total -= sessionConfig.manualDiscount;
        }

        return Math.max(0, total).toFixed(2);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dumbbell className="text-gym-neon" size={32} />
                        Personal Training
                    </h2>
                    <p className="text-gray-400 mt-1">Trainer billing and session management</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${showSettings ? 'bg-gym-neon text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                    <Settings size={20} />
                    Admin Settings
                </button>
            </div>

            {/* Admin Settings */}
            {showSettings && (
                <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-white mb-4">Trainer Rates Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['beginner', 'certified', 'elite'].map(level => (
                            <div key={level} className="space-y-2">
                                <label className="text-gray-400 text-sm capitalize">{level} Rate ($/session)</label>
                                <input
                                    type="number"
                                    value={ptSettings.rates[level]}
                                    onChange={(e) => setPtSettings(prev => ({
                                        ...prev,
                                        rates: { ...prev.rates, [level]: parseFloat(e.target.value) }
                                    }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Billing Calculator */}
                <div className="bg-gym-card backdrop-blur-xl p-8 rounded-2xl border border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="text-gym-neon" />
                        Billing Calculator
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Trainer Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['beginner', 'certified', 'elite'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSessionConfig(prev => ({ ...prev, trainerLevel: level }))}
                                        className={`py-3 rounded-xl text-sm font-bold capitalize transition-all ${sessionConfig.trainerLevel === level
                                            ? 'bg-gym-neon text-black shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                                            : 'bg-black/30 text-gray-400 hover:text-white'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Package Type</label>
                            <div className="flex bg-black/30 p-1 rounded-xl">
                                {['session', 'weekly', 'monthly'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSessionConfig(prev => ({ ...prev, packageType: type }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${sessionConfig.packageType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                {sessionConfig.packageType === 'session' ? 'Number of Sessions' : 'Duration (Weeks/Months)'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={sessionConfig.count}
                                onChange={(e) => setSessionConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                            />
                        </div>

                        {ptSettings.manualDiscountAllowed && (
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Custom Discount ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={sessionConfig.manualDiscount}
                                    onChange={(e) => setSessionConfig(prev => ({ ...prev, manualDiscount: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-gym-neon outline-none"
                                />
                            </div>
                        )}

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Rate per session</span>
                                <span className="text-white font-mono">${ptSettings.rates[sessionConfig.trainerLevel]}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-white">Total Amount</span>
                                <span className="text-4xl font-bold text-gym-neon">${calculateTotal()}</span>
                            </div>
                        </div>

                        <button className="w-full bg-gym-neon text-black py-4 rounded-xl font-bold text-lg hover:bg-[#2ecc11] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                            Generate Invoice
                        </button>
                    </div>
                </div>

                {/* Info / Packages */}
                <div className="space-y-6">
                    <div className="bg-gym-card backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4">Trainer Tiers</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">🥉</div>
                                <div>
                                    <h4 className="font-bold text-white">Beginner</h4>
                                    <p className="text-sm text-gray-400">1-2 years experience. Focusing on form and consistency.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-xl">🥈</div>
                                <div>
                                    <h4 className="font-bold text-white">Certified</h4>
                                    <p className="text-sm text-gray-400">+3 years experience. Specialized knowledge in hypertrophy/strength.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-glare mb-2 border border-gym-neon/30 rounded-xl bg-gym-neon/5">
                                <div className="w-12 h-12 rounded-full bg-gym-neon/20 flex items-center justify-center text-xl">🥇</div>
                                <div>
                                    <h4 className="font-bold text-white">Elite</h4>
                                    <p className="text-sm text-gray-400">Top tier coaches. Competition prep and advanced programming.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalTraining;
